/* Průvodkyně Ozvěna — kreslená postava v SVG.
   Pracovní návrh podle grantového materiálu; finální podobu určí ilustrátor/ka.
   Nálady: vita (úsměv) · premysli (zavřená ústa) · zvazni (smutek) · upozorni (otevřená ústa) */

function ozvenaSVG(nalada, popis) {
  const n = ['vita', 'premysli', 'zvazni', 'upozorni'].includes(nalada) ? nalada : 'vita';

  const usta = {
    vita: `<path class="oz-tah" d="M74 126 q26 30 52 0 q-26 10 -52 0 z" fill="#fff"/>
           <path class="oz-tah" d="M76 129 q24 7 48 0" fill="none"/>`,
    premysli: `<rect class="oz-tah" x="80" y="126" width="40" height="13" rx="6" fill="#fff"/>
               <path class="oz-tah" d="M89 132.5h4M98 132.5h4M107 132.5h4" stroke-width="3"/>`,
    zvazni: `<path class="oz-tah" d="M76 140 q24 -26 48 0" fill="none"/>`,
    upozorni: `<rect class="oz-tah" x="78" y="122" width="44" height="22" rx="5" fill="#fff"/>
               <path class="oz-tah" d="M89 122v22M100 122v22M111 122v22" stroke-width="3"/>`
  }[n];

  const oko = n === 'zvazni'
    ? `<path class="oz-tah" d="M70 96 q30 -24 60 0 q-30 24 -60 0 z" fill="#fff"/>
       <circle cx="100" cy="96" r="10" fill="#111"/>
       <path class="oz-tah" d="M66 80 q16 -10 30 -4" fill="none" stroke-width="5"/>
       <path class="oz-tah oz-slza" d="M118 112 q7 12 0 16 q-7 -4 0 -16 z" fill="#2ec4b6"/>`
    : `<path class="oz-tah" d="M70 96 q30 -26 60 0 q-30 26 -60 0 z" fill="#fff"/>
       <circle cx="100" cy="96" r="11" fill="#111"/>
       <circle cx="104" cy="92" r="3.5" fill="#fff"/>`;

  const bublina = (n === 'premysli' || n === 'upozorni')
    ? `<g class="oz-bublina">
         <circle class="oz-tah" cx="44" cy="74" r="15" fill="${n === 'premysli' ? '#fff' : '#2ec4b6'}"/>
         <text x="44" y="81" text-anchor="middle" font-size="21" font-weight="700" fill="#111"
               font-family="Georgia, serif">${n === 'premysli' ? '?' : '!'}</text>
       </g>` : '';

  const popisek = popis ? `<title>${popis}</title>` : '';

  return `
<svg class="ozvena oz-${n}" viewBox="0 0 200 240" role="img" aria-label="Průvodkyně Ozvěna — ${{
    vita: 'vítá', premysli: 'přemýšlí', zvazni: 'zvážní', upozorni: 'upozorňuje'
  }[n]}" focusable="false">
  ${popisek}
  <defs>
    <clipPath id="ozTelo"><rect x="45" y="52" width="110" height="124" rx="24"/></clipPath>
  </defs>

  <!-- tykadla -->
  <g class="oz-tykadla">
    <path class="oz-tah" d="M72 54 L64 30" fill="none"/>
    <path class="oz-tah" d="M128 54 L136 30" fill="none"/>
    <circle class="oz-tah" cx="63" cy="25" r="8" fill="#2ec4b6"/>
    <circle class="oz-tah" cx="137" cy="25" r="8" fill="#2ec4b6"/>
  </g>

  <!-- nohy -->
  <path class="oz-tah" d="M78 176v26M122 176v26" fill="none"/>
  <ellipse class="oz-tah" cx="78" cy="208" rx="13" ry="8" fill="#2ec4b6"/>
  <ellipse class="oz-tah" cx="122" cy="208" rx="13" ry="8" fill="#2ec4b6"/>

  <!-- paže -->
  <g class="oz-paze">
    <path class="oz-ruka-tah" d="M48 92 q-30 24 -22 60" fill="none"/>
    <path class="oz-ruka-pruh" d="M48 92 q-30 24 -22 60" fill="none"/>
    <path class="oz-tah" d="M18 152 q-10 4 -8 14 q2 10 12 9 q10 -1 10 -11 q0 -8 -6 -11 z" fill="#fff"/>

    <g class="oz-paze-prava">
      <path class="oz-ruka-tah" d="M152 92 q32 -10 30 -46" fill="none"/>
      <path class="oz-ruka-pruh" d="M152 92 q32 -10 30 -46" fill="none"/>
      <path class="oz-tah" d="M172 46 q-6 -16 1 -22 q5 -4 7 2 l2 10 q4 -8 8 -4 q4 4 0 11 q6 -2 6 4 q0 7 -8 11 q-8 4 -16 -12 z" fill="#fff"/>
    </g>
  </g>

  <!-- tělo -->
  <rect class="oz-tah oz-telo" x="45" y="52" width="110" height="124" rx="24" fill="#f0555f"/>
  <g clip-path="url(#ozTelo)" class="oz-vlny">
    <path d="M30 70 q22 -14 44 0 q22 14 44 0 q22 -14 44 0" fill="none" stroke="#2ec4b6" stroke-width="9" stroke-linecap="round"/>
    <path d="M30 118 q22 -14 44 0 q22 14 44 0 q22 -14 44 0" fill="none" stroke="#2ec4b6" stroke-width="9" stroke-linecap="round"/>
    <path d="M30 162 q22 -14 44 0 q22 14 44 0 q22 -14 44 0" fill="none" stroke="#2ec4b6" stroke-width="9" stroke-linecap="round"/>
  </g>
  <rect class="oz-tah" x="45" y="52" width="110" height="124" rx="24" fill="none"/>

  ${oko}
  ${usta}
  ${bublina}
</svg>`;
}
