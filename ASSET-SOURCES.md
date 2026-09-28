# Grafické podklady a pohyb

Aktualizace 28. 9. 2026. Loga jsou lokální kopie pro označení platforem a her; nejsou součástí vlastního loga KUBIAS a nevyjadřují partnerství. Ochranné známky zůstávají jejich vlastníkům. Veřejné stažení samo o sobě neznamená licenci k libovolnému použití.

| Soubor | Původ |
| --- | --- |
| mojelogo.png | Dodáno uživatelem, původní soubor beze změny |
| westhaven.png | Dodáno uživatelem: redmwesthaven/whrp.png, beze změny |
| twitch.svg | Bílý Glitch, originální archiv [Twitch Brand](https://brand.twitch.com/uploads/Twitch-Brand.zip), cesta Twitch Logos/02. Glitch/04. White/glitch_flat_white.svg |
| kick.svg | [Oficiální Kick CDN](https://static.kick.com/kick-logo.svg), odkaz z [Brand Toolkit](https://about.kick.com/brand) |
| redm.svg | Původní inline SVG loga hlavičky [redm.net](https://redm.net/), beze změny cest a barev |
| simrail.png | Logo hry z [Steam CDN pro SimRail 1422130](https://cdn.akamai.steamstatic.com/steam/apps/1422130/logo.png) |
| dbd.png | Logo hry z [Steam CDN pro Dead by Daylight 381210](https://cdn.akamai.steamstatic.com/steam/apps/381210/logo.png) |

Kontext značek: [Twitch trademark guidelines](https://www.twitch.tv/p/en/legal/trademark/), [Kick brand toolkit](https://about.kick.com/brand), [Dead by Daylight fan-content guidelines](https://support.deadbydaylight.com/hc/en-us/articles/4437901307668-General-guidelines-on-fan-created-content).
Pro RedM a SimRail nebyla zjištěna obecná neomezená licence; použití je identifikační v rozpisu daných her, nikoli přeprodej nebo prezentace oficiálního partnerství. Loga se nepřebarvují ani negenerují. Rozměry a prázdné okraje PNG řeší CSS.

## Chování
- Ověřený uživatelský odkaz: https://www.twitch.tv/kubiasofiko .
- Kick dál vede na platformu; konkrétní profil nebyl dodán.
- Kurzorová záře: pouze jemný desktopový mouse pointer, bez zachytávání kliknutí; requestAnimationFrame končí po dosažení cíle. Při 1,8 s nečinnosti, opuštění stránky, ztrátě fokusu či použití klávesnice záře mizí.
- Na dotykových zařízeních a při prefers-reduced-motion je záře vypnutá; změna preference za běhu zastaví animace.
- Nástup karet při vstupu do viewportu, hover/focus, krátké přechody číslic countdownu a potvrzení reakce. Bez frameworku, externího animation SDK, placených služeb či analytiky.
