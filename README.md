# KUBIAS — program streamů

HTML/CSS/JS web s Firestore, Google administrací, anonymními společnými reakcemi a kalendářovým odběrem na Vercelu.

**Nasazení této aktualizace: [AKTUALIZACE-1-2-5-7.md](AKTUALIZACE-1-2-5-7.md).** Starší návod NASAZENI-A-SPRAVA.md popisuje založení projektu; pro novou verzi má přednost návod aktualizace.

- Web: https://kubias-program.vercel.app/
- Správa: https://kubias-program.vercel.app/admin/
- Odběr po nasazení: https://kubias-program.vercel.app/api/calendar
- Implementovány pouze body 1, 2, 5, 7: společné reakce, přehlednější admin, odběr programu, výraznější ruční LIVE.
- Správa vyžaduje Google provider a admins/UID s boolean enabled=true. Reakce vyžadují Anonymous provider a nová Firestore pravidla.
- Návštěvnická identita je oddělená od přihlášení správce. Staré localStorage volby se automaticky nepřenášejí.
- Kalendář je Vercel Node funkce s veřejným čtením Firestore. Žádná Firebase Function, service-account klíč, placené API ani externí npm závislost.
- Vercel Hobby a Firebase Spark mají kvóty. Vercel Hobby platí pro osobní nekomerční použití. Firebase-only Hosting nenahrazuje Node funkci kalendáře.

Testy a omezení jsou v [OVERENI.md](OVERENI.md). Automatické testy ICS spustíš příkazem `npm.cmd test`, emulátorové testy podle návodu aktualizace. Produkční index visibility ASC + start DESC se nemění.

Při zrušení publikovaného streamu použij Zrušit stream, aby odběratelé kalendáře dostali informaci o zrušení. Aktualizace v kalendáři závisí na klientovi a nemusí být okamžitá.

Loga a zdroje: ASSET-SOURCES.md. FAZE-1-ANALYZA-A-NAVRH.md je historický návrh, nikoli specifikace hotové verze.
