const http=require('http'),fs=require('fs'),path=require('path');
const root=__dirname;
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.jpg':'image/jpeg','.mp4':'video/mp4','.svg':'image/svg+xml'};
http.createServer((req,res)=>{
  let p;
  try{p=decodeURIComponent(new URL(req.url,'http://x').pathname)}catch{res.writeHead(400);return res.end()}
  const file=path.resolve(root,'.'+(p==='/'?'/index.html':p));
  if(!file.startsWith(root)){res.writeHead(403);return res.end()}
  fs.readFile(file,(err,data)=>{
    if(err){res.writeHead(404);return res.end('Not found')}
    res.setHeader('Content-Type',types[path.extname(file).toLowerCase()]||'application/octet-stream');
    res.end(data);
  });
}).listen(8080,'127.0.0.1',()=>console.log('Serving on http://localhost:8080'));
