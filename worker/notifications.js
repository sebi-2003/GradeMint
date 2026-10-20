// Transactional mail only. Recipient and credentials are server-side configuration.
function escapeMail(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
export function emailTemplate(title,paragraphs,cta='Deschide GradeMint'){
 const site='https://grademint.heartymink128.chatgpt.site';
 return `<!doctype html><html lang="ro"><body style="margin:0;background:#f5f5ed;font-family:Arial,sans-serif;color:#203c32"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:36px 16px"><table role="presentation" width="560" style="width:100%;max-width:560px;background:#fffefa;border:1px solid #dce2d6;border-radius:20px" cellspacing="0" cellpadding="0"><tr><td style="padding:34px 32px 22px;border-bottom:1px solid #e5eadc"><div style="font-size:25px;font-weight:bold;color:#164d3d">Grade<span style="font-weight:normal">Mint</span><span style="color:#82a45f">.</span></div><div style="font-size:10px;letter-spacing:2px;margin-top:9px;color:#718265">UN PAS MIC. O DIFERENȚĂ MARE.</div></td></tr><tr><td style="padding:32px"><div style="font-size:30px;font-family:Georgia,serif;line-height:1.2;margin-bottom:24px">${escapeMail(title)}</div>${paragraphs.map(p=>`<p style="font-size:14px;line-height:1.8;color:#637267;margin:0 0 16px;white-space:pre-wrap">${escapeMail(p)}</p>`).join('')}<table role="presentation" cellspacing="0" cellpadding="0"><tr><td style="background:#164d3d;border-radius:10px"><a href="${site}/#cont" style="display:inline-block;padding:15px 22px;color:#fff;text-decoration:none;font-weight:bold;font-size:13px">${escapeMail(cta)} ↗</a></td></tr></table></td></tr><tr><td style="padding:23px 32px;background:#eaf1df;border-radius:0 0 20px 20px;font-size:12px;line-height:1.7;color:#5e7553">Cu răbdare și puțină mentă,<br><strong>Sebi & Bianca · GradeMint</strong><br><span style="font-size:10px">Mesaj tranzacțional legat de contul sau cererea ta. Fără marketing.</span></td></tr></table></td></tr></table></body></html>`;
}
export async function deliverEvent(db,env,eventId){
 const event=await db.prepare('SELECT * FROM mail_events WHERE id=?').bind(eventId).first();if(!event)return 'failed';
 if(event.status==='accepted'||event.status==='sending')return event.status;
 if(!env.RESEND_API_KEY||!env.MAIL_FROM){await db.prepare("UPDATE mail_events SET status='not_configured',updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(eventId).run();return 'not_configured';}
 const claim=await db.prepare("UPDATE mail_events SET status='sending',attempts=attempts+1,updated_at=CURRENT_TIMESTAMP WHERE id=? AND status IN ('pending','failed','not_configured') RETURNING id").bind(eventId).first();if(!claim)return 'sending';
 try{const payload=JSON.parse(event.payload);const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`grademint-${event.id}`},body:JSON.stringify({from:env.MAIL_FROM,to:[event.recipient],subject:payload.subject,text:payload.paragraphs.join('\n\n'),html:emailTemplate(payload.title,payload.paragraphs,payload.cta)}),signal:AbortSignal.timeout(8000)});if(!response.ok)throw Error();const r=await response.json();if(typeof r.id!=='string')throw Error();await db.prepare("UPDATE mail_events SET status='accepted',provider_id=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(r.id,event.id).run();return 'accepted';}catch{await db.prepare("UPDATE mail_events SET status='failed',updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='sending'").bind(event.id).run();return 'failed';}
}
export async function queueEvent(db,env,{id,userId,recipient,kind,title,subject,paragraphs,cta}){
 const result=await db.prepare('INSERT INTO mail_events(id,user_id,kind,recipient,payload) VALUES(?,?,?,?,?) ON CONFLICT(id) DO NOTHING').bind(id,userId,kind,recipient,JSON.stringify({title,subject,paragraphs,cta})).run();
 return {isNew:!!result.meta.changes,status:await deliverEvent(db,env,id)};
}
export async function deliverBooking(db, env, bookingId) {
  const notification = await db.prepare('SELECT n.*, b.subject, b.preferred, b.message, b.user_id, p.display_name FROM booking_notifications n JOIN bookings b ON b.id=n.booking_id LEFT JOIN profiles p ON p.user_id=b.user_id WHERE n.booking_id=?').bind(bookingId).first();
  if (!notification) return 'failed';
  if (notification.status === 'accepted' || notification.status === 'sending') return notification.status;
  if (!env.RESEND_API_KEY || !env.NOTIFICATION_TO || !env.MAIL_FROM) {
    await db.prepare("UPDATE booking_notifications SET status='not_configured',updated_at=CURRENT_TIMESTAMP WHERE booking_id=?").bind(bookingId).run();
    return 'not_configured';
  }
  const claim = await db.prepare("UPDATE booking_notifications SET status='sending',attempts=attempts+1,updated_at=CURRENT_TIMESTAMP WHERE booking_id=? AND status IN ('pending','failed','not_configured') RETURNING booking_id").bind(bookingId).first();
  if (!claim) return 'sending';
  const subject = notification.subject === 'matematica' ? 'Matematică — Sebi' : 'Limba română — Bianca';
  const body = {
    from: env.MAIL_FROM,
    to: [env.NOTIFICATION_TO],
    reply_to: notification.reply_to,
    subject: `GradeMint · Cerere nouă de meditații · ${subject}`,
    html: emailTemplate('O nouă cerere. Un nou început.',[
      `Elev: ${notification.display_name || 'Elev GradeMint'}`,
      `Materia: ${subject}`,
      `Disponibilitate: ${notification.preferred}`,
      `Mesaj: ${notification.message || '(fără mesaj suplimentar)'}`,
      `Referință: ${bookingId}`,
      'Răspunde la acest e-mail pentru a contacta elevul sau deschide panoul de mentor.'
    ],'Vezi cererea în platformă'),
    text: [
      'Ai primit o cerere nouă prin GradeMint.',
      `Elev: ${notification.display_name || 'Elev GradeMint'}`,
      `Materia: ${subject}`,
      `Disponibilitate: ${notification.preferred}`,
      `Mesaj: ${notification.message || '(fără mesaj suplimentar)'}`,
      `Referință: ${bookingId}`,
      'Poți răspunde la acest e-mail pentru a contacta elevul. Cererea rămâne disponibilă în panoul de mentor GradeMint.',
      'Aceasta este o cerere, nu o ședință confirmată.'
    ].join('\n\n')
  };
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `grademint-booking-${bookingId}` },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000)
    });
    if (!response.ok) throw new Error('Email provider rejected request');
    const result = await response.json();
    if (typeof result.id !== 'string') throw new Error('Invalid provider response');
    await db.prepare("UPDATE booking_notifications SET status='accepted',provider_id=?,updated_at=CURRENT_TIMESTAMP WHERE booking_id=?").bind(result.id,bookingId).run();
    return 'accepted';
  } catch {
    await db.prepare("UPDATE booking_notifications SET status='failed',updated_at=CURRENT_TIMESTAMP WHERE booking_id=? AND status='sending'").bind(bookingId).run();
    return 'failed';
  }
}
