import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFile} from 'node:fs/promises';
import worker from '../worker/index.js';
import {adapter} from '../scripts/sqlite-adapter.mjs';
const sql=(await Promise.all(['0000_grademint','0001_booking_notifications','0002_transactional_mail'].map(n=>readFile(new URL(`../drizzle/${n}.sql`,import.meta.url),'utf8')))).join('\n');
function request(path,method='GET',body,user='alice'){
 return new Request('https://grademint.test'+path,{method,headers:{Origin:'https://grademint.test','Content-Type':'application/json','X-GradeMint-Request':'1','oai-authenticated-user-id':user,'oai-authenticated-user-email':user+'@example.test'},...(body?{body:JSON.stringify(body)}:{})});
}
function setup(){const sqlite=new DatabaseSync(':memory:');sqlite.exec(sql);return{sqlite,DB:adapter(sqlite),TUTOR_EMAILS:'mentor@example.test'};}
test('mentor can contact and confirm a booking; student sees confirmation without email service',async()=>{
 const env=setup();
 const saved=await worker.fetch(request('/api/bookings','POST',{subject:'matematica',preferred:'Marți după ora 17',message:'Pregătire pentru BAC'}),env);
 assert.equal(saved.status,201);const {id}=await saved.json();
 assert.equal((await worker.fetch(request('/api/tutor/inbox'),env)).status,403);
 const inbox=await(await worker.fetch(request('/api/tutor/inbox','GET',null,'mentor'),env)).json();
 assert.equal(inbox.bookings[0].reply_to,'alice@example.test');
 assert.equal((await worker.fetch(request(`/api/tutor/bookings/${id}`,'PUT',{status:'confirmata'},'mentor'),env)).status,200);
 const mine=await(await worker.fetch(request('/api/bookings'),env)).json();assert.equal(mine.bookings[0].status,'confirmata');
 const other=await(await worker.fetch(request('/api/bookings','GET',null,'bob'),env)).json();assert.equal(other.bookings.length,0);env.sqlite.close();
});
test('export includes notification contacts and deletion removes them even without foreign keys',async()=>{
 const env=setup();
 for(const user of ['alice','bob'])await worker.fetch(request('/api/bookings','POST',{subject:'romana',preferred:'Joi după ora 16'},user),env);
 const data=await(await worker.fetch(request('/api/export'),env)).json();
 assert.equal(data.mailEvents.length,1);assert.equal(data.mailEvents[0].recipient,'alice@example.test');
 assert.equal(data.bookingNotifications.length,1);assert.equal(data.bookingNotifications[0].reply_to,'alice@example.test');
 assert.equal((await worker.fetch(request('/api/account','DELETE',{confirm:'STERGE'}),env)).status,200);
 assert.equal(env.sqlite.prepare('SELECT count(*) AS n FROM booking_notifications WHERE reply_to=?').get('alice@example.test').n,0);
 assert.equal(env.sqlite.prepare('SELECT count(*) AS n FROM booking_notifications WHERE reply_to=?').get('bob@example.test').n,1);
 env.sqlite.close();
});
