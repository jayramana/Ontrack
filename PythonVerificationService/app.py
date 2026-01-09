"""
ASR Verification Service with Gemini AI 2.5 Flash
- Aadhaar OCR and validation
- Face matching with DeepFace
- Signature verification
- No QR code scanning required
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
import re
import os
import tempfile
import shutil

# Fix DeepFace directory initialization before import
def init_deepface_directories():
    """Initialize DeepFace directories before importing DeepFace"""
    try:
        home = os.path.expanduser("~")
        deepface_dir = os.path.join(home, ".deepface")
        weights_dir = os.path.join(deepface_dir, "weights")
        
        # Remove if exists as file
        if os.path.exists(deepface_dir) and not os.path.isdir(deepface_dir):
            print(f"⚠️  Removing {deepface_dir} (exists as file, not directory)")
            os.remove(deepface_dir)
        
        # Create directories
        os.makedirs(deepface_dir, exist_ok=True)
        os.makedirs(weights_dir, exist_ok=True)
        print(f"✅ DeepFace directories initialized: {deepface_dir}")
    except Exception as e:
        print(f"⚠️  DeepFace directory init warning: {e}")

# Initialize directories BEFORE importing DeepFace
init_deepface_directories()

from deepface import DeepFace

app = Flask(__name__)
CORS(app)

class FaceMatchVerifier:
    """DeepFace-based face verification"""
    
    def __init__(self):
        self.model_name = 'ArcFace'
        self.distance_metric = 'cosine'
        self.detector_backend = 'opencv'
        print(f"✅ FaceMatchVerifier initialized with {self.model_name}")
    
    def verify_face_match(self, id_image_data, captured_image_data):
        """Compare faces using DeepFace"""
        temp_id_path = None
        temp_captured_path = None

        def crop_face_bytes(image_bytes):
            try:
                nparr = np.frombuffer(image_bytes, np.uint8)
                img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                if img is None:
                    return image_bytes
                
                gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
                face_cascade = cv2.CascadeClassifier(
                    cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
                )
                
                faces = face_cascade.detectMultiScale(
                    gray, scaleFactor=1.1, minNeighbors=4, minSize=(60,60)
                )
                
                if len(faces) == 0:
                    return image_bytes
                
                # Pick largest face
                x, y, w, h = sorted(faces, key=lambda r: r[2]*r[3], reverse=True)[0]
                pad_w = int(w * 0.25)
                pad_h = int(h * 0.25)
                x1 = max(0, x - pad_w)
                y1 = max(0, y - pad_h)
                x2 = min(img.shape[1], x + w + pad_w)
                y2 = min(img.shape[0], y + h + pad_h)
                
                crop = img[y1:y2, x1:x2]
                _, buf = cv2.imencode('.jpg', crop)
                return buf.tobytes()
            except Exception:
                return image_bytes

        try:
            # Crop faces for better matching
            id_image_data = crop_face_bytes(id_image_data)
            captured_image_data = crop_face_bytes(captured_image_data)

            # Save to temp files
            with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_id:
                temp_id.write(id_image_data)
                temp_id_path = temp_id.name

            with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_captured:
                temp_captured.write(captured_image_data)
                temp_captured_path = temp_captured.name

            # DeepFace verification
            result = DeepFace.verify(
                img1_path=temp_id_path,
                img2_path=temp_captured_path,
                model_name=self.model_name,
                distance_metric=self.distance_metric,
                detector_backend=self.detector_backend,
                enforce_detection=True
            )

            is_match = result.get('verified', False)
            distance = result.get('distance', 1.0)
            threshold = result.get('threshold', 0.6)
            similarity_percentage = round((1 - distance) * 100, 2) if distance < 1 else 0

            return {
                'faceMatch': is_match,
                'similarity': similarity_percentage,
                'distance': round(distance, 4),
                'threshold': round(threshold, 4),
                'model': self.model_name,
                'reason': f'Face match: {similarity_percentage}% similarity' if is_match 
                         else f'Face mismatch: {similarity_percentage}% similarity'
            }
            
        except ValueError as e:
            if "Face could not be detected" in str(e):
                return {
                    'faceMatch': False,
                    'reason': 'No face detected in one or both images'
                }
            return {
                'faceMatch': False,
                'reason': f'Face verification error: {str(e)}'
            }
        
        except Exception as e:
            return {
                'faceMatch': False,
                'reason': f'Face verification error: {str(e)}'
            }
        
        finally:
            if temp_id_path and os.path.exists(temp_id_path):
                os.unlink(temp_id_path)
            if temp_captured_path and os.path.exists(temp_captured_path):
                os.unlink(temp_captured_path)


# Initialize verifier
face_verifier = FaceMatchVerifier()


@app.route('/verify/face-match', methods=['POST'])
def verify_face_match():
    """Verify face match between ID photo and captured photo"""
    try:
        def _get_image(field):
            if field in request.files:
                return request.files[field].read()
            
            b64 = None
            if request.is_json:
                b64 = request.json.get(field + 'Base64') or request.json.get(field)
            if not b64:
                b64 = request.form.get(field) or request.values.get(field)
            
            if b64:
                b64 = re.sub(r'^data:.*;base64,', '', b64)
                try:
                    return base64.b64decode(b64)
                except Exception:
                    return None
            return None

        id_photo = _get_image('idPhoto')
        captured_photo = _get_image('capturedPhoto')
        
        if not id_photo or not captured_photo:
            return jsonify({
                'error': 'Both ID photo and captured photo required'
            }), 400

        result = face_verifier.verify_face_match(id_photo, captured_photo)
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'OK',
        'service': 'ASR Verification Service',
        'faceRecognition': f'DeepFace ({face_verifier.model_name}, CPU)',
        'geminiOcr': 'Available (via Backend)',
        'modelStatus': 'loaded'
    }), 200


if __name__ == '__main__':
    print("🔐 ASR Verification Service")
    print(f"👤 Face Matching: DeepFace ({face_verifier.model_name})")
    print("🤖 OCR & Validation: Gemini AI 2.5 Flash + APYHub")
    print("🚀 Server running on http://localhost:5001")
    app.run(host='0.0.0.0', port=5001, debug=True)