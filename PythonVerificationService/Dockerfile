FROM python:3.10-slim-bullseye

# Install system dependencies (force HTTPS APT mirrors to avoid 403 from HTTP)
RUN sed -i 's|http://deb.debian.org|https://deb.debian.org|g' /etc/apt/sources.list \
    && sed -i 's|http://security.debian.org|https://security.debian.org|g' /etc/apt/sources.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
    ca-certificates \
    libsm6 \
    libxext6 \
    libxrender1 \
    libgomp1 \
    libglib2.0-0 \
    libgl1 \
    wget \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install Python packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download DeepFace models (optional but recommended)
# Models will be cached in /root/.deepface/weights/
RUN python -c "from deepface.commons import functions; functions.build_model('ArcFace')" || echo "Model will download on first use"

# Copy application files
COPY app.py .

# Create non-root user
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app /root/.deepface 2>/dev/null || true

USER appuser

EXPOSE 5001

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:5001/health', timeout=5)" || exit 1

CMD ["gunicorn", "--bind", "0.0.0.0:5001", "--workers", "2", "--threads", "2", "--timeout", "120", "--access-logfile", "-", "app:app"]