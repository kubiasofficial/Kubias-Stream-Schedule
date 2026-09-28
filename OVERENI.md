# Ověření verze — 28. 9. 2026

## Prošlo

- JavaScript syntax check pro veřejný web, načítání dat a administraci.
- 19 kontrol Firestore pravidel v lokálním emulátoru demo-kubias: veřejné čtení publikovaných termínů, zákaz čtení konceptů, zákaz zápisu návštěvníkem i běžným přihlášeným účtem, zákaz přidělit si správce, správce může vytvořit/upravit/smazat, odmítnutí zastaralé verze, neplatných časů, neznámých polí a nepovoleného LIVE.
- Integrační test v Edge proti izolovanému Firebase Auth + Firestore emulátoru: účet bez role odmítnut, přidání role, import WestHavenu a blokace opakovaného importu, editace, posun o hodinu, LIVE on/off, duplikace do konceptu, zrušení, nový termín, smazání, odhlášení.
- Druhý nepřihlášený prohlížeč převzal změny přes snapshot listener a neviděl koncept.
- Formulář odmítl konec před začátkem a nejednoznačný čas při podzimním přechodu na zimní čas.
- Veřejný program: 28. 9. 2026, 18:30 Praha odpovídá 16:30 UTC. Odkaz na Twitch kubiasofiko. Loga se načítají.
- Vizuální kontrola desktop a mobil 390 px; kontrola bez vodorovného přetékání také na 320 px.
- Administrace bez konfigurace hlásí potřebné propojení a nenabízí nefunkční formulář.
- Žádné neošetřené JavaScript chyby v kontrolovaných prohlížečových relacích.

## Dosud nelze ověřit

Cloudový Firebase/Vercel projekt není založený. Google popup proti skutečnému účtu, autorizovaná produkční doména, dokončený cloudový index, skutečné hostingové CSP hlavičky a chování při vyčerpání kvót je nutné ověřit po nasazení. Emulátor nepředstavuje ověření produkčního indexu. Pro integrační test bylo použito lokální testovací přihlášení, nikoli uživatelův Google účet.

Testovací konfigurace, emulátorové přesměrování a účty jsou pouze v oddělené dočasné kopii. Produkční firebase-config.js zůstává null. Žádné cloudové prostředky nebyly vytvořeny, žádné skutečné termíny v cloudu nebyly změněny.

## Opakování bezpečnostního testu

```powershell
firebase.cmd emulators:exec --only firestore --project demo-kubias "node tests/firestore-rules.cjs"
```

Test nejprve vymaže pouze lokální emulátorovou databázi projektu demo-kubias na 127.0.0.1:8080. Nikdy jej neupravuj tak, aby mířil na produkční endpoint.
