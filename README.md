# KUBIAS — rozpis streamů

Statický HTML/CSS/JS web s Firebase Firestore a administrací přes Google přihlášení. Bez buildu a bez placených API. Zachované oficiální herní značky, animace a jemné světlo pod myší.

**Začni souborem [NASAZENI-A-SPRAVA.md](NASAZENI-A-SPRAVA.md).** Obsahuje založení Firebase Spark, nasazení Vercel, nastavení správce a každodenní práci.

- Veřejný web: `public/index.html`
- Administrace: `/admin/`
- Firebase konfigurace: `public/firebase-config.js` (zatím `null` — doplnit z nového projektu)
- Pravidla a indexy: `firestore.rules`, `firestore.indexes.json`
- Hosting: `vercel.json`; volitelně Firebase Hosting přes `firebase.json`
- Výsledek testů: `OVERENI.md`

Bez Firebase zobrazuje oznámený WestHaven 28. 9. 2026 v 18:30 Praha. Po propojení jsou zdrojem výhradně termíny databáze; správce použije tlačítko importu. Konec 22:30 je orientační.

Lokální náhled:

```powershell
python -m http.server 4173 --bind 127.0.0.1 --directory public
```

Otevři http://127.0.0.1:4173. Google přihlášení vyžaduje skutečné nastavení Firebase a autorizovanou doménu.

Pravidla lze znovu testovat bez produkčních dat:

```powershell
firebase.cmd emulators:exec --only firestore --project demo-kubias "node tests/firestore-rules.cjs"
```

Test používá pouze lokální port 8080 a demo-kubias. Cloudový service-account klíč není potřeba.

Reakce návštěvníka jsou osobní localStorage, nikoli hlasovací backend. Nepoužíváme analytiku, Functions, Storage ani Twitch API. Vercel Hobby je omezen na nekomerční použití; bezplatná alternativa Firebase Hosting je popsaná v návodu. Bezplatné tarify mají kvóty.

Historický dokument FAZE-1-ANALYZA-A-NAVRH.md není specifikací hotové verze. Zdroj log a podmínky jejich použití jsou v ASSET-SOURCES.md.
