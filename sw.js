// 📱 Service Worker ควบคุม PWA และระบบแจ้งเตือน
const CACHE_NAME = 'saraban-cache-v4';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});

// 🔔 เมื่อผู้ใช้แตะที่แถบแจ้งเตือนบนหน้าจอมือถือ (เปิดเข้าหน้าหนังสือส่วนตัวทันที)
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  // ล้างตัวเลขสีแดงบนไอคอน
  if ('clearAppBadge' in self.navigator) {
    self.navigator.clearAppBadge();
  }

  const targetUrl = './index.html?view=personal';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if (client.url.includes('index.html') && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// 📥 ตัวดักรับ Push Message แม้ขณะปิดแอปอยู่ (สำหรับระบบ Background Push)
self.addEventListener('push', function(event) {
  let title = '📥 มีหนังสือราชการส่วนตัวส่งถึงคุณ';
  let body = 'มีหนังสือใหม่มอบหมายถึงท่าน แตะเพื่อเปิดอ่าน';

  if (event.data) {
    try {
      const payload = event.data.json();
      title = payload.title || title;
      body = payload.body || body;
    } catch (e) {
      body = event.data.text();
    }
  }

  const options = {
    body: body,
    icon: './logo2.png',
    badge: './logo2.png',
    vibrate: [200, 100, 200],
    tag: 'personal-doc-alert',
    renotify: true,
    data: { url: './index.html?view=personal' }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});