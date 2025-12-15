importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBAiCt4f4WvBWMn1sEMXSyfR7aj5vVntzM",
  authDomain: "ontrack-67ec4.firebaseapp.com",
  projectId: "ontrack-67ec4",
  storageBucket: "ontrack-67ec4.firebasestorage.app",
  messagingSenderId: "780758940678",
  appId: "1:780758940678:web:081e89e06d067da4e6d787"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/logo192.png"
  });
});
