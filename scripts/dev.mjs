// LOOPBACK PREVIEW ONLY. Production identity is exclusively managed by Sites.
import http from 'node:http';import {readFile,mkdir,readdir} from 'node:fs/promises';import {DatabaseSync} from 'node:sqlite';import path from 'node:path';import {randomBytes} from 'node:crypto';import {adapter} from './sqlite-adapter.mjs';
await import('./build.mjs');const root=path.resolve(import.meta.dirname,'..');await mkdir(path.join(root,'.local'),{recursive:true});const database=new DatabaseSync(path.join(root,'.local/grademint.sqlite'));database.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;');database.exec(await readFile(path.join(root,'drizzle/0000_grademint.sql'),'utf8'));
for(const f of (await readdir(path.join(root,'drizzle'))).filter(f=>f.endsWith('.sql')&&f!=='0000_grademint.sql').sort())database.exec(await readFile(path.join(root,'drizzle',f),'utf8'));
const worker=(await import('../dist/server/index.js')).default,port=Number(process.env.PORT||4173),sessions=new Map();
const server=http.createServer(async(req,res)=>{try{
 if(req.headers.host!==`127.0.0.1:${port}`&&req.headers.host!==`localhost:${port}`){res.writeHead(403);return res.end('Loopback only');}
 const url=new URL(req.url,`http://${req.headers.host}`),headers=new Headers(req.headers);for(const k of [...headers.keys()])if(k.startsWith('oai-authenticated-user-'))headers.delete(k);
 const token=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('gm_preview='))?.slice(11),session=sessions.get(token);if(session&&session.expires>Date.now()){headers.set('oai-authenticated-user-id',session.id);headers.set('oai-authenticated-user-email',session.email);headers.set('oai-authenticated-user-full-name',session.name);}
 if(['/signin-with-chatgpt','/signout-with-chatgpt'].includes(url.pathname)){
  if(req.method!=='GET'||req.headers['sec-fetch-site']==='cross-site'||(req.headers.origin&&req.headers.origin!==url.origin)){res.writeHead(403);return res.end();}
  if(url.pathname==='/signin-with-chatgpt'){const t=randomBytes(32).toString('hex');sessions.set(t,{id:'preview-student',email:'student@grademint.test',name:'Elev de proba',expires:Date.now()+3600000});res.setHeader('Set-Cookie',`gm_preview=${t}; HttpOnly; SameSite=Strict; Path=/; Max-Age=3600`);}else{sessions.delete(token);res.setHeader('Set-Cookie','gm_preview=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');}
  const target=url.searchParams.get('return_to')||'/';res.writeHead(302,{Location:target.startsWith('/')&&!target.startsWith('//')&&!/[\r\n\\]/.test(target)?target:'/'});return res.end();
 }
 let size=0;const chunks=[];for await(const c of req){size+=c.length;if(size>12000){res.writeHead(413);return res.end('Payload too large');}chunks.push(c);}
 const request=new Request(url,{method:req.method,headers,...(!['GET','HEAD'].includes(req.method)?{body:Buffer.concat(chunks)}:{})});const response=await worker.fetch(request,{DB:adapter(database),TUTOR_EMAILS:process.env.TUTOR_EMAILS||'',RESEND_API_KEY:process.env.RESEND_API_KEY,NOTIFICATION_TO:process.env.NOTIFICATION_TO,MAIL_FROM:process.env.MAIL_FROM});res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
 }catch{res.writeHead(500);res.end('Preview error');}});
server.listen(port,'127.0.0.1',()=>console.log(`GradeMint preview: http://127.0.0.1:${port}\nLocal sign-in uses an isolated preview account, not a production login.`));
