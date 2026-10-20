import { BANK, chooseQuestions } from '../data/question-bank.js';
import { deliverBooking, queueEvent, deliverEvent } from './notifications.js';
const ASSETS = /* ASSET_MAP */ {};
const SUBJECTS=['matematica','romana'], LEVELS=['incepator','mediu','avansat'];
const SAFE_HEADERS={
 'Content-Security-Policy':"default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; object-src 'none'",
 'X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','Permissions-Policy':'camera=(), microphone=(), geolocation=(), payment=()',
 'X-Frame-Options':'DENY','Cross-Origin-Opener-Policy':'same-origin','Strict-Transport-Security':'max-age=31536000; includeSubDomains'
};
class HttpError extends Error{constructor(status,message){super(message);this.status=status;}}
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{...SAFE_HEADERS,'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});}
function text(value,name,min,max){if(typeof value!=='string'||value.trim().length<min||value.trim().length>max||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value))throw new HttpError(400,`Verifică rubrica „${name}”.`);return value.trim();}
function choice(value,allowed,name){if(!allowed.includes(value))throw new HttpError(400,`Valoare nevalidă pentru ${name}.`);return value;}
function userOf(req,env){const id=req.headers.get('oai-authenticated-user-id'),email=req.headers.get('oai-authenticated-user-email');if(!id||!email)return null;
 let name=req.headers.get('oai-authenticated-user-full-name')||'';if(req.headers.get('oai-authenticated-user-full-name-encoding')==='percent-encoded-utf-8'){try{name=decodeURIComponent(name);}catch{name='';}}
 const tutors=(env.TUTOR_EMAILS||'').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);
 return {id,email,displayName:name.slice(0,80)||'Elev GradeMint',role:tutors.includes(email.toLowerCase())?'tutor':'student'};
}
function requireUser(req,env){const u=userOf(req,env);if(!u)throw new HttpError(401,'Autentifică-te pentru a continua.');return u;}
function requireTutor(u){if(u.role!=='tutor')throw new HttpError(403,'Acțiune rezervată mentorilor.');}
function dbOf(env){if(!env.DB)throw new HttpError(503,'Spațiul personal nu este disponibil momentan.');return env.DB;}
async function bodyOf(req){if(req.headers.get('content-type')?.split(';')[0]!=='application/json')throw new HttpError(415,'Este necesar un formular JSON.');if(Number(req.headers.get('content-length')||0)>12000)throw new HttpError(413,'Mesaj prea lung.');
 const reader=req.body?.getReader();if(!reader)throw new HttpError(400,'Lipsește formularul.');const chunks=[];let size=0;
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>12000){await reader.cancel();throw new HttpError(413,'Mesaj prea lung.');}chunks.push(value);}
 const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}
 try{const b=JSON.parse(new TextDecoder().decode(bytes));if(!b||typeof b!=='object'||Array.isArray(b))throw Error();return b;}catch{throw new HttpError(400,'Formular nevalid.');}
}
function checkMutation(req){const url=new URL(req.url);if(req.headers.get('origin')!==url.origin||req.headers.get('x-grademint-request')!=='1'||req.headers.get('sec-fetch-site')==='cross-site')throw new HttpError(403,'Cerere respinsă. Reîncarcă pagina.');}
async function limit(db,key,max=20){const now=Math.floor(Date.now()/1000),bucket=Math.floor(now/60);const row=await db.prepare('INSERT INTO rate_limits(key,hits,expires_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET hits=hits+1 RETURNING hits').bind(`${key}:${bucket}`,now+120).first();if(row.hits>max)throw new HttpError(429,'Prea multe cereri. Încearcă din nou peste un minut.');
 if(crypto.getRandomValues(new Uint8Array(1))[0]<8)await db.prepare('DELETE FROM rate_limits WHERE key IN (SELECT key FROM rate_limits WHERE expires_at < ? LIMIT 100)').bind(now).run();
}
function safeQuestion(q){return {id:q.id,prompt:q.prompt,options:q.options,topic:q.topic,level:q.level};}
function grade(ids,answers){if(!answers||typeof answers!=='object'||Array.isArray(answers))throw new HttpError(400,'Lipsesc răspunsurile.');for(const k of Object.keys(answers))if(!ids.includes(k))throw new HttpError(400,'Răspuns străin acestui test.');
 const result=ids.map(id=>{const q=BANK.find(q=>q.id===id),selected=answers[id];if(!q||!Number.isInteger(selected)||selected<0||selected>=q.options.length)throw new HttpError(400,'Răspunde la fiecare întrebare.');return {...safeQuestion(q),selected,correct:q.correct,explanation:q.explanation,isCorrect:selected===q.correct};});return {score:result.filter(q=>q.isCorrect).length,total:result.length,questions:result};
}
const DEMO_IDS=['m01','m02','m04','m05','m06','m07'];
export async function api(req,env){const {pathname:path}=new URL(req.url),method=req.method;if(!['GET','HEAD'].includes(method))checkMutation(req);
 if(path==='/api/me'&&method==='GET'){const user=userOf(req,env);if(!user)return json({user:null});const profile=await dbOf(env).prepare('SELECT display_name,subject,level,grade,goal FROM profiles WHERE user_id=?').bind(user.id).first();return json({user:{displayName:profile?.display_name||user.displayName,role:user.role},profile});}
 if(path==='/api/demo'&&method==='GET')return json({id:'demo',questions:DEMO_IDS.map(id=>safeQuestion(BANK.find(q=>q.id===id))),demo:true});
 if(path==='/api/demo/grade'&&method==='POST'){const b=await bodyOf(req);await limit(dbOf(env),'demo:'+(req.headers.get('cf-connecting-ip')||'local'),30);return json({...grade(DEMO_IDS,b.answers),demo:true});}
 const user=requireUser(req,env),db=dbOf(env);if(!['GET','HEAD'].includes(method))await limit(db,user.id);
 if(path==='/api/tutor/mail'&&method==='GET'){requireTutor(user);const r=await db.prepare('SELECT id,kind,status,attempts,created_at FROM mail_events ORDER BY created_at DESC LIMIT 100').bind().all();return json({configured:!!(env.RESEND_API_KEY&&env.MAIL_FROM),events:r.results});}
 const mailRetry=path.match(/^\/api\/tutor\/mail\/([^/]+)\/retry$/);
 if(mailRetry&&method==='POST'){requireTutor(user);await bodyOf(req);return json({notification:await deliverEvent(db,env,decodeURIComponent(mailRetry[1]))});}
 if(path==='/api/onboarding'&&method==='POST'){
  await bodyOf(req);
  const welcome=await queueEvent(db,env,{id:'welcome-'+user.id,userId:user.id,recipient:user.email,kind:'welcome',title:'Bine ai venit în GradeMint.',subject:'Bine ai venit în GradeMint 🌱',paragraphs:[`Salut, ${user.displayName}!`,'Contul tău GradeMint este pregătit. Aici ai loc pentru întrebări, exercițiu și următorul tău „am înțeles”.','Poți explora arhiva BAC, crea teste pentru nivelul tău și trimite cereri de meditații la matematică sau română.','Matematica are logică. Româna are poveste. Le descoperim împreună.'],cta:'Intră în spațiul tău'});
  return json({ok:true,isNew:welcome.isNew,notification:welcome.status});
 }
 const retry=path.match(/^\/api\/tutor\/bookings\/([0-9a-f-]{36})\/notify$/);
 if(retry&&method==='POST'){requireTutor(user);await bodyOf(req);return json({notification:await deliverBooking(db,env,retry[1])});}
 const review=path.match(/^\/api\/tests\/([0-9a-f-]{36})$/);
 if(review&&method==='GET'){const a=await db.prepare('SELECT * FROM attempts WHERE id=? AND user_id=?').bind(review[1],user.id).first();if(!a||!a.submitted_at)throw new HttpError(404,'Rezultatul nu a fost găsit.');return json(grade(JSON.parse(a.items),JSON.parse(a.answers)));}
 if(path==='/api/profile'&&method==='PUT'){const b=await bodyOf(req);await db.prepare('INSERT INTO profiles(user_id,display_name,subject,level,grade,goal) VALUES(?,?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET display_name=excluded.display_name,subject=excluded.subject,level=excluded.level,grade=excluded.grade,goal=excluded.goal').bind(user.id,text(b.displayName,'nume',2,80),choice(b.subject,SUBJECTS,'materie'),choice(b.level,LEVELS,'nivel'),choice(b.grade,['VIII','IX','X','XI','XII'],'clasă'),text(b.goal||'','obiectiv',0,300)).run();return json({ok:true});}
 if(path==='/api/questions'&&method==='GET'){const r=await db.prepare('SELECT id,subject,title,body,answer,created_at,answered_at FROM questions WHERE user_id=? ORDER BY created_at DESC LIMIT 100').bind(user.id).all();return json({questions:r.results});}
 if(path==='/api/questions'&&method==='POST'){const b=await bodyOf(req),id=crypto.randomUUID();await db.prepare('INSERT INTO questions(id,user_id,subject,title,body) VALUES(?,?,?,?,?)').bind(id,user.id,choice(b.subject,SUBJECTS,'materie'),text(b.title,'titlu',5,120),text(b.body,'întrebare',20,4000)).run();return json({id,ok:true},201);}
 if(path==='/api/bookings'&&method==='GET'){const r=await db.prepare('SELECT id,subject,preferred,message,status,created_at FROM bookings WHERE user_id=? ORDER BY created_at DESC LIMIT 100').bind(user.id).all();return json({bookings:r.results});}
 if(path==='/api/bookings'&&method==='POST'){
  await limit(db,'bookings:'+user.id,5);
  const b=await bodyOf(req),id=crypto.randomUUID();
  const subject=choice(b.subject,SUBJECTS,'materie'),preferred=text(b.preferred,'disponibilitate',5,200),message=text(b.message||'','mesaj',0,2000);
  await db.batch([
   db.prepare('INSERT INTO bookings(id,user_id,subject,preferred,message) VALUES(?,?,?,?,?)').bind(id,user.id,subject,preferred,message),
   db.prepare('INSERT INTO booking_notifications(booking_id,reply_to) VALUES(?,?)').bind(id,user.email)
  ]);
  const notification=await deliverBooking(db,env,id);
  const receipt=await queueEvent(db,env,{id:'booking-receipt-'+id,userId:user.id,recipient:user.email,kind:'booking_receipt',title:'Am primit cererea ta.',subject:'GradeMint · Cererea ta de meditații a fost înregistrată',paragraphs:[`Salut, ${user.displayName}!`, `Materia: ${subject==='matematica'?'Matematică — Sebi':'Limba română — Bianca'}`,`Disponibilitate: ${preferred}`,message||'Ai făcut primul pas. Mulțumim!','Cererea este salvată în cont. Nu reprezintă încă o ședință confirmată; mentorul va stabili cu tine programul și detaliile.'],cta:'Vezi cererea mea'});
  return json({ok:true,id,notification,studentNotification:receipt.status},201);
 }
 if(path==='/api/tests'&&method==='GET'){const r=await db.prepare('SELECT id,subject,level,score,total,created_at,submitted_at FROM attempts WHERE user_id=? ORDER BY created_at DESC LIMIT 50').bind(user.id).all();return json({attempts:r.results});}
 if(path==='/api/tests'&&method==='POST'){const b=await bodyOf(req),subject=choice(b.subject,SUBJECTS,'materie'),level=choice(b.level,LEVELS,'nivel'),topics=subject==='matematica'?['toate','algebra','functii','geometrie']:['toate','literatura','gramatica','argumentare'],focus=choice(b.focus||'toate',topics,'capitol');const history=await db.prepare('SELECT items,answers FROM attempts WHERE user_id=? AND subject=? AND submitted_at IS NOT NULL ORDER BY created_at DESC LIMIT 10').bind(user.id,subject).all();const selected=chooseQuestions(subject,level,history.results,focus),id=crypto.randomUUID();await db.prepare('INSERT INTO attempts(id,user_id,subject,level,items,total) VALUES(?,?,?,?,?,?)').bind(id,user.id,subject,level,JSON.stringify(selected.map(q=>q.id)),selected.length).run();return json({id,subject,level,questions:selected.map(safeQuestion),demo:false},201);}
 const submit=path.match(/^\/api\/tests\/([0-9a-f-]{36})\/submit$/);if(submit&&method==='POST'){const b=await bodyOf(req),a=await db.prepare('SELECT * FROM attempts WHERE id=? AND user_id=?').bind(submit[1],user.id).first();if(!a)throw new HttpError(404,'Testul nu a fost găsit.');if(a.submitted_at)throw new HttpError(409,'Test deja trimis.');const result=grade(JSON.parse(a.items),b.answers);const r=await db.prepare('UPDATE attempts SET answers=?,score=?,submitted_at=CURRENT_TIMESTAMP WHERE id=? AND user_id=? AND submitted_at IS NULL').bind(JSON.stringify(b.answers),result.score,a.id,user.id).run();if(!r.meta.changes)throw new HttpError(409,'Test deja trimis.');return json(result);}
 if(path==='/api/export'&&method==='GET'){const [profile,q,a,b]=await Promise.all([db.prepare('SELECT * FROM profiles WHERE user_id=?').bind(user.id).first(),db.prepare('SELECT * FROM questions WHERE user_id=?').bind(user.id).all(),db.prepare('SELECT * FROM attempts WHERE user_id=?').bind(user.id).all(),db.prepare('SELECT * FROM bookings WHERE user_id=?').bind(user.id).all()]);return json({exportedAt:new Date().toISOString(),profile,questions:q.results,attempts:a.results,bookings:b.results});}
 if(path==='/api/account'&&method==='DELETE'){const b=await bodyOf(req);if(b.confirm!=='STERGE')throw new HttpError(400,'Confirmă ștergerea.');await db.batch(['mail_events','questions','attempts','bookings','profiles'].map(t=>db.prepare(`DELETE FROM ${t} WHERE user_id=?`).bind(user.id)));return json({ok:true});}
 if(path==='/api/tutor/inbox'&&method==='GET'){requireTutor(user);const [q,b]=await Promise.all([db.prepare('SELECT q.id,q.subject,q.title,q.body,q.answer,q.created_at,p.display_name FROM questions q LEFT JOIN profiles p ON p.user_id=q.user_id ORDER BY q.created_at DESC LIMIT 100').all(),db.prepare('SELECT b.id,b.subject,b.preferred,b.message,b.status,b.created_at,p.display_name,n.status AS notification FROM bookings b LEFT JOIN profiles p ON p.user_id=b.user_id LEFT JOIN booking_notifications n ON n.booking_id=b.id ORDER BY b.created_at DESC LIMIT 100').all()]);return json({questions:q.results,bookings:b.results});}
 const answer=path.match(/^\/api\/tutor\/questions\/([0-9a-f-]{36})$/);if(answer&&method==='PUT'){requireTutor(user);const b=await bodyOf(req),r=await db.prepare('UPDATE questions SET answer=?,answered_by=?,answered_at=CURRENT_TIMESTAMP WHERE id=?').bind(text(b.answer,'răspuns',10,5000),user.id,answer[1]).run();if(!r.meta.changes)throw new HttpError(404,'Întrebare inexistentă.');return json({ok:true});}
 const booking=path.match(/^\/api\/tutor\/bookings\/([0-9a-f-]{36})$/);if(booking&&method==='PUT'){requireTutor(user);const b=await bodyOf(req),r=await db.prepare('UPDATE bookings SET status=? WHERE id=?').bind(choice(b.status,['noua','confirmata','inchisa'],'stare'),booking[1]).run();if(!r.meta.changes)throw new HttpError(404,'Cerere inexistentă.');return json({ok:true});}
 throw new HttpError(404,'Pagina nu a fost găsită.');
}
export default {async fetch(req,env){try{const url=new URL(req.url);if(url.pathname.startsWith('/api/'))return await api(req,env);if(!['GET','HEAD'].includes(req.method))return json({error:'Metodă nepermisă.'},405);const key=url.pathname==='/'?'/index.html':url.pathname,asset=ASSETS[key];if(!asset)return new Response('Pagina nu există. Înapoi la GradeMint: /',{status:404,headers:{...SAFE_HEADERS,'Content-Type':'text/plain; charset=utf-8'}});return new Response(req.method==='HEAD'?null:asset.body,{headers:{...SAFE_HEADERS,'Content-Type':asset.type,'Cache-Control':'public, max-age=0, must-revalidate'}});
 }catch(e){if(e instanceof HttpError)return json({error:e.message},e.status);console.error('GradeMint request failed',{name:e?.name});return json({error:'Problemă temporară. Încearcă din nou.'},500);}}};
