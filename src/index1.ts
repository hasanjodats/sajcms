import http from 'node:http';

http
  .createServer(function (req: any, res: any) {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.write("Hello World1!");
    res.end();
  })    
  .listen(8081);
