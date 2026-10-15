# Jak vznikly Honzovy nahrávky

Zdroj: `honza-cely.mp3` — jedna souvislá nahrávka všech 21 Honzových replik (3 min), export z ElevenLabs
(soubor `01_Chapter_2.wav`). Repliky se do kurzu stříhají podle pauz mezi nimi.

## Hotovo: 7 replik (spolehlivé)

Hranice těchto sedmi replik vyšly **stejně ve všech šesti zkoušených modelech délky textu** (podle znaků, podle slabik,
s zástupnými texty i bez nich a další). U prvních tří replik odpovídá délka nahrávky textu s přesností 97–99 %.

| soubor | od | do |
|---|---|---|
| `1.1-L1.mp3` | 0.00 s | 18.10 s |
| `1.1-L2.mp3` | 19.09 s | 24.05 s |
| `1.1-L3.mp3` | 24.58 s | 40.15 s |
| `2.1-L1.mp3` | 40.61 s | 44.65 s |
| `2.2-L1.mp3` | 45.15 s | 51.30 s |
| `2.2-L2.mp3` | 51.95 s | 59.86 s |
| `2.3-L1.mp3` | 60.30 s | 63.85 s |

Hlasitost je zesílena o 8,5 dB (Honza je v exportu o ~9 dB tišší než Ozvěna) a špičky omezeny na −1 dB.

## Nehotovo: 14 replik (od `2.3-L2` po `3.2-L7`)

Od repliky `2.3-L2` už se hranice **nedají určit jen z délky textu**: jednotlivé modely se rozcházejí až o 13 s.
Honza čte rovnoměrně a pauzy mezi větami uvnitř repliky jsou stejně dlouhé jako pauzy mezi replikami
(medián 0,54 s v obou případech), takže pauza sama o sobě hranici neprozradí.

Spolehlivě to ověří až přepis řeči, nebo když se z ElevenLabs exportuje každá replika zvlášť.

Do té doby tyto repliky běží jako text se správným časováním. Seznam: `../honza-k-namluveni.md`.

## Ověření

Nahrávky jsem ověřil měřením (výška hlasu, délka, návaznost v přehrávači), **ne poslechem** — to nemohu.
Doporučuji poslechnout videa 1.1, 2.1, 2.2 a začátek 2.3 a potvrdit, že Honza říká právě to, co je v titulcích.
