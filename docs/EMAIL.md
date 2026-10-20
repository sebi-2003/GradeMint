# Notificări pentru cererile de meditații

Integrarea folosește API-ul HTTPS Resend exclusiv de pe server. Destinatarul nu este luat din formularul elevului. Nu sunt necesare parole Gmail și nicio cheie nu ajunge în frontend sau GitHub.

## Activare

1. Creează un cont la https://resend.com folosind adresa la care vrei să primești cererile.
2. În Resend, creează o cheie API cu drept limitat la trimitere de e-mailuri. Nu o trimite în chat și nu o salva în repository.
3. Configurează în managerul de secrete al găzduirii:

```text
RESEND_API_KEY = cheia cu drept de trimitere
NOTIFICATION_TO = adresa proprietarului
MAIL_FROM = GradeMint <adresa expeditorului autorizat>
```

Pentru un test către propria adresă verificată, Resend oferă expeditorul `onboarding@resend.dev`, în limitele contului său de test. Pentru utilizare normală, verifică un domeniu propriu și configurează înregistrările DNS cerute de Resend. Nu presupune că o adresă Gmail poate fi folosită drept expeditor verificat al serviciului.

4. Republică o versiune salvată a site-ului pentru a aplica noile secrete.
5. Trimite o cerere de probă. Verifică atât panoul mentorului, cât și inboxul/spamul și jurnalul Resend. Un răspuns „accepted” confirmă acceptarea de către serviciu, nu livrarea garantată în inbox.

## Comportament

- Cererea și înregistrarea notificării sunt salvate atomic în baza de date.
- Notificarea conține materia, numele de profil, disponibilitatea și mesajul elevului.
- `reply_to` este e-mailul identității autentificate, pentru ca mentorul să poată răspunde elevului. Nu este un câmp arbitrar din formular.
- Destinatarul și expeditorul sunt configurați exclusiv pe server.
- Dacă lipsesc secretele, cererea este salvată cu notificarea `not_configured`; interfața nu pretinde că s-a trimis un e-mail.
- Erorile furnizorului sunt marcate `failed`, fără logarea cheilor sau a corpului mesajului.
- Mentorul poate reîncerca notificarea din panou. Nu există un job periodic configurat în această versiune.
- Se folosește o cheie de idempotency pentru fiecare cerere. Resend păstrează aceste chei pe o perioadă limitată (consultă documentația actuală); nu este o garanție de deduplicare nelimitată.

Configurarea inițială include destinatarul cerut de proprietar prin secretul găzduirii. Trimiterea efectivă rămâne dezactivată până la furnizarea cheii Resend. Nu a fost trimis un e-mail real în lipsa acelei chei.

Documentație: https://resend.com/docs/api-reference/emails/send-email și https://resend.com/docs/dashboard/emails/idempotency-keys
