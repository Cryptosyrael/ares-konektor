# Jak vznikly nahrávky Honzy, paní Jany a pana Tomáše

Zdroj: export z ElevenLabs po odstavcích, 26 souborů (`1_Chapter_2.wav` … `26_Chapter_2.wav`),
v pořadí scénáře: nejdřív všech 21 replik Honzy, pak 4 repliky paní Jany a 1 replika pana Tomáše.

## Mapování souborů na repliky

| export | kurz | export | kurz |
|---|---|---|---|
| 1 | `1.1-L1` | 2 | `1.1-L2` |
| 3 | `1.1-L3` | 4 | `2.1-L1` |
| 5 | `2.2-L1` | 6 | `2.2-L2` |
| 7 | `2.3-L1` | 8 | `2.3-L2` |
| 9 | `3.1-L1` | 10 | `3.1-L2` |
| 11 | `3.1-L3` | 12 | `3.1-L4` |
| 13 | `3.1-L5` | 14 | `3.1-L6` |
| 15 | `3.3-L1` | 16 | `3.3-L2` |
| 17 | `3.3-L3` | 18 | `3.3-L4` |
| 19 | `3.3-L5` | 20 | `3.3-L6` |
| 21 | `3.3-L7` | 22 | `2.1-J1` |
| 23 | `2.1-J2` | 24 | `2.1-J3` |
| 25 | `2.2-J1` | 26 | `2.3-T1` |

Mapování je ověřené: 24 z 26 souborů má tempo řeči 10–14 znaků za sekundu, tři odlehlé (`3.3-L4`, `3.3-L5`,
`3.3-L6`) jsou právě repliky s telefonními čísly, která Honza čte po číslicích. Výška hlasu sedí
(Honza ~165 Hz, paní Jana 211–232 Hz, pan Tomáš ~120 Hz).

## Hlas chatbota (export `Chapter_3`)

Osm souborů po odstavcích, v pořadí odpovědí chatbota: `2.1-CH1`, `2.1-CH2`, `2.1-CH3`, `2.2-CH1`,
`2.3-CH1`, `2.3-CH2`, `2.3-CH3`, `3.1-CH1`. Ověřeno tempem (11–13 znaků za sekundu; `2.2-CH1` pomaleji,
protože obsahuje telefonní číslo čtené po číslicích) a ženskou výškou hlasu (213–256 Hz). Soubory se jmenují
`KÓD-hlas.mp3`, hlasitost srovnaná na −17,8 LUFS (zisk +4,2 dB), špičky nejvýš −0,9 dB. Pod hlasem hraje
ťukání klávesnice `KÓD.mp3`.

## Úprava

Hlasitost je srovnaná na průměr Ozvěny (≈ −17,8 dB) zvlášť pro každého mluvčího (Honza +9,0 dB, paní Jana +7,1 dB,
pan Tomáš +5,9 dB), špičky omezeny na −1 dB. Formát MP3, mono, 44,1 kHz, 64 kbps.

## Dřívější chyba

Při prvním pokusu jsem repliky stříhal z jedné souvislé nahrávky podle pauz a délky textu a tvrdil jsem,
že prvních sedm je spolehlivých. **Nebylo.** První nasazená replika obsahovala dvě repliky najednou.
Všechny modely délky textu sdílely stejný předpoklad, takže se shodovaly na téže chybě. Odhad z délky textu
nenahradí skutečné hranice odstavců; teprve export po odstavcích je rozřešil.

## Ověření

Nahrávky jsem ověřil měřením (výška hlasu, délka, návaznost v přehrávači), **ne poslechem** — to nemohu.
Doporučuji poslechnout všech šest videí a potvrdit, že každý mluvčí říká právě to, co je v titulcích.
