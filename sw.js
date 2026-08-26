// 📱 Service Worker ควบคุมการติดตั้ง PWA และโหลดหน้าเว็บรวดเร็ว
const CACHE_NAME = 'saraban-cache-v2';

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