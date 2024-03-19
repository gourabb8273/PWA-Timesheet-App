importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js');
// Initialize Firebase app in the service worker
const firebaseConfig = {
    apiKey: "AIzaSyAXt5UCawojL8OlicQt-16f9Tu_Yof8RFg",
    authDomain: "timesheet-app-84034.firebaseapp.com",
    projectId: "timesheet-app-84034",
    storageBucket: "timesheet-app-84034.appspot.com",
    messagingSenderId: "1001231652285",
    appId: "1:1001231652285:web:104b6d6466d9a992c76ed4",
    measurementId: "G-SNLELR3XVN"
};
firebase.initializeApp(firebaseConfig);

// Retrieve Firebase messaging instance
const messaging = firebase.messaging();

self.addEventListener('notificationclick', (event) => {
   const url = "https://timesheet-app-84034.web.app"
   event.notification.close();
  });

// Add an event listener to handle push notifications received while app is in the foreground
self.addEventListener('push', (event) => {
  const payload = event.data.json();
  console.log('Foreground message received:', payload);
  // Customize the handling of the notification payload as needed
});

// Add an event listener to handle background push notifications
self.addEventListener('backgroundpush', (event) => {
  const payload = event.data.json();
  console.log('Background message received:', payload);
  // Customize the handling of the notification payload as needed
});

messaging.onBackgroundMessage(payload =>{
    const title = payload.data.title;
    const notification = self.registration.showNotification(title,{
        body: payload.data.body
    })
})