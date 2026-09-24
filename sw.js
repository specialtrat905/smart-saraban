// 📱 Service Worker ควบคุมการติดตั้ง PWA และโหลดหน้าเว็บรวดเร็ว
const CACHE_NAME = 'saraban-cache-v3';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (e) => {
  // ดึงข้อมูลสดจากเครือข่ายเป็นหลัก เพื่อให้หนังสืออัปเดตแบบ Real-time เสมอ
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
// ดักจับเมื่อผู้ใช้แตะที่แถบแจ้งเตือนบนหน้าจอมือถือ
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  // ล้างเลข Badge สีแดงบนไอคอนเมื่อแตะเปิด
  if (navigator.clearAppBadge) {
    navigator.clearAppBadge();
  }

  // เปิดแอปขึ้นมาทันที หรือโฟกัสแท็บเดิมที่เปิดค้างไว้
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if (client.url.includes('index.html') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('./index.html');
      }
    })
  );
});
// 🔔 เมื่อผู้ใช้แตะที่แถบแจ้งเตือนบนหน้าจอมือถือ
self.addEventListener('notificationclick', function(event) {
  event.notification.close(); // ปิดแถบเตือน

  // สั่งให้เปิดหน้าเว็บพร้อมต่อท้าย URL ด้วย ?view=personal
  const targetUrl = './index.html?view=personal';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // ถ้าแอปเปิดค้างไว้อยู่แล้ว ให้ดึงขึ้นมาข้างหน้า แล้วเปลี่ยนหน้าไปหนังสือส่วนตัว
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // ถ้าแอปยังไม่ได้เปิด ให้เปิดหน้าต่างใหม่
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});