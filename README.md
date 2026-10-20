# GradeMint

**Prezentare publică:** https://sebi-2003.github.io/GradeMint/

GitHub Pages servește versiunea statică: prezentarea mentorilor, arhiva BAC și un test de probă evaluat în browser. Conturile, întrebările private, programările și e-mailurile sunt dezactivate explicit acolo. Codul platformei complete de mai jos necesită găzduire cu backend și configurarea secretelor.

Pentru a reconstrui versiunea statică: `node scripts/build-pages.mjs`; fișierele rezultate în `pages/` se publică la rădăcina site-ului Pages. Nu publicați `.local/`, fișiere `.env` reale sau date ale elevilor.

Platformă de meditații la matematică și limba română, construită de la zero în HTML, CSS și JavaScript, cu backend JavaScript și bază de date SQL.

## Ce include

- Prezentări pentru Sebi (matematică, doi ani de meditații) și Bianca (limba română).
- Identitate vizuală originală: logo SVG carte + frunză, verde mentă, crem și accente lila.
- Catalog BAC 2015–2026 pentru matematică și română, cu linkuri externe către arhivele de subiecte și bareme și către portalul Ministerului.
- Autentificare găzduită prin ChatGPT / Sites; conturi și date separate pe utilizator.
- Întrebări private pentru mentori, răspunsuri și panou de mentor cu autorizare pe server.
- Teste originale adaptate materiei, nivelului, capitolului și greșelilor recente; corectare pe server, explicații și istoric.
- Cereri de meditații și gestionarea stării lor de către mentor.
- Integrare de e-mail tranzacțional Resend pentru cereri, activă după configurarea cheii API și a expeditorului. Cererile rămân salvate și dacă e-mailul nu poate fi trimis.
- Export și ștergere a datelor contului GradeMint.
- Layout responsive, navigare cu tastatura, etichete pentru formulare, focus vizibil și respectarea preferinței de mișcare redusă.

## Pornire locală

Necesită **Node.js 24+**. Nu există dependențe npm de instalat.

```sh
npm run dev
```

Deschide `http://127.0.0.1:4173`. Autentificarea locală folosește un elev sintetic de probă, exclusiv pe loopback. Baza SQLite este creată în `.local/`, ignorată de Git. Acesta nu este serverul de producție și nu trebuie expus pe Internet.

Pentru a vedea panoul de mentor în preview, în PowerShell:

```powershell
$env:TUTOR_EMAILS = 'student@grademint.test'
npm run dev
```

Aceasta este o adresă sintetică de test. În producție folosește numai adresele reale ale mentorilor, configurate ca secrete.

## Verificări și build

```sh
npm test
npm run build
npm run validate
```

Buildul include fișierele publice în `dist/server/index.js` pentru găzduirea Worker ESM. Sursele rămân separate și organizate. Baza D1 este declarată prin bindingul `DB` în `.openai/hosting.json`; migrările sunt în `drizzle/`.

## Structură

```text
public/                 HTML, CSS, JavaScript și logo SVG
worker/                 API, autorizare, validare și notificări e-mail
data/                   bancă originală de exerciții și selecție adaptivă
drizzle/                migrări SQL
scripts/                build, preview local, adaptor SQLite, validare
tests/                  teste de securitate și funcționalitate
docs/                   arhitectură, surse, configurare e-mail
.github/workflows/      verificări automate pe GitHub
.openai/hosting.json    identitatea și bindingurile găzduirii Sites
```

## Producție

Găzduirea suportată folosește Sites / Cloudflare Workers și D1. GitHub păstrează sursa; **GitHub Pages singur nu poate executa API-ul și autentificarea**. Nu deschide pur și simplu `index.html` prin `file://` pentru funcțiile de cont.

Identitatea vine de la infrastructura de autentificare Sites. Nu înlocui acest mecanism prin încredere în headere arbitrare pe un server public. Mentorii se stabilesc în `TUTOR_EMAILS`, pe server. Pentru e-mail vezi `docs/EMAIL.md`.

Prima publicare este un preview privat pentru proprietar. Înainte de accesul elevilor trebuie stabilite audiența, datele operatorului, contactul și condițiile serviciului. Nu sunt implementate plăți, încărcări de fișiere sau promisiuni privind notele obținute.

## Securitate

Vezi `SECURITY.md` pentru controalele implementate și limitele lor. Testele acoperă izolarea conturilor, accesul mentorilor, protecția cererilor între origini, SQL parametrizat, corectarea pe server, limitele de trafic și exportul/ștergerea datelor. Aceste verificări nu reprezintă un audit independent sau o garanție absolută.
