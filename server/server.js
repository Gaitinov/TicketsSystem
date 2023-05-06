const http = require("http");
const fs = require("fs");
const path = require("path");
const port = 3000;

const mimeTypes = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".png": "image/png"
};

const server = http.createServer(async (request, response) => {
  let hash = request.url.substring(1);
  if (!hash) {
    hash = "index.html";
  } else if (!path.extname(hash)) {
    hash += ".html";
  }

  let filePath = `${hash}`;
  let ext = path.extname(filePath);
  let contentType = mimeTypes[ext];

  let data;
  let status;
  try {
    data = await fs.promises.readFile(filePath);
    status = 200;
  } catch (err) {
    data = 'Page not found';
    status = 404;
    contentType = "text/html";
  }

  response.writeHead(status, { 'Content-Type': contentType });
  response.write(data);
  response.end();
});

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
