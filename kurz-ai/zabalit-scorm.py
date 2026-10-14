#!/usr/bin/env python3
"""Zabalí kurz do SCORM balíčku pro nahrání do LMS (Moodle, Elbot a další).

    python3 zabalit-scorm.py           # SCORM 1.2 (nejširší podpora)
    python3 zabalit-scorm.py --2004    # SCORM 2004 3rd Edition

Vznikne ZIP ve složce dist/. Ten se v Moodle nahrává jako činnost „SCORM balíček“.
Manifest se generuje ze seznamu souborů, takže nemůže zůstat pozadu za obsahem.
"""
import re
import sys
import zipfile
from pathlib import Path
from xml.sax.saxutils import escape

KOREN = Path(__file__).resolve().parent
ID = 'cz.elpida.stroj-ktery-nasloucha'
NAZEV = 'Stroj, který naslouchá'

# Co patří do balíčku. Zdrojová PDF log, návody ani skripty ne.
ZAKLAD = [
    'index.html', 'styles.css',
    'scorm.js', 'content.js', 'characters.js', 'app.js',
    'obrazky/elpida-logo.svg', 'obrazky/elpida-logo-cb.svg',
    'obrazky/elpida-znak.svg', 'obrazky/elpida-znak.png',
]
# Nahrávky: přibalí se všechno, co ve složce audio/ zrovna leží.
ZVUK_PRIPONY = ('.mp3', '.m4a', '.ogg', '.wav')


def soubory() -> list:
    zvuk = sorted(
        'audio/' + s.name for s in (KOREN / 'audio').glob('*')
        if s.is_file() and s.suffix.lower() in ZVUK_PRIPONY
    )
    return ZAKLAD + zvuk


def hranice_v_procentech() -> int:
    """Přečte hranici úspěšnosti z content.js, ať ji nemusíme udržovat dvakrát."""
    text = (KOREN / 'content.js').read_text(encoding='utf-8')
    hranice = int(re.search(r'hraniceTestu:\s*(\d+)', text).group(1))
    return round(hranice / pocet_otazek(text) * 100)


def pocet_otazek(text: str) -> int:
    """Spočítá otázky v poli TEST – závorky, ne odhad podle klíčových slov."""
    zacatek = text.index('const TEST', 0)
    zacatek = text.index('[', zacatek)
    hloubka, otazek, v_retezci, znak, i = 0, 0, False, '', zacatek
    while i < len(text):
        c = text[i]
        if v_retezci:
            if c == '\\':
                i += 2
                continue
            if c == znak:
                v_retezci = False
        elif c in '"\'':
            v_retezci, znak = True, c
        elif c in '[{':
            hloubka += 1
            if c == '{' and hloubka == 2:
                otazek += 1
        elif c in ']}':
            hloubka -= 1
            if hloubka == 0:
                break
        i += 1
    if not otazek:
        raise SystemExit('V content.js se nepodařilo spočítat otázky testu.')
    return otazek


def manifest(soubory, scorm2004: bool, mastery: int) -> str:
    polozky = '\n'.join(f'      <file href="{escape(s)}"/>' for s in soubory)
    if scorm2004:
        return f'''<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="{ID}" version="1.0"
  xmlns="http://www.imsglobal.org/xsd/imscp_v1p1"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_v1p3"
  xmlns:adlseq="http://www.adlnet.org/xsd/adlseq_v1p3"
  xmlns:adlnav="http://www.adlnet.org/xsd/adlnav_v1p3"
  xmlns:imsss="http://www.imsglobal.org/xsd/imsss"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsglobal.org/xsd/imscp_v1p1 imscp_v1p1.xsd
                      http://www.adlnet.org/xsd/adlcp_v1p3 adlcp_v1p3.xsd
                      http://www.adlnet.org/xsd/adlseq_v1p3 adlseq_v1p3.xsd
                      http://www.adlnet.org/xsd/adlnav_v1p3 adlnav_v1p3.xsd
                      http://www.imsglobal.org/xsd/imsss imsss_v1p0.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>2004 3rd Edition</schemaversion>
  </metadata>
  <organizations default="org">
    <organization identifier="org">
      <title>{escape(NAZEV)}</title>
      <item identifier="item" identifierref="res">
        <title>{escape(NAZEV)}</title>
        <imsss:sequencing>
          <imsss:objectives>
            <imsss:primaryObjective objectiveID="hlavni" satisfiedByMeasure="true">
              <imsss:minNormalizedMeasure>{mastery / 100:.2f}</imsss:minNormalizedMeasure>
            </imsss:primaryObjective>
          </imsss:objectives>
        </imsss:sequencing>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="res" type="webcontent" adlcp:scormType="sco" href="index.html">
{polozky}
    </resource>
  </resources>
</manifest>
'''
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="{ID}" version="1.0"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd
                      http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="org">
    <organization identifier="org">
      <title>{escape(NAZEV)}</title>
      <item identifier="item" identifierref="res" isvisible="true">
        <title>{escape(NAZEV)}</title>
        <adlcp:masteryscore>{mastery}</adlcp:masteryscore>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="res" type="webcontent" adlcp:scormtype="sco" href="index.html">
{polozky}
    </resource>
  </resources>
</manifest>
'''


def main() -> int:
    scorm2004 = '--2004' in sys.argv

    SOUBORY = soubory()
    chybi = [s for s in ZAKLAD if not (KOREN / s).is_file()]
    if chybi:
        print('Chybí soubory: ' + ', '.join(chybi), file=sys.stderr)
        return 1

    mastery = hranice_v_procentech()
    cil = KOREN / 'dist' / ('stroj-ktery-nasloucha-scorm%s.zip' % ('2004' if scorm2004 else '12'))
    cil.parent.mkdir(exist_ok=True)

    with zipfile.ZipFile(cil, 'w', zipfile.ZIP_DEFLATED) as z:
        z.writestr('imsmanifest.xml', manifest(SOUBORY, scorm2004, mastery))
        for s in SOUBORY:
            z.write(KOREN / s, s)

    stop = len(SOUBORY) - len(ZAKLAD)
    print(f'Hotovo: {cil.relative_to(KOREN)}  ({cil.stat().st_size / 1024:.0f} kB, '
          f'{len(SOUBORY) + 1} souborů, SCORM {"2004 3rd Edition" if scorm2004 else "1.2"}, '
          f'hranice úspěšnosti {mastery} %)')
    print(f'Nahrávek v balíčku: {stop}'
          + ('' if stop else '  — složka audio/ je prázdná, videa poběží bez hlasu'))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
