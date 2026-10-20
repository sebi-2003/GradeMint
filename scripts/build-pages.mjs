import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'pages');
await mkdir(out, { recursive: true });
let html = await readFile(path.join(root, 'public/index.html'), 'utf8');
html = html.replaceAll('/assets/logo.svg', './logo.svg').replaceAll('href="/"', 'href="./"').replaceAll('href="/styles.css"', 'href="./styles.css"').replaceAll('src="/app.js"', 'src="./app.js"');
html = html.replace('<main id="main">', '<main id="main"><p class="pages-notice">Versiune de prezentare · Arhiva BAC și testele de probă sunt disponibile. Conturile, întrebările private și programările vor fi activate ulterior.</p>');
html = html.replace('În cont, testele țin cont și de greșelile din încercările anterioare.', 'În această versiune poți încerca exercițiile fără cont; rezultatele nu se salvează.');
html = html.replace('Întrebarea ajunge în spațiul privat, unde mentorii pot răspunde.', 'Trimiterea întrebărilor private va fi disponibilă după activarea platformei complete.');
html = html.replace('Cererea se salvează în cont. Mentorul poate primi și o notificare e-mail, după activarea serviciului. Nu cerem numărul de telefon.', 'Programările online nu sunt încă active. Acest formular nu trimite și nu salvează date.');
html = html.replace('Selecția folosește materia, nivelul și capitolul ales. În cont, întrebările din capitolele unde ai greșit primesc prioritate. Banca inițială are 30 de exerciții originale.', 'Platforma completă va adapta selecția la progres. Aici poți încerca o sesiune de probă; rezultatele nu se salvează. Banca inițială are 30 de exerciții originale.');
html = html.replace('În „Spațiul meu”, după ce un mentor autorizat adaugă răspunsul. Nu promitem un termen automat de răspuns.', 'Întrebările și răspunsurile private vor fi disponibile când activăm conturile. Versiunea de prezentare nu trimite întrebări.');
const { BANK } = await import('../data/question-bank.js');
const demo = BANK.filter(q => q.subject === 'matematica').slice(0, 6);
const adapter = `// Public practice only. No authentication, storage or email on GitHub Pages.
const PAGES_QUESTIONS = ${JSON.stringify(demo)};
async function pagesRequest(url, {body} = {}) {
 if (url === '/api/me') return {user:null,profile:null};
 if (url === '/api/demo') return {id:'demo',demo:true,questions:PAGES_QUESTIONS.map(({correct,explanation,...q})=>q)};
 if (url === '/api/demo/grade') {
  const questions=PAGES_QUESTIONS.map(q=>({...q,selected:body.answers[q.id],isCorrect:body.answers[q.id]===q.correct}));
  return {demo:true,questions,total:questions.length,score:questions.filter(q=>q.isCorrect).length};
 }
 throw Error('Această funcție va fi disponibilă după activarea platformei complete.');
}
`;
let app = await readFile(path.join(root,'public/app.js'),'utf8');
app = adapter + app.replace("async function request(url,{method='GET',body}={}){", "async function request(url,{method='GET',body}={}){return pagesRequest(url,{body});/* Full platform transport is unused on Pages. */");
// Keep all sign-in actions inside this page and explain the preview accurately.
app += `\nconst previewInfo = () => dialog(el('h2',{},'În curând, spațiul tău GradeMint.'),el('p',{},'Aceasta este versiunea de prezentare. Conturile, întrebările private, programările și e-mailurile nu sunt încă active. Poți explora arhiva BAC și testul de probă fără cont.'));
document.addEventListener('click',e=>{const a=e.target.closest('a');if(a?.getAttribute('href')?.startsWith('/signin-with-chatgpt')){e.preventDefault();e.stopImmediatePropagation();previewInfo();}},true);
document.querySelectorAll('a[href^="/signin-with-chatgpt"]').forEach(a=>{a.textContent='Conturi în curând ↗';});
for(const id of ['booking-form','question-form']){const form=document.getElementById(id);form.querySelectorAll('input,textarea,select').forEach(n=>n.disabled=true);form.querySelector('button[type=submit]').textContent='Disponibil în curând';form.addEventListener('submit',e=>{e.preventDefault();e.stopImmediatePropagation();previewInfo();},true);}
policies.privacy.paragraphs=['Această versiune de prezentare nu oferă autentificare, nu trimite formulare și nu stochează răspunsurile testelor. Exercițiile de probă sunt evaluate în browser.','Site-ul este găzduit de GitHub Pages. Furnizorul poate procesa date tehnice de acces potrivit politicii sale. Linkurile BAC deschid servicii externe, cu propriile politici.'];
policies.terms.paragraphs=['GradeMint prezintă meditații și resurse educaționale. Testele sunt exerciții originale de antrenament și nu sunt subiecte oficiale BAC.','Aceasta este o versiune de prezentare. Conturile, întrebările private, programările și notificările e-mail nu sunt disponibile. Nu există garanții privind notele sau rezultatele examenelor.'];
`;
await writeFile(path.join(out,'index.html'), html);
await writeFile(path.join(out,'app.js'), app);
await writeFile(path.join(out,'styles.css'), (await readFile(path.join(root,'public/styles.css'),'utf8'))+'\n.pages-notice{margin:0;padding:14px 24px;background:#e5eee5;color:#164d3d;text-align:center;font-size:13px;line-height:1.6} input:disabled,textarea:disabled,select:disabled{opacity:.65}');
await copyFile(path.join(root,'public/assets/logo.svg'),path.join(out,'logo.svg'));
await writeFile(path.join(out,'.nojekyll'),'');
await writeFile(path.join(out,'README.md'),'# GradeMint\n\nVersiune publică de prezentare pentru GitHub Pages. Arhivă BAC și test de probă, fără server, conturi sau trimitere de e-mail.\n\nSursele platformei complete se află în directoarele public, worker, data, drizzle, scripts și tests. Nu adăugați secrete în repository.\n');
console.log('GitHub Pages build ready: pages/');
