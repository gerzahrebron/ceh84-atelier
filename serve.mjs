import {createServer} from 'node:http';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {resolve,dirname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {submit} from './handler.mjs';
process.chdir(dirname(fileURLToPath(import.meta.url)));
const db=new DatabaseSync(process.env.CEH84_DB || 'requests.sqlite');
db.exec(readFileSync('drizzle/0000_requests.sql','utf8').replace('CREATE TABLE','CREATE TABLE IF NOT EXISTS'));
if(process.argv.includes('--requests')){console.table(db.prepare('SELECT created_at,name,contact,project FROM requests ORDER BY created_at DESC').all());process.exit()}
const binding={prepare(sql){return {bind(...values){return {run(){return db.prepare(sql).run(...values)}}}}}};
const root=resolve('public');
createServer(async(req,res)=>{try{
 const path=new URL(req.url,'http://localhost').pathname;
 if(path==='/api/requests'){
  let raw='';for await(const part of req){raw+=part;if(raw.length>18000){res.writeHead(413).end();return}}
  const request=new Request('http://localhost/api/requests',{method:req.method,headers:req.headers,body:req.method==='POST'?raw:undefined});
  const response=await submit(request,binding);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(await response.text());return
 }
 const file=resolve(root,'.'+(path==='/'?'/index.html':decodeURIComponent(path)));
 if(!file.startsWith(root+sep)){res.writeHead(404).end();return}
 let content;try{content=readFileSync(file)}catch{res.writeHead(404).end();return}
 const types={html:'text/html; charset=utf-8',css:'text/css',js:'application/javascript',png:'image/png',webp:'image/webp'};
 res.writeHead(200,{'Content-Type':types[file.split('.').pop()]||'application/octet-stream'});res.end(content)
 }catch{res.writeHead(500).end()}
}).listen(Number(process.env.PORT||4184),'127.0.0.1',()=>console.log('http://127.0.0.1:'+ (process.env.PORT||4184)));
