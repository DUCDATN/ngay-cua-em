/* Service worker: lưu sẵn phần mềm để mở được khi không có mạng.
   1.2.0-1a396b1294 và ["./", "huong-dan.html", "icons/apple-touch-icon.png", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "index.html", "manifest.webmanifest", "privacy.html", "vendor/fonts.css", "vendor/fonts/012b61107406d91f115432f33b5355db.woff2", "vendor/fonts/0167974b365f0d6a7f1b24c5ab9755f8.woff2", "vendor/fonts/0d1ee7c5e1ef25e6889196189cda9dad.woff2", "vendor/fonts/4a324ddee591f84f5e905da020086700.woff2", "vendor/fonts/798ec6b6b8cab7f6789add7d6a7dbe55.woff2", "vendor/fonts/94151518757cb044bdfcf06ba1f859be.woff2", "vendor/html-to-image.js", "vendor/qrcode.min.js", "vendor/xlsx.full.min.js"] được build_web.py điền vào. */
const CACHE = 'ngaycuaem-1.2.0-1a396b1294';
const ASSETS = ["./", "huong-dan.html", "icons/apple-touch-icon.png", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "index.html", "manifest.webmanifest", "privacy.html", "vendor/fonts.css", "vendor/fonts/012b61107406d91f115432f33b5355db.woff2", "vendor/fonts/0167974b365f0d6a7f1b24c5ab9755f8.woff2", "vendor/fonts/0d1ee7c5e1ef25e6889196189cda9dad.woff2", "vendor/fonts/4a324ddee591f84f5e905da020086700.woff2", "vendor/fonts/798ec6b6b8cab7f6789add7d6a7dbe55.woff2", "vendor/fonts/94151518757cb044bdfcf06ba1f859be.woff2", "vendor/html-to-image.js", "vendor/qrcode.min.js", "vendor/xlsx.full.min.js"];

self.addEventListener('install', e => {
  // cache:'reload' – bỏ qua bộ nhớ đệm HTTP để luôn lấy đúng bản mới khi cập nhật
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('ngaycuaem-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;   // Firebase đi thẳng ra mạng
  if (req.mode === 'navigate') {
    // Trang chính: ưu tiên bản mới trên mạng, mất mạng thì dùng bản đã lưu
    e.respondWith(
      fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put('./', copy)); return r; })
        .catch(() => caches.match('./').then(r => r || caches.match('index.html')))
    );
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(r => r || fetch(req)));
});
