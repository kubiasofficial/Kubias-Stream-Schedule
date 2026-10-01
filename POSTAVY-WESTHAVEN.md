# Hry a příběhy – WestHaven

Nové stránky:
- /hry/redm/
- /hry/redm/westhaven/
- /hry/redm/westhaven/ezekiel-crowe/
- /hry/redm/westhaven/alex/
- /hry/redm/westhaven/sky/

Na hlavní stránce je vstup Hry a příběhy. Profily obsahují jen veřejné texty schváleného podkladu; soukromé instrukce se neukládají. Portréty jsou AI upravené varianty uživatelových screenshotů. Původní obrázky zůstaly zachované.

Nasazení: commit a push změn do main v tomto repozitáři, potom počkat na Vercel Ready. Firebase pravidla ani konfiguraci není potřeba měnit.

Úprava textů: profily jsou zatím statické soubory public/hry/redm/westhaven/<postava>/index.html. Přehledové texty jsou v public/hry/redm/westhaven/index.html. Administrace programu se nemění; editor profilů není součástí této aktualizace.

Program serveru se čte ze stávajícího Firestore jako publikované streamy. Z nich se zobrazují nejbližší tři nezrušené termíny s tématem rp a slovem WestHaven v názvu nebo kategorii, jejichž konec ještě nenastal. Statické profily fungují i bez JavaScriptu, při chybě načtení programu zůstane odkaz na hlavní rozpis.

Ověření: všech šest stránek v prohlížeči na šířce 390 px bez přetékání a chybějících obrázků; hlavní stránka i na 320 px; desktop 1440 px, navigace RedM → server → profil, všechny místní odkazy a zdroje, načtení skutečného veřejného rozpisu bez zápisu do databáze. JavaScript prošel kontrolou syntaxe. Prohlížeč nehlásil JS chyby.
