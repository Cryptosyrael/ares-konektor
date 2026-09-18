"""ARES konektor pro Claude – vzdálený MCP server (streamable HTTP).

Nástroje:
  ares_firma_podle_ico   – detail subjektu podle IČO
  ares_hledat_firmu      – hledání podle názvu (a volitelně obce)
  ares_overit_nazev      – rychlá kontrola, zda je název firmy volný
"""
import os
import re
import httpx
from mcp.server.fastmcp import FastMCP

BASE = "https://ares.gov.cz/ekonomicke-subjekty-v-be/rest"
HEADERS = {"User-Agent": "ares-konektor/1.0", "Accept": "application/json"}

mcp = FastMCP("ares_mcp", host="0.0.0.0", port=int(os.environ.get("PORT", 8000)),
              stateless_http=True, json_response=True)


def _ico_ok(ico: str) -> bool:
    """Kontrola formátu a kontrolní číslice IČO."""
    if not re.fullmatch(r"\d{8}", ico):
        return False
    s = sum(int(ico[i]) * (8 - i) for i in range(7))
    c = (11 - s % 11) % 10
    return c == int(ico[7])


def _format(s: dict) -> str:
    sidlo = (s.get("sidlo") or {}).get("textovaAdresa", "neuvedeno")
    return (f"**{s.get('obchodniJmeno', '?')}**\n"
            f"- IČO: {s.get('ico', '?')}\n"
            f"- Sídlo: {sidlo}\n"
            f"- Vznik: {s.get('datumVzniku', 'neuvedeno')}\n"
            f"- Zánik: {s.get('datumZaniku', '—')}\n"
            f"- Právní forma (kód): {s.get('pravniForma', '?')}")


async def _get(path: str) -> dict:
    async with httpx.AsyncClient(timeout=15, headers=HEADERS) as c:
        r = await c.get(f"{BASE}/{path}")
        r.raise_for_status()
        return r.json()


async def _post(path: str, body: dict) -> dict:
    async with httpx.AsyncClient(timeout=15, headers=HEADERS) as c:
        r = await c.post(f"{BASE}/{path}", json=body)
        r.raise_for_status()
        return r.json()


def _err(e: Exception) -> str:
    if isinstance(e, httpx.HTTPStatusError):
        if e.response.status_code == 404:
            return "Subjekt nebyl v ARES nalezen. Zkontrolujte IČO nebo zkuste hledat podle názvu."
        if e.response.status_code == 429:
            return "ARES omezil počet dotazů. Zkuste to za minutu znovu."
        return f"ARES vrátil chybu {e.response.status_code}."
    if isinstance(e, httpx.TimeoutException):
        return "ARES neodpověděl včas. Zkuste to znovu."
    return f"Neočekávaná chyba: {type(e).__name__}"


@mcp.tool(name="ares_firma_podle_ico",
          annotations={"readOnlyHint": True, "openWorldHint": True})
async def firma_podle_ico(ico: str) -> str:
    """Vrátí údaje o ekonomickém subjektu z ARES podle IČO (8 číslic, např. '47453320')."""
    ico = ico.strip().zfill(8)
    if not _ico_ok(ico):
        return f"'{ico}' není platné IČO (8 číslic s platnou kontrolní číslicí)."
    try:
        return _format(await _get(f"ekonomicke-subjekty/{ico}"))
    except Exception as e:
        return _err(e)


@mcp.tool(name="ares_hledat_firmu",
          annotations={"readOnlyHint": True, "openWorldHint": True})
async def hledat_firmu(nazev: str, obec: str | None = None, pocet: int = 10) -> str:
    """Vyhledá subjekty v ARES podle obchodního jména (část názvu stačí).

    nazev: hledaný text, např. 'Domovník'
    obec: volitelně název obce sídla, např. 'Praha'
    pocet: max. počet výsledků (1–50)
    """
    body = {"obchodniJmeno": nazev, "start": 0, "pocet": max(1, min(pocet, 50))}
    if obec:
        body["sidlo"] = {"nazevObce": obec}
    try:
        data = await _post("ekonomicke-subjekty/vyhledat", body)
    except Exception as e:
        return _err(e)
    subj = data.get("ekonomickeSubjekty", [])
    if not subj:
        return f"Pro '{nazev}' nebyl nalezen žádný subjekt."
    head = f"Nalezeno celkem {data.get('pocetCelkem', len(subj))}, zobrazeno {len(subj)}:\n\n"
    return head + "\n\n".join(_format(s) for s in subj)


@mcp.tool(name="ares_overit_nazev",
          annotations={"readOnlyHint": True, "openWorldHint": True})
async def overit_nazev(nazev: str) -> str:
    """Orientačně ověří, zda je název firmy (bez 's.r.o.') volný. Vypíše shodné a podobné názvy.
    Výsledek je informativní – závazně rozhoduje notář / rejstříkový soud."""
    try:
        data = await _post("ekonomicke-subjekty/vyhledat",
                           {"obchodniJmeno": nazev, "start": 0, "pocet": 50})
    except Exception as e:
        return _err(e)
    subj = data.get("ekonomickeSubjekty", [])
    norm = lambda t: re.sub(r"[\s,.]|spol|s ?r ?o|a ?s", "", t.lower())
    shoda = [s for s in subj if norm(s.get("obchodniJmeno", "")) == norm(nazev)]
    if shoda:
        return ("❌ Název je OBSAZENÝ:\n\n" + "\n\n".join(_format(s) for s in shoda))
    if subj:
        podobne = ", ".join(s.get("obchodniJmeno", "?") for s in subj[:15])
        return f"✅ Přesná shoda nenalezena. Podobné názvy (riziko záměny): {podobne}"
    return "✅ Žádný subjekt s tímto názvem nenalezen."


if __name__ == "__main__":
    mcp.run(transport="streamable-http")
