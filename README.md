# ARES konektor pro Claude

Vzdálený MCP server, který Claudovi zpřístupní registr ARES (údaje z obchodního rejstříku, RES, živností).

## Nástroje
- **ares_firma_podle_ico** – detail firmy podle IČO
- **ares_hledat_firmu** – hledání podle názvu, volitelně obce
- **ares_overit_nazev** – kontrola, zda je název firmy volný

## Nasazení zdarma na Render.com (cca 15 minut, bez programování)
1. Založte si účet na **github.com** a vytvořte nový repozitář (např. `ares-konektor`).
2. Nahrajte do něj soubory `server.py`, `requirements.txt` a `README.md` (tlačítko *Add file → Upload files*).
3. Založte účet na **render.com** a přihlaste se přes GitHub.
4. Klikněte **New → Web Service** a vyberte repozitář.
5. Nastavte:
   - Runtime: **Python 3**
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python server.py`
   - Instance type: **Free**
6. Po nasazení dostanete adresu, např. `https://ares-konektor.onrender.com`.

## Připojení do Claude
Claude (web) → **Nastavení → Konektory → Přidat vlastní konektor**
- Název: `ARES`
- URL: `https://ares-konektor.onrender.com/mcp`

Poté se konektor objeví i v mobilní aplikaci.

## Poznámky
- Bezplatná instance Renderu po nečinnosti usíná; první dotaz může trvat ~30 s.
- ARES povoluje max. 500 dotazů za minutu.
- Údaje z ARES mají jen informativní charakter, nejsou úřední listinou.
- Server je jen pro čtení a nepotřebuje žádné heslo ani API klíč.
