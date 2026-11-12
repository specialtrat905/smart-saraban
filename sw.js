// 📱 Service Worker ควบคุม PWA และระบบแจ้งเตือน
// เวอร์ชันนี้เน้นให้ Web App รับไฟล์ index.html รุ่นใหม่ทันที

const CACHE_NAME = 'saraban-cache-v5';

self.addEventListener('install', (event) => {
  // ให้ Service Worker รุ่นใหม่ขึ้นทำงานทันที
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // ใช้ Network ก่อนเสมอ เพื่อให้ได้ไฟล์ล่าสุดจาก GitHub Pages
  // ถ้าไม่มีอินเทอร์เน็ตจึงค่อยใช้ Cache ที่มีอยู่
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// 🔔 เมื่อผู้ใช้แตะที่แถบแจ้งเตือนบนหน้าจอมือถือ
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  // ล้างตัวเลขสีแดงบนไอคอน
  if ('clearAppBadge' in self.navigator) {
    self.navigator.clearAppBadge();
  }

  const targetUrl = './index.html?view=personal';

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(function(clientList) {
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

// 📥 ตัวดักรับ Push Message แม้ขณะปิดแอปอยู่
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
    data: {
      url: './index.html?view=personal'
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});