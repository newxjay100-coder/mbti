const http = require('http');
const fs = require('fs');
const path = require('path');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function requestHandler(req, res) {
  let rawUrl = req.url.split('?')[0];
  let reqPath = decodeURI(rawUrl);
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

  const rootDir = path.resolve(__dirname);
  const filePath = path.resolve(rootDir, '.' + reqPath);

  // Security check: ensure path stays within rootDir
  if (!filePath.startsWith(rootDir)) {
    console.warn(`[403 Forbidden] ${req.method} ${req.url}`);
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      console.warn(`[404 Not Found] ${req.method} ${req.url} -> ${filePath}`);
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('404 Not Found');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    });

    console.log(`[200 OK] ${req.method} ${req.url} (${(stats.size / 1024).toFixed(1)} KB)`);
    fs.createReadStream(filePath).pipe(res);
  });
}

const PORTS = [3000, 8080, 5500];

PORTS.forEach((port) => {
  const server = http.createServer(requestHandler);
  server.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${port}/ (and http://127.0.0.1:${port}/)`);
  });
  server.on('error', (err) => {
    console.error(`Port ${port} error:`, err.message);
  });
});
