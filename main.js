/* ==========================================================================
   EDULOS IMOBILIÁRIA — main.js (v2)
   - Lenis + GSAP ScrollTrigger (igual ao original)
   - Loader "split curtain" (igual ao original, agora espera só o vídeo do topo)
   - Topo: a torre é construída, os andares acendem com o mouse (no celular,
     janelas tocáveis) e o clique leva a câmera para dentro do apartamento,
     com passeio pelas fotos dos ambientes e saída de trás para frente
   - Categorias: player com troca suave, avanço automático e barra de progresso
   - Sobre: vídeo, contadores
   - App: celular em código com telas que trocam e inclinação 3D na rolagem
   ========================================================================== */

/* Número do WhatsApp (DDI + DDD + número, só dígitos). TROCAR pelo real. */
const WHATSAPP = '5511900000000';

document.addEventListener('DOMContentLoaded', () => {
  const hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth < 768;
  if (hasGsap) { gsap.registerPlugin(ScrollTrigger); ScrollTrigger.config({ ignoreMobileResize: true }); }

  /* ---------------- 1. LENIS ---------------- */
  let lenis = null;
  if (typeof Lenis !== 'undefined' && !isMobile && !reduce) {
    lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenis.stop();
    if (hasGsap) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }
  }

  /* ---------------- WhatsApp ---------------- */
  document.querySelectorAll('[data-whats]').forEach((a) => {
    a.href = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(a.getAttribute('data-whats'));
    a.target = '_blank'; a.rel = 'noopener';
  });

  /* ---------------- 2. CARREGAMENTO: "EDULOS" se enche com o mar e a câmera atravessa o "O" ---------------- */
  const loader = document.getElementById('siteLoader');
  const ldSvg = document.getElementById('ldSvg');
  const ldZoom = document.getElementById('ldZoom');
  const ldFillR = document.getElementById('ldFillR');
  const ldHole = document.getElementById('ldHoleC');
  const ldPct = document.getElementById('ldPct');
  let loaderGone = false, ldAlvo = 0, ldAtual = 0, ldTopo = 330, ldBase = 560, ldO = [800, 450, 60, 40];
  document.getElementById('ldImg').setAttribute('href', 'midia/tour/torre-inicio-d.webp');
  // monta a palavra: "EDUL" + um "O" desenhado como anel (assim o furo é exato para a câmera passar) + "S"
  function montaPalavra() {
    // o quadro do SVG acompanha a proporção da tela, para a palavra caber inteira até no celular em pé
    const vh = Math.round(1600 * window.innerHeight / Math.max(1, window.innerWidth));
    ldSvg.setAttribute('viewBox', '0 0 1600 ' + vh);
    const ldImg = document.getElementById('ldImg'); ldImg.setAttribute('height', vh);
    const NS = 'http://www.w3.org/2000/svg', fs = 300, cy = vh / 2;
    const med = document.createElementNS(NS, 'text');
    med.setAttribute('font-family', 'Outfit, system-ui, sans-serif'); med.setAttribute('font-weight', '800'); med.setAttribute('font-size', fs);
    med.setAttribute('visibility', 'hidden'); ldSvg.appendChild(med);
    const larg = (t) => { med.textContent = t; return med.getComputedTextLength(); };
    const wA = larg('EDUL'), wS = larg('S');
    med.textContent = 'E'; const bb = med.getBBox();
    ldSvg.removeChild(med);
    const cap = fs * 0.7, rO = cap * 0.53, esp = fs * 0.17, gap = fs * 0.05;
    const total = wA + gap + rO * 2 + gap + wS, x0 = 800 - total / 2, base = cy + cap / 2;
    if (total > 1480) { ldSvg.setAttribute('viewBox', ((1600 - total * 1.08) / 2) + ' ' + (cy - vh * total * 1.08 / 3200) + ' ' + total * 1.08 + ' ' + vh * total * 1.08 / 1600); }
    const ocx = x0 + wA + gap + rO, rIn = rO - esp;
    ldO = [ocx, cy, rO, rIn]; ldTopo = cy - cap / 2 - 10; ldBase = base + 14;
    const pinta = (g, fill) => {
      g.innerHTML = '';
      const t1 = document.createElementNS(NS, 'text');
      t1.setAttribute('x', x0); t1.setAttribute('y', base); t1.textContent = 'EDUL';
      const t2 = document.createElementNS(NS, 'text');
      t2.setAttribute('x', ocx + rO + gap); t2.setAttribute('y', base); t2.textContent = 'S';
      [t1, t2].forEach((t) => { t.setAttribute('font-family', 'Outfit, system-ui, sans-serif'); t.setAttribute('font-weight', '800'); t.setAttribute('font-size', fs); if (fill) t.setAttribute('stroke', 'none'); g.appendChild(t); });
      const c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', ocx); c.setAttribute('cy', cy); c.setAttribute('r', rO - esp / 2);
      c.setAttribute('fill', 'none'); c.setAttribute('stroke-width', fill ? esp : 1.6);
      if (fill) c.setAttribute('stroke', '#fff');
      g.appendChild(c);
      if (!fill) {   // contorno do furo do "O"
        const c2 = c.cloneNode(); c2.setAttribute('r', rIn); c2.setAttribute('stroke-width', 1.6); g.appendChild(c2);
        const c3 = c.cloneNode(); c3.setAttribute('r', rO); c3.setAttribute('stroke-width', 1.6); g.appendChild(c3); g.removeChild(c);
      }
    };
    pinta(document.getElementById('ldGlyphM'), true);
    pinta(document.getElementById('ldGlyphS'), false);
    ldHole.setAttribute('cx', ocx); ldHole.setAttribute('cy', cy);
  }
  montaPalavra();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!loaderGone) montaPalavra(); });
  // o mar sobe dentro das letras acompanhando o carregamento
  (function enche() {
    if (loaderGone && ldAtual >= 99.5) return;
    ldAtual += (ldAlvo - ldAtual) * (reduce ? 1 : 0.12);
    const h = (ldBase - ldTopo) * ldAtual / 100;
    ldFillR.setAttribute('y', ldBase - h); ldFillR.setAttribute('height', h);
    ldPct.textContent = Math.round(ldAtual);
    requestAnimationFrame(enche);
  })();
  function setLoader(p) { ldAlvo = Math.max(ldAlvo, p); }
  function dismissLoader() {
    if (loaderGone || !loader) return;
    loaderGone = true;
    setLoader(100);
    const done = () => {
      loader.remove();
      if (lenis) { lenis.start(); lenis.resize(); }
      if (hasGsap) ScrollTrigger.refresh(true);
    };
    if (reduce) { loader.style.transition = 'opacity .3s'; loader.style.opacity = 0; document.dispatchEvent(new Event('edulos:ready')); setTimeout(done, 320); return; }
    // termina de encher, abre o furo do "O" e a câmera atravessa a letra até o topo do site
    setTimeout(() => {
      loader.classList.add('is-going');
      const [cx, cy, , rIn] = ldO, T = 1250, t0 = performance.now();
      let avisou = false;
      (function voa(now) {
        const t = Math.min(1, Math.max(0, (now - t0) / T));
        const furo = Math.min(1, t / 0.18);
        ldHole.setAttribute('r', rIn * (1 - Math.pow(1 - furo, 3)));
        const e = t < 0.18 ? 0 : Math.pow((t - 0.18) / 0.82, 2.6);
        const s = 1 + e * 70;
        ldZoom.setAttribute('transform', 'translate(' + cx + ' ' + cy + ') scale(' + s + ') translate(' + -cx + ' ' + -cy + ')');
        if (!avisou && t > 0.55) { avisou = true; document.dispatchEvent(new Event('edulos:ready')); }
        if (t < 1) requestAnimationFrame(voa); else done();
      })(t0);
    }, 380);
  }

  /* ---------------- 3. TOPO: A TORRE (obra → andares altos → planta → ambientes) ---------------- */
  const hero = document.getElementById('hero');
  const stage = document.getElementById('heroStage');
  const vObra = document.getElementById('vObra');
  const still = document.getElementById('torreFim');
  const svg = document.getElementById('andaresSvg');
  const tip = document.getElementById('floorTip');
  const obraBar = document.getElementById('obraBar');
  const zoneMark = document.getElementById('zoneMark');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  // telas em pé usam o vídeo vertical; as deitadas, o horizontal.
  // "lajes" = linhas entre os andares medidas no último quadro da obra (28 andares, de cima para baixo).
  // x0..x1 = face da frente da torre (no vertical a lateral começa em ~715 e fica de fora).
  // com mouse é sempre a versão de computador (vídeo 16:9), mesmo numa janela estreita; o vertical é só para toque em pé
  const PORTRAIT = !finePointer && window.innerHeight / window.innerWidth > 1.1;
  const F = PORTRAIT
    ? { sfx: 'm', w: 1080, h: 1920, x0: 436, x1: 704, xm: 760, lajes: [406, 441, 490, 532, 566, 605, 642, 680, 717, 756, 795, 831, 870, 919, 962, 1003, 1042, 1083, 1131, 1166, 1215, 1257, 1293, 1336, 1380, 1423, 1467, 1505, 1554] }
    : { sfx: 'd', w: 1920, h: 1080, x0: 818, x1: 1102, xm: 1106, lajes: [154, 175, 200, 227, 253, 279, 306, 333, 362, 386, 416, 443, 468, 496, 525, 552, 580, 608, 636, 664, 692, 720, 748, 777, 807, 836, 865, 894, 921] };
  const N_ANDARES = F.lajes.length - 1;
  const M = 'midia/tour/';

  // todos os andares entram no passeio, do 1º ao último (dados de exemplo: o cliente confirma status e valores)
  const PRIMEIRO = 1, ULTIMO = N_ANDARES;
  const UNID = {};
  [
    ['disp', '5,4'], ['vend', '5,5'], ['disp', '5,7'], ['vend', '5,8'], ['disp', '6,0'], ['res', '6,1'], ['disp', '6,3'],
    ['vend', '6,4'], ['disp', '6,6'], ['disp', '6,8'], ['res', '7,0'], ['disp', '7,1'], ['vend', '7,3'], ['disp', '7,5'],
    ['disp', '7,9'], ['disp', '8,2'], ['disp', '8,6'], ['res', '8,8'], ['disp', '8,9'], ['vend', '9,1'], ['disp', '9,3'],
    ['disp', '9,5'], ['res', '9,8'], ['disp', '10,0'], ['vend', '10,3'], ['disp', '10,6'], ['res', '11,0'], ['disp', '12,5'],
  ].forEach(([st, v], i) => { UNID[i + 1] = { st, preco: 'R$ ' + v + ' mi' }; });
  const ST = { disp: 'Disponível', res: 'Reservado', vend: 'Vendido' };
  const apto = (a) => a + '1';
  const pinta = (el, a) => { el.textContent = ST[UNID[a].st]; el.dataset.st = UNID[a].st; };
  let fase = 'obra';
  const modoMouse = finePointer;
  hero.classList.add(modoMouse ? 'modo-mouse' : 'modo-toque');

  still.src = M + 'torre-fim-' + F.sfx + '.webp';
  vObra.poster = M + 'torre-inicio-' + F.sfx + '.webp';
  if (!reduce) vObra.src = M + 'torre-construcao-' + F.sfx + '.mp4';

  // o andar escolhido acende: cada andar tem um recorte pré-iluminado (janelas quentes, brilho contido na silhueta
  // da torre, sem ruído), gerado a partir da foto final. aqui só se troca a opacidade.
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, at) => { const n = document.createElementNS(NS, tag); for (const k in at) n.setAttribute(k, at[k]); return n; };
  const zy0 = F.lajes[N_ANDARES - ULTIMO], zy1 = F.lajes[N_ANDARES - PRIMEIRO + 1];
  svg.setAttribute('viewBox', '0 0 ' + F.w + ' ' + F.h);
  const dim = el('rect', { class: 'tower-dim', x: 0, y: 0, width: F.w, height: F.h });
  svg.appendChild(dim);
  const LUZ = {};
  // posição de cada recorte no quadro do vídeo (gerado junto com as imagens; fica no código para abrir até sem servidor)
  const RECORTES = {"d":[{"andar":1,"arq":"andar-1-d.webp","x":791,"y":885,"w":338,"h":45},{"andar":2,"arq":"andar-2-d.webp","x":791,"y":856,"w":338,"h":47},{"andar":3,"arq":"andar-3-d.webp","x":791,"y":827,"w":338,"h":47},{"andar":4,"arq":"andar-4-d.webp","x":791,"y":798,"w":338,"h":47},{"andar":5,"arq":"andar-5-d.webp","x":791,"y":768,"w":338,"h":48},{"andar":6,"arq":"andar-6-d.webp","x":791,"y":739,"w":338,"h":47},{"andar":7,"arq":"andar-7-d.webp","x":791,"y":711,"w":338,"h":46},{"andar":8,"arq":"andar-8-d.webp","x":791,"y":683,"w":338,"h":46},{"andar":9,"arq":"andar-9-d.webp","x":791,"y":655,"w":338,"h":46},{"andar":10,"arq":"andar-10-d.webp","x":791,"y":627,"w":338,"h":46},{"andar":11,"arq":"andar-11-d.webp","x":791,"y":599,"w":338,"h":46},{"andar":12,"arq":"andar-12-d.webp","x":791,"y":571,"w":338,"h":46},{"andar":13,"arq":"andar-13-d.webp","x":791,"y":543,"w":338,"h":46},{"andar":14,"arq":"andar-14-d.webp","x":791,"y":516,"w":338,"h":45},{"andar":15,"arq":"andar-15-d.webp","x":791,"y":487,"w":338,"h":47},{"andar":16,"arq":"andar-16-d.webp","x":791,"y":459,"w":338,"h":46},{"andar":17,"arq":"andar-17-d.webp","x":791,"y":434,"w":338,"h":43},{"andar":18,"arq":"andar-18-d.webp","x":791,"y":407,"w":338,"h":45},{"andar":19,"arq":"andar-19-d.webp","x":791,"y":377,"w":338,"h":48},{"andar":20,"arq":"andar-20-d.webp","x":791,"y":353,"w":338,"h":42},{"andar":21,"arq":"andar-21-d.webp","x":791,"y":324,"w":338,"h":47},{"andar":22,"arq":"andar-22-d.webp","x":791,"y":297,"w":338,"h":45},{"andar":23,"arq":"andar-23-d.webp","x":791,"y":270,"w":338,"h":45},{"andar":24,"arq":"andar-24-d.webp","x":791,"y":244,"w":338,"h":44},{"andar":25,"arq":"andar-25-d.webp","x":791,"y":218,"w":338,"h":44},{"andar":26,"arq":"andar-26-d.webp","x":791,"y":191,"w":338,"h":45},{"andar":27,"arq":"andar-27-d.webp","x":791,"y":166,"w":338,"h":43},{"andar":28,"arq":"andar-28-d.webp","x":791,"y":145,"w":338,"h":39}],"m":[{"andar":1,"arq":"andar-1-m.webp","x":416,"y":1493,"w":331,"h":86},{"andar":2,"arq":"andar-2-m.webp","x":416,"y":1455,"w":331,"h":75},{"andar":3,"arq":"andar-3-m.webp","x":416,"y":1412,"w":331,"h":79},{"andar":4,"arq":"andar-4-m.webp","x":416,"y":1370,"w":331,"h":76},{"andar":5,"arq":"andar-5-m.webp","x":416,"y":1326,"w":331,"h":76},{"andar":6,"arq":"andar-6-m.webp","x":416,"y":1284,"w":331,"h":74},{"andar":7,"arq":"andar-7-m.webp","x":416,"y":1248,"w":331,"h":66},{"andar":8,"arq":"andar-8-m.webp","x":416,"y":1204,"w":331,"h":73},{"andar":9,"arq":"andar-9-m.webp","x":416,"y":1153,"w":331,"h":81},{"andar":10,"arq":"andar-10-m.webp","x":416,"y":1116,"w":331,"h":68},{"andar":11,"arq":"andar-11-m.webp","x":416,"y":1066,"w":331,"h":83},{"andar":12,"arq":"andar-12-m.webp","x":416,"y":1023,"w":331,"h":77},{"andar":13,"arq":"andar-13-m.webp","x":416,"y":982,"w":331,"h":76},{"andar":14,"arq":"andar-14-m.webp","x":416,"y":939,"w":331,"h":79},{"andar":15,"arq":"andar-15-m.webp","x":416,"y":894,"w":331,"h":83},{"andar":16,"arq":"andar-16-m.webp","x":416,"y":842,"w":331,"h":92},{"andar":17,"arq":"andar-17-m.webp","x":416,"y":801,"w":331,"h":85},{"andar":18,"arq":"andar-18-m.webp","x":416,"y":763,"w":331,"h":84},{"andar":19,"arq":"andar-19-m.webp","x":416,"y":722,"w":331,"h":90},{"andar":20,"arq":"andar-20-m.webp","x":416,"y":681,"w":331,"h":92},{"andar":21,"arq":"andar-21-m.webp","x":416,"y":643,"w":331,"h":92},{"andar":22,"arq":"andar-22-m.webp","x":416,"y":603,"w":331,"h":95},{"andar":23,"arq":"andar-23-m.webp","x":416,"y":564,"w":331,"h":97},{"andar":24,"arq":"andar-24-m.webp","x":416,"y":523,"w":331,"h":102},{"andar":25,"arq":"andar-25-m.webp","x":416,"y":487,"w":331,"h":99},{"andar":26,"arq":"andar-26-m.webp","x":416,"y":443,"w":331,"h":110},{"andar":27,"arq":"andar-27-m.webp","x":416,"y":392,"w":331,"h":119},{"andar":28,"arq":"andar-28-m.webp","x":416,"y":355,"w":331,"h":108}]};
  (function () {
    const j = { andares: RECORTES[F.sfx] };
    j.andares.forEach((c) => {
      const im = el('image', { class: 'lit-a', x: c.x, y: c.y, width: c.w, height: c.h, preserveAspectRatio: 'none' });
      im.dataset.src = M + c.arq;
      svg.insertBefore(im, svg.querySelector('.andar'));
      LUZ[c.andar] = im;
    });
    if (fase !== 'obra') carregaLuzes();
  })();
  function carregaLuzes() { Object.values(LUZ).forEach((im) => { if (!im.getAttribute('href')) im.setAttribute('href', im.dataset.src); }); }
  // áreas de clique, do 1º ao último andar. No computador a torre é vista de frente: um retângulo por andar.
  // No vertical ela aparece de baixo, em perspectiva: as lajes inclinam, então cada andar é um polígono
  // que acompanha a laje (mesma geometria do recorte aceso). [pontos, centro vertical na metade da fachada]
  const CLIQUE_M = {"1":["426,1501 470,1504 520,1507 570,1510 620,1513 670,1516 704,1514 714,1515 714,1565 704,1564.5 670,1567.5 620,1563.5 570,1560 520,1556 470,1552.5 426,1549",1535.0],"2":["426,1463.5 470,1466 520,1468.5 570,1471 620,1474 670,1476.5 704,1475 714,1476 714,1515 704,1514 670,1516 620,1513 570,1510 520,1507 470,1504 426,1501",1490.6],"3":["426,1420.5 470,1422 520,1424.5 570,1426.5 620,1428.5 670,1430.5 704,1429.5 714,1431 714,1476 704,1475 670,1476.5 620,1474 570,1471 520,1468.5 470,1466 426,1463.5",1448.8],"4":["426,1378 470,1379.5 520,1381 570,1382.5 620,1384 670,1385.5 704,1385 714,1387 714,1431 704,1429.5 670,1430.5 620,1428.5 570,1426.5 520,1424.5 470,1422 426,1420.5",1404.4],"5":["426,1334.5 470,1335.5 520,1336.5 570,1337.5 620,1338.5 670,1339.5 704,1340 714,1342 714,1387 704,1385 670,1385.5 620,1384 570,1382.5 520,1381 470,1379.5 426,1378",1360.0],"6":["426,1292.5 470,1293 520,1293.5 570,1293.5 620,1294 670,1294.5 704,1295.5 714,1297.5 714,1342 704,1340 670,1339.5 620,1338.5 570,1337.5 520,1336.5 470,1335.5 426,1334.5",1315.7],"7":["426,1257 470,1257 520,1257 570,1257 620,1257 670,1257 704,1258.5 714,1261 714,1297.5 704,1295.5 670,1294.5 620,1294 570,1293.5 520,1293.5 470,1293 426,1292.5",1275.4],"8":["426,1215.5 470,1215 520,1214.5 570,1214 620,1213.5 670,1213 704,1215.5 714,1218 714,1261 704,1258.5 670,1257 620,1257 570,1257 520,1257 470,1257 426,1257",1235.6],"9":["426,1167.5 470,1166.5 520,1165.5 570,1164 620,1163 670,1162 704,1165 714,1167.5 714,1218 704,1215.5 670,1213 620,1213.5 570,1214 520,1214.5 470,1215 426,1215.5",1189.2],"10":["426,1133 470,1131.5 520,1130 570,1128.5 620,1127 670,1125.5 704,1129 714,1131.5 714,1167.5 704,1165 670,1162 620,1163 570,1164 520,1165.5 470,1166.5 426,1167.5",1146.3],"11":["426,1086 470,1084 520,1081.5 570,1079.5 620,1077.5 670,1075 704,1079.5 714,1082.5 714,1131.5 704,1129 670,1125.5 620,1127 570,1128.5 520,1130 470,1131.5 426,1133",1104.0],"12":["426,1045.5 470,1043 520,1040.5 570,1037.5 620,1035 670,1032.5 704,1037 714,1040.5 714,1082.5 704,1079.5 670,1075 620,1077.5 570,1079.5 520,1081.5 470,1084 426,1086",1058.6],"13":["426,1007 470,1004.5 520,1001 570,998 620,994.5 670,991.5 704,997 714,1000.5 714,1040.5 704,1037 670,1032.5 620,1035 570,1037.5 520,1040.5 470,1043 426,1045.5",1017.8],"14":["426,966.5 470,963.5 520,960 570,956 620,952.5 670,948.5 704,955 714,958.5 714,1000.5 704,997 670,991.5 620,994.5 570,998 520,1001 470,1004.5 426,1007",977.0],"15":["426,924.5 470,920.5 520,916.5 570,912 620,908 670,904 704,910.5 714,914.5 714,958.5 704,955 670,948.5 620,952.5 570,956 520,960 470,963.5 426,966.5",934.2],"16":["426,876 470,872 520,867 570,862 620,857.5 670,852.5 704,860 714,864 714,914.5 704,910.5 670,904 620,908 570,912 520,916.5 470,920.5 426,924.5",887.2],"17":["426,838 470,833 520,828 570,822.5 620,817 670,812 704,820 714,824.5 714,864 704,860 670,852.5 620,857.5 570,862 520,867 470,872 426,876",842.4],"18":["426,802.5 470,797.5 520,791.5 570,785.5 620,780 670,774 704,783 714,787.5 714,824.5 704,820 670,812 620,817 570,822.5 520,828 470,833 426,838",804.1],"19":["426,764 470,758.5 520,752 570,746 620,739.5 670,733.5 704,742.5 714,747.5 714,787.5 704,783 670,774 620,780 570,785.5 520,791.5 470,797.5 426,802.5",765.8],"20":["426,725.5 470,719.5 520,713 570,706 620,699.5 670,692.5 704,702.5 714,707.5 714,747.5 704,742.5 670,733.5 620,739.5 570,746 520,752 470,758.5 426,764",726.1],"21":["426,689.5 470,683 520,675.5 570,668.5 620,661 670,654 704,664.5 714,669.5 714,707.5 704,702.5 670,692.5 620,699.5 570,706 520,713 470,719.5 426,725.5",687.3],"22":["426,652 470,645 520,637.5 570,629.5 620,622 670,614.5 704,625.5 714,630.5 714,669.5 704,664.5 670,654 620,661 570,668.5 520,675.5 470,683 426,689.5",649.1],"23":["426,615.5 470,608.5 520,600 570,592 620,584 670,575.5 704,587 714,592.5 714,630.5 704,625.5 670,614.5 620,622 570,629.5 520,637.5 470,645 426,652",610.8],"24":["426,577 470,569.5 520,561 570,552 620,543.5 670,535 704,547 714,552.5 714,592.5 704,587 670,575.5 620,584 570,592 520,600 470,608.5 426,615.5",572.0],"25":["426,543.5 470,535.5 520,526.5 570,517.5 620,508.5 670,499.5 704,512 714,518 714,552.5 704,547 670,535 620,543.5 570,552 520,561 470,569.5 426,577",534.8],"26":["426,502.5 470,494 520,484 570,474.5 620,465 670,455.5 704,469 714,475 714,518 704,512 670,499.5 620,508.5 570,517.5 520,526.5 470,535.5 426,543.5",496.0],"27":["426,454 470,445 520,435 570,424.5 620,414.5 670,404 704,418.5 714,424.5 714,475 704,469 670,455.5 620,465 570,474.5 520,484 470,494 426,502.5",449.6],"28":["426,419.5 470,410.5 520,399.5 570,389 620,378.5 670,367.5 704,382.5 714,388.5 714,424.5 704,418.5 670,404 620,414.5 570,424.5 520,435 470,445 426,454",406.8]};
  for (let a = PRIMEIRO; a <= ULTIMO; a++) {
    const k = N_ANDARES - a;
    if (F.sfx === 'm') svg.appendChild(el('polygon', { class: 'andar', points: CLIQUE_M[a][0], 'data-andar': a }));
    else svg.appendChild(el('rect', { class: 'andar', x: F.x0 - 10, width: F.x1 - F.x0 + 20, y: F.lajes[k], height: F.lajes[k + 1] - F.lajes[k], 'data-andar': a }));
  }

  // ponto do quadro do vídeo → tela (o vídeo usa object-fit: cover, centralizado)
  function mapa(x, y) {
    const W = stage.clientWidth, H = stage.clientHeight, s = Math.max(W / F.w, H / F.h);
    return [(W - F.w * s) / 2 + x * s, (H - F.h * s) / 2 + y * s];
  }
  const meio = (a) => { if (F.sfx === 'm') return CLIQUE_M[a][1]; const k = N_ANDARES - a; return (F.lajes[k] + F.lajes[k + 1]) / 2; };
  // no computador o colchete fica à direita da torre; no toque, à esquerda (à direita não cabe o texto)
  function posZona() {
    const xr = mapa(F.xm, 0)[0], xl = mapa(F.x0, 0)[0], y0 = mapa(0, zy0)[1], y1 = mapa(0, zy1)[1];
    const direita = modoMouse && xr + 140 < stage.clientWidth;
    zoneMark.classList.toggle('is-left', !direita);
    zoneMark.style.left = (direita ? xr + 12 : xl - 12) + 'px'; zoneMark.style.top = y0 + 'px'; zoneMark.style.height = (y1 - y0) + 'px';
  }
  posZona();
  window.addEventListener('resize', () => { posZona(); if (hoverA) posTip(hoverA); });

  // acender um andar (mouse no computador; fileira de andares no toque)
  let hoverA = 0;
  const tipN = document.getElementById('floorTipN'), tipS = document.getElementById('floorTipS');
  const tipP = document.getElementById('floorTipP'), tipSt = document.getElementById('floorTipSt');
  // a etiqueta sai da fachada para a direita; sem espaço, para a esquerda; sem espaço dos dois lados
  // (janela estreita), fica por cima da torre, logo acima do andar, sem cobrir a luz
  function posTip(a) {
    const [xr, y] = mapa(F.x1, meio(a)), xl = mapa(F.x0, 0)[0], W = stage.clientWidth;
    const tw = Math.min(tip.offsetWidth || 180, 220), th = Math.min(tip.offsetHeight || 120, 160);
    const k = N_ANDARES - a, meiaFaixa = (mapa(0, F.lajes[k + 1])[1] - mapa(0, F.lajes[k])[1]) / 2;
    let lado = 'dir';
    if (xr + 34 + tw + 12 > W) lado = xl - 34 - tw - 12 >= 0 ? 'esq' : 'cima';
    tip.classList.toggle('to-left', lado === 'esq');
    tip.classList.toggle('to-over', lado === 'cima');
    if (lado === 'cima') {
      const cx = Math.min(Math.max((xl + xr) / 2 - tw / 2, 12), W - tw - 12);
      const topo = y - meiaFaixa - 14 - th;
      tip.style.left = cx + 'px'; tip.style.top = (topo > 12 ? topo : y + meiaFaixa + 14) + 'px';
    } else { tip.style.left = (lado === 'dir' ? xr : xl) + 'px'; tip.style.top = y + 'px'; }
  }
  function acende(a) {
    if (hoverA === a) return;
    hoverA = a;
    svg.classList.toggle('has-hover', !!a);
    zoneMark.classList.toggle('is-quiet', !!a);
    if (!a) { tip.classList.remove('show'); Object.values(LUZ).forEach((im) => im.classList.remove('is-on')); return; }
    Object.entries(LUZ).forEach(([n, im]) => im.classList.toggle('is-on', +n === a));
    if (modoMouse) {
      tipN.textContent = a + 'º'; tipS.textContent = 'Apto ' + apto(a) + ' · 200 m² · 3 suítes';
      tipP.textContent = UNID[a].preco; pinta(tipSt, a);
      posTip(a); tip.classList.add('show');
    }
  }
  svg.addEventListener('pointerover', (e) => { if (fase === 'torre' && finePointer && e.target.dataset && e.target.dataset.andar) acende(+e.target.dataset.andar); });
  svg.addEventListener('pointerout', (e) => { if (finePointer && (!e.relatedTarget || !e.relatedTarget.classList || !e.relatedTarget.classList.contains('andar'))) acende(0); });
  svg.addEventListener('click', (e) => {
    if (!e.target.dataset || !e.target.dataset.andar) return;
    if (fase === 'obra') paraTorre();
    const a = +e.target.dataset.andar;
    if (modoMouse) entrar(a); else escolhe(a);
  });
  document.getElementById('towerHint').addEventListener('click', () => entrar(21));

  // toque: uma fileira (rolável) com todos os andares; o andar escolhido acende na torre e mostra a ficha
  const fpChips = document.getElementById('fpChips'), fpCard = document.getElementById('fpCard');
  const fpN = document.getElementById('fpN'), fpS = document.getElementById('fpS'), fpSt = document.getElementById('fpSt');
  let escolhido = 0;
  for (let a = ULTIMO; a >= PRIMEIRO; a--) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'fp-chip'; b.dataset.andar = a; b.dataset.st = UNID[a].st;
    b.setAttribute('aria-pressed', 'false');
    b.innerHTML = a + 'º';
    b.setAttribute('aria-label', a + 'º andar, ' + ST[UNID[a].st].toLowerCase());
    b.addEventListener('click', () => escolhe(a));
    fpChips.appendChild(b);
  }
  function escolhe(a) {
    if (fase === 'obra') paraTorre();
    escolhido = a;
    acende(a);
    fpChips.querySelectorAll('.fp-chip').forEach((c) => {
      const on = +c.dataset.andar === a; c.classList.toggle('is-on', on); c.setAttribute('aria-pressed', on);
      if (on) fpChips.scrollTo({ left: c.offsetLeft - (fpChips.clientWidth - c.offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' });
    });
    fpN.textContent = a + 'º andar';
    fpS.textContent = 'Apto ' + apto(a) + ' · 200 m² · ' + UNID[a].preco;
    pinta(fpSt, a);
    fpCard.classList.add('show');
  }
  document.getElementById('fpGo').addEventListener('click', () => { if (escolhido) entrar(escolhido); });

  // a obra: barra de progresso; no fim a torre fica interativa
  function paraTorre() {
    if (fase !== 'obra') return;
    fase = 'torre'; hero.dataset.fase = 'torre';
    if (!vObra.paused) vObra.pause();
    carregaLuzes();
    if (!reduce) hero.classList.add('do-sweep');
    posZona();
  }
  vObra.addEventListener('timeupdate', () => {
    if (!vObra.duration) return;
    const p = vObra.currentTime / vObra.duration;
    obraBar.style.width = (p * 100).toFixed(1) + '%';
  });
  vObra.addEventListener('ended', paraTorre);
  vObra.addEventListener('error', () => { if (loaderGone) paraTorre(); });
  document.getElementById('obraSkip').addEventListener('click', paraTorre);

  // a cortina só abre quando o último quadro e o começo do vídeo da obra estão prontos
  (function preload() {
    setLoader(12);
    const need = reduce ? 1 : 2;
    let done = 0;
    const step = () => { done++; setLoader(12 + (done / need) * 84); if (done >= need) setTimeout(dismissLoader, 200); };
    if (still.complete && still.naturalWidth) step();
    else { still.addEventListener('load', step, { once: true }); still.addEventListener('error', step, { once: true }); }
    if (!reduce) { vObra.addEventListener('loadeddata', step, { once: true }); vObra.addEventListener('error', step, { once: true }); }
    setTimeout(dismissLoader, 4000);
  })();
  document.addEventListener('edulos:ready', () => {
    setTimeout(paraTorre, 11000);
    if (reduce || !vObra.src) { paraTorre(); return; }
    const p = vObra.play();
    if (p && p.catch) p.catch(() => paraTorre());
  }, { once: true });

  /* ---------------- 3b. O APARTAMENTO: rasante → planta 3D → ambiente → e tudo de volta, ao contrário ---------------- */
  const tour = document.getElementById('apTour');
  const slidesBox = document.getElementById('apSlides');
  const vIda = document.getElementById('vIda');
  const vVolta = document.getElementById('vVolta');
  const apName = document.getElementById('apName');
  const apDesc = document.getElementById('apDesc');
  const apCount = document.getElementById('apCount');
  const apAndar = document.getElementById('apAndar');
  const dotsBox = document.getElementById('apDots');
  const btnPrev = document.getElementById('apPrev');
  const btnNext = document.getElementById('apNext');
  const btnSair = document.getElementById('apSair');
  const plan = document.getElementById('apPlan');
  const planModel = document.getElementById('planModel');
  const planImg = document.getElementById('planImg');
  const planSvg = document.getElementById('planSvg');
  const planPins = document.getElementById('planPins');
  const ppRooms = document.getElementById('ppRooms');
  // pin e áreas em pixels da planta (2261 × 1241)
  const PW = 2261, PH = 1241;
  const AMB = [
    { id: 'sala', nome: 'Sala de estar', area: '31 m²', desc: 'Living integrado de 31 m², pé-direito de 2,90 m e parede de vidro voltada para o mar.', pins: [[1005, 450]], areas: [[[825, 215], [1188, 215], [1188, 688], [825, 688]]] },
    { id: 'jantar', nome: 'Sala de jantar', area: '18 m²', desc: 'Mesa para oito, lustre sob medida e a orla iluminada ao fundo.', pins: [[1302, 455]], areas: [[[1190, 215], [1418, 215], [1418, 688], [1190, 688]]] },
    { id: 'cozinha', nome: 'Cozinha gourmet', area: '24 m²', desc: 'Ilha em mármore, marcenaria em nogueira e eletros embutidos.', pins: [[1150, 905]], areas: [[[805, 705], [1435, 705], [1435, 1095], [805, 1095]]] },
    { id: 'varanda', nome: 'Varanda gourmet', area: '37 m²', desc: '37 m² de frente para o mar, com churrasqueira e espreguiçadeiras.', pins: [[1130, 128]], areas: [[[198, 52], [2062, 52], [2062, 205], [198, 205]]] },
    { id: 'suite-master', nome: 'Suíte master', area: '34 m²', desc: 'Closet com portas de vidro e a cama voltada para a vista.', pins: [[575, 430]], areas: [[[165, 215], [820, 215], [820, 590], [378, 590], [378, 402], [165, 402]]] },
    { id: 'banho-master', nome: 'Banho da suíte', area: '12 m²', desc: 'Banheira de imersão, cuba dupla e metais dourados.', pins: [[255, 640]], areas: [[[130, 405], [375, 405], [375, 600], [480, 600], [480, 772], [130, 772]]] },
    { id: 'suite-2', nome: 'Suítes 02 e 03', area: '22 m² cada', desc: 'Mais duas suítes no mesmo padrão, as duas com vista para o mar.', pins: [[1880, 420], [1705, 905]], areas: [[[1630, 215], [2122, 215], [2122, 600], [1630, 600]], [[1450, 708], [1962, 708], [1962, 1050], [1450, 1050]]] },
  ];
  // planta que gira: sequência de quadros de um vídeo da maquete girando (fundo branco). O quadro de descanso
  // (vista de frente) é o único com ambientes clicáveis; ao arrastar, a maquete gira e, ao soltar, volta para ele.
  // pinos e áreas em pixels do quadro (1280 × 720)
  const GIRO = { n: 127, rest: 63, w: 1280, h: 720, amb: {"sala":{"p":[[650,280]],"a":[[[505,255],[690,200],[745,178],[820,295],[735,330],[640,360],[560,345]]]},"jantar":{"p":[[740,352]],"a":[[[640,360],[735,330],[820,300],[850,325],[780,355],[700,395],[650,395]]]},"cozinha":{"p":[[400,410]],"a":[[[225,355],[450,288],[560,388],[560,425],[400,500],[345,510],[300,440]]]},"varanda":{"p":[[930,250]],"a":[[[620,70],[725,40],[1250,405],[1245,470],[1125,500],[1100,445],[1050,445],[975,360],[900,300],[820,250],[745,178],[700,110]]]},"suite-master":{"p":[[560,190]],"a":[[[430,175],[515,100],[610,72],[700,110],[745,178],[680,200],[510,255],[500,290],[455,215]]]},"banho-master":{"p":[[385,185]],"a":[[[295,160],[500,100],[515,105],[430,175],[455,215],[330,260],[300,210]]]},"suite-2":{"p":[[905,455],[530,565]],"a":[[[750,385],[900,300],[960,340],[1020,410],[1100,450],[900,550],[845,560],[770,470]],[[395,505],[540,450],[610,470],[700,600],[640,660],[550,700],[500,640],[450,560]]]}} };
  const giroSrc = (k) => M + 'giro-' + (window.innerWidth < 900 ? 'm' : 'd') + '/' + String(k).padStart(3, '0') + '.webp';
  const DUR = 900, RAPIDO = 380, MERGULHO = 620, EASE = 'cubic-bezier(.22,1,.36,1)';
  const VEL = 2;   // rasante em dobro: a subida até o andar leva ~3 s
  let vigia = 0;   // se um vídeo travar (rede lenta), o passeio segue sem ele
  const vigiar = (fn, ms) => { clearTimeout(vigia); vigia = setTimeout(fn, ms); };
  // toca um vídeo do passeio; se não começar em 1,2 s ou não terminar a tempo, segue em frente
  function tocar(v, fim) {
    v.currentTime = 0; v.playbackRate = VEL; v.defaultPlaybackRate = VEL;
    v.classList.add('on');
    const p = v.play();
    if (p && p.catch) p.catch(() => fim());
    const total = ((v.duration || 6) / VEL) * 1000;
    vigiar(() => { if (v.currentTime < 0.05) { v.pause(); fim(); } else vigiar(() => { v.pause(); fim(); }, total + 1200); }, 1200);
  }
  let slides = [], cur = 0, aberto = false, ocupado = false, lastFocus = null, andarAtual = 21, direto = false;
  const sairTxt = btnSair.querySelector('span'), endTxt = document.getElementById('apEndSair');

  function trava(on) {
    document.documentElement.classList.toggle('tour-lock', on);
    if (lenis) { if (on) lenis.stop(); else lenis.start(); }
  }
  function preparaIda() {
    if (vIda.dataset.ok) return;
    vIda.dataset.ok = '1';
    vIda.poster = M + 'torre-fim-' + F.sfx + '.webp';
    vIda.preload = 'auto'; vIda.src = M + 'rasante-' + F.sfx + '.mp4';
  }
  function whats(a, msg) { a.dataset.whats = msg; a.href = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(msg); a.target = '_blank'; a.rel = 'noopener'; }

  // a planta: imagem, ambientes que acendem, pinos numerados e a lista do painel (montados uma vez)
  function montaPlanta() {
    if (planImg.getAttribute('src')) return;
    const src = giroSrc(GIRO.rest);
    planImg.src = src;
    planSvg.setAttribute('viewBox', '0 0 ' + GIRO.w + ' ' + GIRO.h);
    const pdefs = el('defs', {});
    const fAcesa = el('filter', { id: 'fAcesa', 'color-interpolation-filters': 'sRGB' });
    fAcesa.appendChild(el('feComponentTransfer', {}));
    fAcesa.firstChild.append(el('feFuncR', { type: 'linear', slope: 1.16, intercept: 0.02 }), el('feFuncG', { type: 'linear', slope: 1.13, intercept: 0.015 }), el('feFuncB', { type: 'linear', slope: 1.04 }));
    pdefs.appendChild(fAcesa);
    planSvg.appendChild(pdefs);
    const gLuz = el('g', { class: 'pl-luz' }), gHit = el('g', { class: 'pl-hit' });
    AMB.forEach((a, i) => {
      const G = GIRO.amb[a.id];
      const d = G.a.map((ar) => 'M' + ar.map((p) => p.join(' ')).join('L') + 'Z').join('');
      const cp = el('clipPath', { id: 'cp-' + a.id }); cp.appendChild(el('path', { d })); pdefs.appendChild(cp);
      const im = el('image', { width: GIRO.w, height: GIRO.h, 'clip-path': 'url(#cp-' + a.id + ')', filter: 'url(#fAcesa)', preserveAspectRatio: 'none', 'data-i': i });
      im.setAttribute('href', src);
      gLuz.appendChild(im);
      const hit = el('path', { d, 'data-i': i, class: 'pl-area', pathLength: 100 });
      gHit.appendChild(hit);
      G.p.forEach((p, k) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'pl-pin'; b.dataset.i = i;
        b.style.left = (p[0] / GIRO.w * 100) + '%'; b.style.top = (p[1] / GIRO.h * 100) + '%';
        b.style.setProperty('--d', (0.2 + i * 0.04 + k * 0.03) + 's');
        b.setAttribute('aria-label', 'Entrar: ' + a.nome);
        if (k) b.tabIndex = -1;
        b.innerHTML = '<b>' + String(i + 1).padStart(2, '0') + '</b><span>' + a.nome + '</span>';
        planPins.appendChild(b);
      });
      const li = document.createElement('li');
      li.innerHTML = '<button type="button" data-i="' + i + '"><b>' + String(i + 1).padStart(2, '0') + '</b><span>' + a.nome + '</span><em>' + a.area + '</em><i class="fa-solid fa-arrow-right"></i></button>';
      li.style.setProperty('--d', (0.45 + i * 0.05) + 's');
      ppRooms.appendChild(li);
    });
    planSvg.append(gLuz, gHit);
    const marca = (i) => {
      planModel.classList.toggle('has-hover', i !== null);
      planSvg.querySelectorAll('[data-i]').forEach((n) => n.classList.toggle('is-on', i !== null && +n.dataset.i === i));
      planPins.querySelectorAll('.pl-pin').forEach((n) => n.classList.toggle('is-on', i !== null && +n.dataset.i === i));
      ppRooms.querySelectorAll('button').forEach((n) => n.classList.toggle('is-on', i !== null && +n.dataset.i === i));
    };
    [gHit, planPins, ppRooms].forEach((box) => {
      box.addEventListener('pointerover', (e) => { const t = e.target.closest('[data-i]'); if (t && finePointer) marca(+t.dataset.i); });
      box.addEventListener('pointerout', (e) => { if (finePointer && !(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('[data-i]'))) marca(null); });
      box.addEventListener('focusin', (e) => { const t = e.target.closest('[data-i]'); if (t) marca(+t.dataset.i); });
      box.addEventListener('focusout', () => marca(null));
      box.addEventListener('click', (e) => { const t = e.target.closest('[data-i]'); if (t) { marca(null); abreAmbiente(+t.dataset.i, t); } });
    });
    iniciaGiro(marca);
    // a maquete inclina de leve seguindo o mouse
    if (finePointer && !reduce) {
      const st = document.getElementById('planStage');
      let raf = 0;
      st.addEventListener('pointermove', (e) => {
        if (tour.dataset.fase !== 'planta' || planModel.classList.contains('girando')) return;
        const r = st.getBoundingClientRect(), nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => { planModel.style.setProperty('--rx', (-ny * 5).toFixed(2) + 'deg'); planModel.style.setProperty('--ry', (nx * 6).toFixed(2) + 'deg'); });
      });
      st.addEventListener('pointerleave', () => { planModel.style.setProperty('--rx', '0deg'); planModel.style.setProperty('--ry', '0deg'); });
    }
  }
  // arrastar gira a maquete (quadro a quadro); um clique sem arrastar continua abrindo o ambiente
  function iniciaGiro(marca) {
    const cv = document.createElement('canvas');
    const pequeno = window.innerWidth < 900;
    cv.className = 'plan-giro'; cv.width = pequeno ? 800 : 1280; cv.height = pequeno ? 450 : 720;
    planImg.after(cv);
    const ctx = cv.getContext('2d');
    const Q = new Array(GIRO.n);
    // carrega do quadro de descanso para fora, para os vizinhos chegarem primeiro
    const ordem = [GIRO.rest];
    for (let d = 1; ordem.length < GIRO.n; d++) { if (GIRO.rest + d < GIRO.n) ordem.push(GIRO.rest + d); if (GIRO.rest - d >= 0) ordem.push(GIRO.rest - d); }
    let fila = 0;
    const proximo = () => {
      if (fila >= ordem.length) return;
      const k = ordem[fila++], im = new Image();
      im.decoding = 'async';
      im.onload = im.onerror = () => { if (im.naturalWidth) Q[k] = im; proximo(); };
      im.src = giroSrc(k);
    };
    for (let j = 0; j < 4; j++) proximo();
    let cur = GIRO.rest;
    const desenha = (f) => {
      const k = Math.max(0, Math.min(GIRO.n - 1, Math.round(f)));
      let im = Q[k];
      for (let d = 1; !im && d < GIRO.n; d++) im = Q[k - d] || Q[k + d];
      if (im) ctx.drawImage(im, 0, 0, cv.width, cv.height);
    };
    let x0 = 0, f0 = 0, ativo = false, girou = false, volta = 0, anim = 0, id = null;
    const POR_PX = () => (GIRO.n * 0.85) / planModel.clientWidth;   // atravessar a maquete ≈ quase toda a volta
    const voltaPraFrente = () => {
      const de = cur, t0 = performance.now(), dur = reduce ? 0 : 650;
      cancelAnimationFrame(anim);
      const passo = (t) => {
        const p = dur ? Math.min(1, (t - t0) / dur) : 1, e = 1 - Math.pow(1 - p, 3);
        cur = de + (GIRO.rest - de) * e; desenha(cur);
        if (p < 1) anim = requestAnimationFrame(passo);
        else { cur = GIRO.rest; planModel.classList.remove('girando'); }
      };
      anim = requestAnimationFrame(passo);
    };
    planModel.addEventListener('pointerdown', (e) => {
      if (tour.dataset.fase !== 'planta' || (e.pointerType === 'mouse' && e.button !== 0)) return;
      ativo = true; girou = false; x0 = e.clientX; f0 = cur; id = e.pointerId;
      clearTimeout(volta); cancelAnimationFrame(anim);
    });
    planModel.addEventListener('pointermove', (e) => {
      if (!ativo || e.pointerId !== id) return;
      const dx = e.clientX - x0;
      if (!girou) {
        if (Math.abs(dx) < 6) return;
        girou = true; marca(null);
        planModel.setPointerCapture(id);
        desenha(cur);
        planModel.classList.add('girando', 'is-grab');
      }
      // arrastar para a esquerda gira a frente da maquete para a esquerda
      cur = Math.max(0, Math.min(GIRO.n - 1, f0 - dx * POR_PX()));
      desenha(cur);
    });
    const solta = (e) => {
      if (!ativo || e.pointerId !== id) return;
      ativo = false; planModel.classList.remove('is-grab');
      if (girou) volta = setTimeout(voltaPraFrente, 900);
    };
    planModel.addEventListener('pointerup', solta);
    planModel.addEventListener('pointercancel', solta);
    // depois de girar, o clique que encerra o arraste não abre ambiente
    planModel.addEventListener('click', (e) => { if (girou) { e.stopPropagation(); e.preventDefault(); girou = false; } }, true);
  }
  function fichaAndar(a) {
    andarAtual = a;
    document.getElementById('ppAndar').textContent = a + 'º andar';
    document.getElementById('ppApto').textContent = apto(a);
    document.getElementById('ppPrice').textContent = UNID[a].preco;
    pinta(document.getElementById('ppSt'), a);
    document.getElementById('ppPrev').disabled = a <= PRIMEIRO;
    document.getElementById('ppNext').disabled = a >= ULTIMO;
    whats(document.getElementById('ppCta'), 'Olá! Vi a planta do apartamento ' + apto(a) + ' (' + a + 'º andar) no site e quero agendar uma visita.');
    apAndar.innerHTML = '<b>' + a + 'º andar</b><span>Apto ' + apto(a) + ' · 200 m² · 3 suítes</span>';
  }
  document.getElementById('ppPrev').addEventListener('click', () => { if (andarAtual > PRIMEIRO) trocaAndar(andarAtual - 1); });
  document.getElementById('ppNext').addEventListener('click', () => { if (andarAtual < ULTIMO) trocaAndar(andarAtual + 1); });
  function trocaAndar(a) {
    const box = document.getElementById('planPanel');
    box.classList.add('swap');
    setTimeout(() => { fichaAndar(a); box.classList.remove('swap'); }, 180);
  }

  function montaSlides() {
    if (slides.length) return;
    AMB.forEach((a, i) => {
      const d = document.createElement('div'); d.className = 'ap-slide';
      const im = document.createElement('img'); im.alt = a.nome; im.decoding = 'async';
      im.dataset.src = M + a.id + '-' + F.sfx + '.webp';
      d.appendChild(im); slidesBox.appendChild(d); slides.push(d);
      const dot = document.createElement('button');
      dot.type = 'button'; dot.className = 'ap-dot'; dot.setAttribute('aria-label', a.nome);
      dot.innerHTML = '<span>' + a.nome + '</span><i></i>';
      dot.addEventListener('click', () => { tour.classList.remove('at-end'); ir(i); });
      dotsBox.appendChild(dot);
    });
  }
  const carrega = (i) => { const im = slides[i] && slides[i].firstChild; if (im && !im.getAttribute('src')) im.src = im.dataset.src; };

  // 1) torre → rasante → planta
  function entrar(a) {
    if (aberto) return;
    if (fase === 'obra') paraTorre();
    aberto = true; ocupado = true; lastFocus = document.activeElement;
    fichaAndar(a);
    montaPlanta(); montaSlides();
    trava(true);
    slides.forEach((s) => { s.style.transition = 'none'; s.className = 'ap-slide'; });
    plan.classList.remove('is-in', 'dive');
    planModel.style.transformOrigin = '';
    tour.classList.remove('at-end', 'first');
    tour.classList.add('corte');   // já prepara a planta parada e nítida para o corte (ver style.css)
    tour.dataset.fase = 'ida';
    tour.setAttribute('aria-hidden', 'false');
    // o andar clicado continua aceso enquanto a câmera se aproxima dele; a planta abre por cima no fim
    if (hoverA !== a) { hoverA = 0; acende(a); }
    tip.classList.remove('show');
    zoomAndar(a, () => {
      tour.classList.add('is-open');
      AMB.forEach((x, k) => carrega(k));
      chegou();
    });
  }

  // a câmera se aproxima do andar escolhido: a cena da torre cresce a partir do ponto daquele andar.
  // é a mesma imagem, sem vídeo, então funciona para qualquer andar, de baixo ou de cima.
  const ZOOM = 3.2, ZOOM_MS = 1100;
  function zoomAndar(a, done) {
    if (reduce) { done(); return; }
    const [x, y] = mapa((F.x0 + F.x1) / 2, meio(a));
    hero.classList.add('is-zooming');
    stage.style.transition = 'none';
    stage.style.transformOrigin = x.toFixed(1) + 'px ' + y.toFixed(1) + 'px';
    void stage.offsetWidth;
    stage.style.transition = 'transform ' + ZOOM_MS + 'ms cubic-bezier(.6,0,.2,1)';
    stage.style.transform = 'scale(' + ZOOM + ')';
    setTimeout(done, ZOOM_MS * 0.7);
  }
  // ao fechar a planta, a câmera volta para a torre inteira
  function desfazZoom() {
    if (!stage.style.transform) return;
    stage.style.transition = reduce ? 'none' : 'transform 900ms cubic-bezier(.22,1,.36,1)';
    stage.style.transform = '';
    setTimeout(() => { hero.classList.remove('is-zooming'); stage.style.transition = ''; stage.style.transformOrigin = ''; }, reduce ? 0 : 950);
  }
  // o rasante termina na sala; dali a câmera sobe e a planta 3D se assenta
  function chegou() {
    if (tour.dataset.fase !== 'ida') return;
    clearTimeout(vigia);
    tour.dataset.fase = 'planta';
    requestAnimationFrame(() => requestAnimationFrame(() => plan.classList.add('is-in')));
    ocupado = false;   // a planta já aceita clique enquanto ainda se assenta
    acendePlanta();
    setTimeout(() => { vIda.classList.remove('on'); vIda.pause(); document.getElementById('planClose').focus({ preventScroll: true }); }, reduce ? 50 : 700);
  }
  vIda.addEventListener('ended', chegou);

  // quando a planta chega, cada ambiente é contornado de dourado e acende, um atrás do outro (~1 s no total)
  function acendePlanta() {
    if (reduce) return;
    AMB.forEach((a, i) => setTimeout(() => {
      if (tour.dataset.fase !== 'planta') return;
      const ns = planSvg.querySelectorAll('[data-i="' + i + '"]');
      ns.forEach((n) => n.classList.add('flash'));
      setTimeout(() => ns.forEach((n) => n.classList.remove('flash')), 620);
    }, 260 + i * 105));
  }

  // 2) planta → ambiente: a câmera mergulha no cômodo clicado e a foto se assenta
  function origemDe(i) {
    const p = GIRO.amb[AMB[i].id].p[0];
    planModel.style.transformOrigin = (p[0] / GIRO.w * 100).toFixed(2) + '% ' + (p[1] / GIRO.h * 100).toFixed(2) + '%';
  }
  function abreAmbiente(i) {
    if (!aberto || ocupado || tour.dataset.fase !== 'planta') return;
    ocupado = true;
    tour.dataset.fase = 'mergulho';
    origemDe(i);
    carrega(i);
    const s = slides[i];
    slides.forEach((x) => { x.style.transition = 'none'; x.className = 'ap-slide'; });
    s.className = 'ap-slide on top enter-dive';
    void s.offsetWidth;
    s.style.transition = 'opacity ' + MERGULHO + 'ms ' + EASE + ', transform ' + (MERGULHO + 300) + 'ms ' + EASE;
    s.classList.remove('enter-dive');
    plan.classList.add('dive');
    cur = i;
    legenda(i, false);
    setTimeout(() => {
      s.classList.remove('top');
      tour.dataset.fase = 'dentro';
      tour.classList.toggle('first', true);
      ocupado = false;
      btnSair.focus({ preventScroll: true });
    }, reduce ? 30 : MERGULHO);
  }
  // 3) ambiente → planta (X): o mesmo mergulho ao contrário, saindo do cômodo em que a pessoa está
  function voltaPlanta() {
    if (!aberto || tour.dataset.fase !== 'dentro') return;
    if (direto) { fechaDireto(); return; }
    ocupado = true;
    tour.dataset.fase = 'mergulho';
    tour.classList.remove('at-end', 'first');
    origemDe(cur);
    const s = slides[cur];
    s.style.transition = 'opacity ' + MERGULHO + 'ms ' + EASE + ', transform ' + MERGULHO + 'ms ' + EASE;
    s.classList.add('enter-dive');
    plan.classList.remove('dive');
    setTimeout(() => {
      slides.forEach((x) => { x.style.transition = 'none'; x.className = 'ap-slide'; });
      tour.dataset.fase = 'planta';
      ocupado = false;
      const b = ppRooms.querySelector('[data-i="' + cur + '"]');
      if (b) b.focus({ preventScroll: true });
    }, reduce ? 30 : MERGULHO);
  }
  // 4) planta → torre (X): a planta desfaz a entrada e a câmera sai do apartamento (rasante invertido)
  function sair() {
    if (!aberto || tour.dataset.fase !== 'planta' || ocupado) return;
    ocupado = true;
    tour.dataset.fase = 'saindo';
    tour.classList.remove('corte');
    plan.classList.remove('is-in');
    setTimeout(fecha, reduce ? 0 : 300);
  }
  // galeria da seção 3: abre o cômodo em tela cheia na hora (sem rasante nem planta) e o X fecha
  function abreDireto(i, origem) {
    if (aberto) return;
    aberto = true; ocupado = true; direto = true; lastFocus = origem || document.activeElement;
    fichaAndar(21); montaSlides(); carrega(i);
    sairTxt.textContent = 'Fechar'; endTxt.textContent = 'Fechar';
    trava(true);
    slides.forEach((x) => { x.style.transition = 'none'; x.className = 'ap-slide'; });
    plan.classList.remove('is-in', 'dive');
    tour.classList.remove('at-end', 'first');
    tour.dataset.fase = 'mergulho';
    tour.setAttribute('aria-hidden', 'false');
    cur = i;
    const sl = slides[i];
    sl.className = 'ap-slide on top enter-dive';
    tour.classList.add('is-open');
    void sl.offsetWidth;
    sl.style.transition = 'opacity ' + MERGULHO + 'ms ' + EASE + ', transform ' + (MERGULHO + 300) + 'ms ' + EASE;
    sl.classList.remove('enter-dive');
    legenda(i, false);
    AMB.forEach((x, k) => carrega(k));
    setTimeout(() => { sl.classList.remove('top'); tour.dataset.fase = 'dentro'; ocupado = false; btnSair.focus({ preventScroll: true }); }, reduce ? 30 : MERGULHO);
  }
  function fechaDireto() {
    ocupado = true;
    tour.dataset.fase = 'saindo';
    tour.classList.remove('at-end', 'first');
    const sl = slides[cur];
    sl.style.transition = 'opacity 420ms ' + EASE + ', transform 520ms ' + EASE;
    sl.classList.add('enter-dive');
    setTimeout(fecha, 200);
  }
  /* ---------------- 3d. SEÇÃO 3: a obra, a planta e "como é morar aqui" — a pessoa explora no próprio ritmo ---------------- */
  const pinta2 = (svgEl, i, cls) => {
    AMB[i].areas.forEach((ar) => svgEl.appendChild(el('path', { d: 'M' + ar.map((p) => p.join(' ')).join('L') + 'Z', class: cls })));
  };
  // a planta grande: passar o mouse acende o cômodo e mostra o nome; clicar leva até a foto dele
  const pl2Svg = document.getElementById('pl2Svg');
  if (pl2Svg) {
    const pl2 = document.getElementById('pl2Planta'), pins = document.getElementById('pl2Pins'), tip2 = document.getElementById('pl2Tip');
    const sd = el('defs', {}); pl2Svg.appendChild(sd);
    const fA = el('filter', { id: 'pl2Acesa', 'color-interpolation-filters': 'sRGB' }); fA.appendChild(el('feComponentTransfer', {}));
    fA.firstChild.append(el('feFuncR', { type: 'linear', slope: 1.2, intercept: 0.02 }), el('feFuncG', { type: 'linear', slope: 1.15, intercept: 0.015 }), el('feFuncB', { type: 'linear', slope: 1.04 }));
    sd.appendChild(fA);
    const gL = el('g', {}), gH = el('g', {});
    const src = pl2.querySelector('.pl2-img').getAttribute('src');
    AMB.forEach((a, i) => {
      const d = a.areas.map((ar) => 'M' + ar.map((p) => p.join(' ')).join('L') + 'Z').join('');
      const cp = el('clipPath', { id: 'p2c-' + a.id }); cp.appendChild(el('path', { d })); sd.appendChild(cp);
      const im = el('image', { width: PW, height: PH, 'clip-path': 'url(#p2c-' + a.id + ')', filter: 'url(#pl2Acesa)', preserveAspectRatio: 'none', 'data-i': i, class: 'p2-luz' });
      im.setAttribute('href', src); gL.appendChild(im);
      gH.appendChild(el('path', { d, 'data-i': i, class: 'p2-area' }));
      const p = a.pins[0], b = document.createElement('span');
      b.className = 'p2-pin'; b.dataset.i = i; b.style.left = (p[0] / PW * 100) + '%'; b.style.top = (p[1] / PH * 100) + '%';
      b.textContent = String(i + 1).padStart(2, '0');
      pins.appendChild(b);
    });
    pl2Svg.append(gL, gH);
    const marca = (i) => {
      pl2.classList.toggle('has-hover', i !== null);
      pl2Svg.querySelectorAll('[data-i]').forEach((n) => n.classList.toggle('is-on', i !== null && +n.dataset.i === i));
      pins.querySelectorAll('.p2-pin').forEach((n) => n.classList.toggle('is-on', i !== null && +n.dataset.i === i));
      if (i === null) { tip2.classList.remove('show'); return; }
      tip2.querySelector('b').textContent = AMB[i].nome; tip2.querySelector('span').textContent = AMB[i].area;
      const p = AMB[i].pins[0]; tip2.style.left = (p[0] / PW * 100) + '%'; tip2.style.top = (p[1] / PH * 100) + '%';
      tip2.classList.add('show');
    };
    const vai = (i) => {
      const alvo = document.getElementById('vida-' + i);
      if (!alvo) return;
      if (lenis) lenis.scrollTo(alvo, { offset: -60, duration: 1.4 }); else alvo.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      alvo.classList.remove('chamado'); void alvo.offsetWidth; alvo.classList.add('chamado');
    };
    gH.addEventListener('pointerover', (e) => { const t = e.target.closest('[data-i]'); if (t) marca(+t.dataset.i); });
    gH.addEventListener('pointerout', (e) => { if (!(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('.p2-area'))) marca(null); });
    gH.addEventListener('click', (e) => { const t = e.target.closest('[data-i]'); if (t) { marca(+t.dataset.i); vai(+t.dataset.i); } });
  }
  // miniplanta ao lado de cada foto: mostra onde a pessoa está no apartamento
  document.querySelectorAll('.vd-mini svg').forEach((sv) => pinta2(sv, +sv.parentNode.dataset.i, 'mini-area'));
  document.querySelectorAll('.vd-full').forEach((b) => b.addEventListener('click', () => abreDireto(+b.dataset.i, b)));
  // as fotos entram quando chegam na tela (sem apresentação automática)
  const vds = [...document.querySelectorAll('.vd')];
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((en) => en.forEach((x) => { if (x.isIntersecting) { x.target.classList.add('is-in'); io.unobserve(x.target); } }), { threshold: 0.25 });
    vds.forEach((v) => io.observe(v));
  } else vds.forEach((v) => v.classList.add('is-in'));
  // hoje / pronto (só onde tem foto da obra): a pessoa escolhe; a divisória também pode ser arrastada
  document.querySelectorAll('.vd-foto').forEach((fig) => {
    const ab = fig.querySelector('.vd-ab');
    if (!ab) return;
    fig.classList.add('tem-obra');
    let corte = 0, raf = 0, arr = false;
    const poe = (v) => { corte = Math.max(0, Math.min(100, v)); fig.style.setProperty('--cut', corte + '%'); ab.querySelectorAll('button').forEach((b) => b.classList.toggle('is-on', (b.dataset.v === 'obra') === (corte > 50))); };
    const corre = (para) => { cancelAnimationFrame(raf); const de = corte, t0 = performance.now(); (function q(n) { const t = Math.min(1, (n - t0) / 900), e = 1 - Math.pow(1 - t, 3); poe(de + (para - de) * e); if (t < 1) raf = requestAnimationFrame(q); })(t0); };
    ab.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) corre(b.dataset.v === 'obra' ? 100 : 0); });
    fig.addEventListener('pointerdown', (e) => { if (corte > 0 && corte < 100 && Math.abs((e.clientX - fig.getBoundingClientRect().left) / fig.clientWidth * 100 - corte) < 6) { arr = true; e.preventDefault(); } });
    fig.addEventListener('pointermove', (e) => { if (arr) { const r = fig.getBoundingClientRect(); poe((e.clientX - r.left) / r.width * 100); } });
    window.addEventListener('pointerup', () => { arr = false; });
    poe(0);
  });

  // a obra: a pessoa escolhe a etapa; a foto troca e a chave anda pela linha até ela
  const tl2 = document.getElementById('tl2');
  if (tl2) {
    const sts = [...tl2.querySelectorAll('.tl2-st'), ...[]], fr = [...document.querySelectorAll('#ob2Foto > img')];
    const chave = document.getElementById('tl2Chave'), linha = document.getElementById('tl2Linha'), tag = document.getElementById('ob2Tag'), desc = document.getElementById('tl2Desc');
    let at = 3;
    const posChave = () => {
      const b = sts[at], rl = tl2.getBoundingClientRect(), r = b.getBoundingClientRect();
      const x = r.left + 8 - rl.left;
      chave.style.transform = 'translateX(' + x + 'px)'; linha.style.width = Math.max(0, x) + 'px';
      tl2.classList.toggle('chegou', at === sts.length - 1);
    };
    const vaiPara = (i) => {
      if (i === at) return;
      const ant = fr[at]; at = i;
      fr.forEach((f, k) => { f.classList.toggle('is-on', k === i); f.classList.toggle('is-out', f === ant); });
      setTimeout(() => ant.classList.remove('is-out'), 1000);
      sts.forEach((b, k) => b.classList.toggle('is-on', k === i));
      tag.textContent = sts[i].dataset.tag; tag.classList.toggle('proj', sts[i].dataset.tag === 'Projeção');
      desc.textContent = sts[i].dataset.d;
      posChave();
    };
    sts.forEach((b, k) => b.addEventListener('click', () => vaiPara(k)));
    posChave();
    window.addEventListener('resize', posChave);
    // a chave sai do começo e corre até "agora" só quando a seção aparece (uma vez)
    if ('IntersectionObserver' in window && !reduce) {
      linha.style.transition = 'none'; chave.style.transition = 'none';
      chave.style.transform = 'translateX(0)'; linha.style.width = '0px';
      new IntersectionObserver((en, o) => en.forEach((x) => { if (x.isIntersecting) { o.disconnect(); void chave.offsetWidth; linha.style.transition = ''; chave.style.transition = ''; requestAnimationFrame(posChave); } }), { threshold: 0.5 }).observe(tl2);
    }
  }

  function fecha() {
    if (!aberto || tour.dataset.fase === 'fechando') return;
    clearTimeout(vigia);
    tour.dataset.fase = 'fechando';
    tour.classList.remove('corte', 'is-open');
    tour.setAttribute('aria-hidden', 'true');
    desfazZoom();
    setTimeout(() => {
      tour.dataset.fase = 'fechado';
      vVolta.classList.remove('on'); vVolta.pause();
      slides.forEach((s) => { s.style.transition = 'none'; s.className = 'ap-slide'; });
      plan.classList.remove('is-in', 'dive');
      trava(false);
      aberto = false; ocupado = false; hoverA = -1; acende(0);
      if (direto) { direto = false; sairTxt.textContent = 'Voltar à planta'; endTxt.textContent = 'Voltar à planta'; }
      if (lastFocus && lastFocus.focus && document.body.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
    }, 450);
  }
  vVolta.addEventListener('ended', fecha);
  document.getElementById('planClose').addEventListener('click', sair);

  // troca de ambiente dentro do passeio. para frente: a foto atual avança na direção de quem olha e se dissolve.
  // para trás: exatamente o mesmo movimento ao contrário.
  function mostra(i, dir, rapido) {
    const novo = slides[i], velho = slides[cur];
    carrega(i);
    const d = rapido ? RAPIDO : DUR;
    const tr = 'opacity ' + d + 'ms ' + EASE + ', transform ' + d + 'ms ' + EASE;
    if (!dir || velho === novo) {
      novo.style.transition = 'none'; novo.className = 'ap-slide on';
    } else if (dir === 'fwd') {
      novo.style.transition = 'none'; novo.className = 'ap-slide on under';
      velho.style.transition = tr; velho.className = 'ap-slide on top';
      void velho.offsetWidth;
      velho.classList.add('leave-fwd');
      setTimeout(() => { velho.style.transition = 'none'; velho.className = 'ap-slide'; novo.classList.remove('under'); }, d + 40);
    } else {
      velho.style.transition = 'none'; velho.className = 'ap-slide on under';
      novo.style.transition = 'none'; novo.className = 'ap-slide on top enter-back';
      void novo.offsetWidth;
      novo.style.transition = tr;
      novo.classList.remove('enter-back');
      setTimeout(() => { velho.className = 'ap-slide'; novo.classList.remove('top'); }, d + 40);
    }
    cur = i;
    legenda(i, rapido);
  }
  function legenda(i, rapido) {
    const a = AMB[i];
    apCount.innerHTML = String(i + 1).padStart(2, '0') + ' <i>/ ' + String(AMB.length).padStart(2, '0') + '</i>';
    apName.textContent = a.nome; delete apName.dataset.lsReady;
    apDesc.textContent = a.desc;
    if (rapido) apName.classList.add('ls-armed'); else lsPlay(apName, 0.45);
    dotsBox.querySelectorAll('.ap-dot').forEach((dt, k) => dt.classList.toggle('is-on', k === i));
    btnPrev.disabled = i === 0;
    btnNext.disabled = false;
  }
  function ir(i) {
    if (!aberto || ocupado || tour.dataset.fase !== 'dentro' || i < 0 || i >= AMB.length || i === cur) return;
    ocupado = true;
    tour.classList.remove('first');
    mostra(i, i > cur ? 'fwd' : 'back');
    setTimeout(() => { ocupado = false; }, DUR * 0.85);
  }
  function proximo() {
    if (tour.classList.contains('at-end')) return;
    if (cur === AMB.length - 1) { if (!ocupado) tour.classList.add('at-end'); return; }
    ir(cur + 1);
  }
  function anterior() {
    if (tour.classList.contains('at-end')) { tour.classList.remove('at-end'); return; }
    ir(cur - 1);
  }

  btnSair.addEventListener('click', voltaPlanta);
  document.getElementById('apEndSair').addEventListener('click', voltaPlanta);
  btnNext.addEventListener('click', proximo);
  btnPrev.addEventListener('click', anterior);
  document.querySelectorAll('[data-tour]').forEach((b) => b.addEventListener('click', () => entrar(+b.dataset.tour)));

  // roda do mouse: um ambiente por gesto (a inércia do trackpad não pula ambientes). na planta, o painel rola normalmente.
  let roda = 0, rodaPresa = false, rodaTimer = null;
  tour.addEventListener('wheel', (e) => {
    if (tour.dataset.fase === 'planta') return;
    e.preventDefault();
    if (tour.dataset.fase !== 'dentro') return;
    clearTimeout(rodaTimer);
    rodaTimer = setTimeout(() => { rodaPresa = false; roda = 0; }, 240);
    if (rodaPresa || ocupado) return;
    roda += e.deltaY;
    if (roda > 50) { rodaPresa = true; proximo(); } else if (roda < -50) { rodaPresa = true; anterior(); }
  }, { passive: false });
  // dedo: deslizar para cima avança, para baixo volta
  let ty = null, tx = null;
  tour.addEventListener('touchstart', (e) => { ty = e.touches[0].clientY; tx = e.touches[0].clientX; }, { passive: true });
  tour.addEventListener('touchmove', (e) => { if (tour.dataset.fase !== 'planta') e.preventDefault(); }, { passive: false });
  tour.addEventListener('touchend', (e) => {
    if (ty === null || tour.dataset.fase !== 'dentro') return;
    const dy = ty - e.changedTouches[0].clientY, dx = tx - e.changedTouches[0].clientX;
    ty = null;
    if (Math.abs(dy) > 40 && Math.abs(dy) >= Math.abs(dx)) { if (dy > 0) proximo(); else anterior(); }
    else if (Math.abs(dx) > 50) { if (dx > 0) proximo(); else anterior(); }
  });

  // planta ampliada (seção do apartamento)
  const pBox = document.getElementById('plantaBox');
  let plantaAberta = false;
  function abrePlanta() { plantaAberta = true; pBox.classList.add('is-open'); pBox.setAttribute('aria-hidden', 'false'); trava(true); document.getElementById('plantaClose').focus({ preventScroll: true }); }
  function fechaPlanta() { plantaAberta = false; pBox.classList.remove('is-open'); pBox.setAttribute('aria-hidden', 'true'); trava(false); }
  ['verPlanta', 'verPlanta2'].forEach((id) => { const b = document.getElementById(id); if (b) b.addEventListener('click', abrePlanta); });
  document.getElementById('plantaClose').addEventListener('click', fechaPlanta);
  pBox.addEventListener('click', (e) => { if (e.target === pBox) fechaPlanta(); });

  document.addEventListener('keydown', (e) => {
    if (plantaAberta) { if (e.key === 'Escape') fechaPlanta(); return; }
    if (!aberto) return;
    const f = tour.dataset.fase;
    if (f === 'planta') { if (e.key === 'Escape') { e.preventDefault(); sair(); } return; }
    if (f !== 'dentro') return;
    if (['ArrowDown', 'ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); proximo(); }
    else if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); anterior(); }
    else if (e.key === 'Escape') { e.preventDefault(); voltaPlanta(); }
  });

  /* ---------------- 3c. TEXTO: letras que se assentam (letterspace-materialize) e brilho dourado (sheen) ---------------- */
  function lsPrepare(el) {
    if (el.dataset.lsReady === '1') return;
    el.dataset.lsReady = '1';
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    const parte = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((p) => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'ls-w'; w.setAttribute('aria-hidden', 'true');
            for (const ch of p) { const c = document.createElement('span'); c.className = 'ls-c'; c.textContent = ch; w.appendChild(c); }
            frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') {
          if (n.classList.contains('sheen-gold')) {   // a palavra dourada anda inteira, para o brilho continuar funcionando
            const u = document.createElement('span'); u.className = 'ls-c'; u.setAttribute('aria-hidden', 'true');
            n.replaceWith(u); u.appendChild(n);
          } else parte(n);
        }
      });
    };
    parte(el);
  }
  function lsPlay(el, spread) {
    if (!el) return;
    lsPrepare(el);
    if (reduce) { el.classList.add('ls-armed'); return; }
    const cs = [...el.querySelectorAll('.ls-c')];
    el.classList.remove('ls-in');
    cs.forEach((c) => c.style.removeProperty('--dx'));
    const rs = cs.map((c) => c.getBoundingClientRect());
    const linhas = [];
    rs.forEach((r, i) => {
      let L = linhas.find((l) => Math.abs(l.top - r.top) < r.height * 0.5);
      if (!L) { L = { top: r.top, idx: [] }; linhas.push(L); }
      L.idx.push(i);
    });
    linhas.sort((a, b) => a.top - b.top).forEach((L, li) => {
      const esq = Math.min(...L.idx.map((i) => rs[i].left)), dir = Math.max(...L.idx.map((i) => rs[i].right)), mid = (esq + dir) / 2;
      L.idx.forEach((i) => {
        cs[i].style.setProperty('--dx', (((rs[i].left + rs[i].right) / 2 - mid) * spread).toFixed(1) + 'px');
        cs[i].style.setProperty('--ld', (li * 0.14).toFixed(2) + 's');
      });
    });
    void el.offsetWidth;
    el.classList.add('ls-armed', 'ls-in');
  }
  const lsIO = new IntersectionObserver((en) => en.forEach((x) => {
    if (!x.isIntersecting) return;
    lsPlay(x.target, x.target.classList.contains('ls-soft') ? (isMobile ? 0.18 : 0.3) : 0.45);
    lsIO.unobserve(x.target);
  }), { threshold: 0.35 });
  document.querySelectorAll('.ls-materialize').forEach((el) => { if (el.id !== 'apName') lsIO.observe(el); });
  const shIO = new IntersectionObserver((en) => en.forEach((x) => {
    if (!x.isIntersecting) return;
    x.target.classList.add('sheen-on');
    shIO.unobserve(x.target);
  }), { threshold: 0.6 });
  document.querySelectorAll('.sheen-gold').forEach((el) => { if (!hero.contains(el)) shIO.observe(el); });

  /* ---------------- 4. REVELAÇÕES (como no original) ---------------- */
  if (hasGsap && !reduce) {
    gsap.utils.toArray('.section-title-reveal').forEach((el) => {
      gsap.fromTo(el, { opacity: 0, y: 35 }, { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' } });
    });
    gsap.utils.toArray('.section-desc-reveal').forEach((el) => {
      gsap.fromTo(el, { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 1, delay: 0.12, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
    });
    gsap.from('#appSection .app-card', { y: 70, opacity: 0, scale: 0.98, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: '#appSection', start: 'top 80%' } });
    gsap.from('#appTextContent > *', { y: 30, opacity: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '#appSection', start: 'top 65%' } });
    gsap.from('#ob2 .ob2-cap > *', { y: 30, opacity: 0, duration: 1.1, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '#ob2', start: 'top 70%' } });
    gsap.from('#pl2 .pl2-txt > *', { y: 26, opacity: 0, duration: 1, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: '#pl2', start: 'top 72%' } });
    gsap.fromTo('#pl2Planta', { y: 60, rotateX: 28, opacity: 0, transformPerspective: 1600 }, { y: 0, rotateX: 0, opacity: 1, duration: 1.4, ease: 'power3.out', scrollTrigger: { trigger: '#pl2', start: 'top 70%' } });
  }



  /* ---------------- 5. LINKS INTERNOS ---------------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      if (a.hasAttribute('data-whats')) return;
      const id = a.getAttribute('href');
      if (id === '#') return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.2 }); else el.scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* ---------------- 6. INSTALAR O APP (a página vira um app no celular e no computador) ---------------- */
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
  }
  const btnInst = document.getElementById('btnInstalar');
  const instBox = document.getElementById('instBox');
  const instSteps = document.getElementById('instSteps');
  let pedidoInstalar = null;
  const instalado = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const marcaInstalado = () => { if (btnInst) btnInst.innerHTML = '<i class="fa-solid fa-check text-base"></i> App instalado'; };
  if (instalado()) marcaInstalado();
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); pedidoInstalar = e; });
  window.addEventListener('appinstalled', () => { pedidoInstalar = null; marcaInstalado(); });
  function abreInst(passos) {
    instSteps.innerHTML = passos.map((p) => '<li>' + p + '</li>').join('');
    instBox.classList.add('is-open'); instBox.setAttribute('aria-hidden', 'false');
    document.getElementById('instClose').focus({ preventScroll: true });
  }
  function fechaInst() { instBox.classList.remove('is-open'); instBox.setAttribute('aria-hidden', 'true'); if (btnInst) btnInst.focus({ preventScroll: true }); }
  if (btnInst) btnInst.addEventListener('click', async () => {
    if (instalado()) { abreInst(['O app da Edulos já está instalado neste aparelho. Procure o ícone dourado na tela inicial.']); return; }
    if (pedidoInstalar) {
      pedidoInstalar.prompt();
      const r = await pedidoInstalar.userChoice.catch(() => null);
      pedidoInstalar = null;
      if (r && r.outcome === 'accepted') marcaInstalado();
      return;
    }
    const ua = navigator.userAgent;
    const ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (ios) abreInst(['Toque em <b>Compartilhar</b> <i class="fa-solid fa-arrow-up-from-bracket"></i> na barra do Safari.', 'Role e escolha <b>Adicionar à Tela de Início</b>.', 'Toque em <b>Adicionar</b>. O ícone da Edulos aparece junto dos seus apps.']);
    else if (/Android/.test(ua)) abreInst(['Abra o menu <b>⋮</b> do navegador.', 'Toque em <b>Instalar app</b> ou <b>Adicionar à tela inicial</b>.', 'Confirme. O app abre direto, sem barra do navegador.']);
    else abreInst(['No Chrome ou no Edge, clique no ícone de <b>instalar</b> no fim da barra de endereço.', 'Ou abra o menu <b>⋮</b> e escolha <b>Instalar Edulos</b>.', 'No celular, abra este site e toque em <b>Instalar o app</b> de novo.']);
  });
  document.getElementById('instClose').addEventListener('click', fechaInst);
  instBox.addEventListener('click', (e) => { if (e.target === instBox) fechaInst(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && instBox.classList.contains('is-open')) fechaInst(); });

  /* ---------------- 7. APP: TELAS ENCAIXADAS NA FOTO DOS CELULARES ---------------- */
  // cantos das telas verdes na foto original (detectados na imagem): sup-esq, sup-dir, inf-dir, inf-esq
  const QUADS = {
    d: [[[1504.2, 260.6], [1849.5, 208.7], [1771.0, 1255.9], [1429.4, 1215.7]], [[2007.0, 223.4], [2303.0, 268.8], [2306.4, 1209.2], [2012.2, 1250.0]]],
    m: [[[455.6, 738.8], [852.6, 676.7], [760.1, 1912.9], [369.6, 1864.5]], [[1039.1, 694.7], [1403.2, 748.1], [1413.7, 1855.7], [1050.2, 1906.4]]],
  };
  const scene = document.getElementById('appScene');
  if (scene) {
    const screens = [...scene.querySelectorAll('.scr')];
    const notifs = [...scene.querySelectorAll('.app-notif')];
    const views = [...scene.querySelectorAll('.scr-view')];
    const feats = [...document.querySelectorAll('.app-feat')];

    // homografia: leva o retângulo da tela (390×844) para os 4 cantos da foto
    function homography(w, h, q) {
      const src = [[0, 0], [w, 0], [w, h], [0, h]];
      const A = [], B = [];
      for (let i = 0; i < 4; i++) {
        const [x, y] = src[i], [u, v] = q[i];
        A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); B.push(u);
        A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); B.push(v);
      }
      // eliminação de Gauss
      for (let c = 0; c < 8; c++) {
        let p = c; for (let r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
        [A[c], A[p]] = [A[p], A[c]]; [B[c], B[p]] = [B[p], B[c]];
        for (let r = 0; r < 8; r++) if (r !== c) { const f = A[r][c] / A[c][c]; for (let k = c; k < 8; k++) A[r][k] -= f * A[c][k]; B[r] -= f * B[c]; }
      }
      const H = B.map((b, i) => b / A[i][i]);
      return 'matrix3d(' + [H[0], H[3], 0, H[6], H[1], H[4], 0, H[7], 0, 0, 1, 0, H[2], H[5], 0, 1].join(',') + ')';
    }
    let placed = []; // cantos na tela, por celular
    function layout() {
      const img = [...scene.querySelectorAll('.scene-img')].find((i) => i.getBoundingClientRect().width > 0);
      if (!img) return;
      const key = img.classList.contains('scene-m') ? 'm' : 'd';
      const W = +img.dataset.w, H = +img.dataset.h, posX = +img.dataset.pos, posY = img.dataset.posy ? +img.dataset.posy : 0.5;
      const cw = scene.clientWidth, ch = scene.clientHeight;
      const s = Math.max(cw / W, ch / H);
      const ox = (cw - W * s) * posX, oy = (ch - H * s) * posY;
      placed = QUADS[key].map((q) => q.map(([x, y]) => [ox + x * s, oy + y * s]));
      screens.forEach((el) => { el.style.transform = homography(390, 844, placed[+el.dataset.phone]); });
      arco(cw, ch, key);
      // mensagens: coladas na borda esquerda do celular da frente
      notifs.forEach((n) => {
        const q = placed[+n.dataset.anchor], t = +n.dataset.at;
        const lx = q[0][0] + (q[3][0] - q[0][0]) * t, ly = q[0][1] + (q[3][1] - q[0][1]) * t;
        const nw = n.offsetWidth, nh = n.offsetHeight;
        let x = lx - nw * 0.42, y = ly - nh / 2;
        x = Math.max(10, Math.min(x, cw - nw - 10));
        n.style.left = x + 'px'; n.style.top = y + 'px';
      });
    }
    // linha dourada que nasce atrás do celular (só no computador), como na referência
    function arco(cw, ch, key) {
      const svgA = document.getElementById('appArco');
      if (!svgA) return;
      if (key !== 'd') { svgA.style.display = 'none'; return; }
      svgA.style.display = '';
      svgA.setAttribute('viewBox', '0 0 ' + cw + ' ' + ch);
      const bg = document.getElementById('mArcoBg'); bg.setAttribute('width', cw); bg.setAttribute('height', ch);
      // a máscara tira o corpo dos dois celulares (a tela um pouco ampliada a partir do centro)
      placed.forEach((q, i) => {
        const cx = q.reduce((a, p) => a + p[0], 0) / 4, cy = q.reduce((a, p) => a + p[1], 0) / 4;
        const pts = q.map(([x, y]) => [cx + (x - cx) * 1.09, cy + (y - cy) * 1.045].map((v) => v.toFixed(1)).join(','));
        document.getElementById('mArco' + i).setAttribute('points', pts.join(' '));
      });
      const f = placed[0], x0 = f[3][0] - cw * 0.17, y0 = ch * 1.02;
      document.getElementById('arcoPath').setAttribute('d', 'M' + x0 + ' ' + y0 + ' C ' + (f[0][0] - cw * 0.02) + ' ' + (ch * 0.42) + ', ' + (cw * 0.8) + ' ' + (ch * 0.08) + ', ' + (cw * 1.02) + ' ' + (ch * 0.5));
    }
    window.addEventListener('resize', layout);
    scene.querySelectorAll('.scene-img').forEach((i) => i.addEventListener('load', layout));
    layout();

    const showView = (i) => {
      views.forEach((v, k) => v.classList.toggle('is-on', k === i));
      feats.forEach((f) => f.classList.toggle('is-on', Number(f.dataset.screen) === i));
    };
    feats.forEach((f) => {
      f.addEventListener('mouseenter', () => showView(Number(f.dataset.screen)));
      f.addEventListener('click', () => showView(Number(f.dataset.screen)));
    });
    document.getElementById('appSection').addEventListener('mouseleave', () => showView(0));

    // ao chegar na seção: a cena se aproxima e para, as telas acendem e as mensagens chegam perto do celular
    const powerOn = () => {
      layout();
      setTimeout(() => scene.classList.add('arco-on'), 900);
      screens.forEach((el, i) => setTimeout(() => el.classList.add('on'), 250 + i * 450));
      notifs.forEach((n, i) => {
        if (hasGsap && !reduce) gsap.fromTo(n, { opacity: 0, x: -30, scale: 0.92 }, { opacity: 1, x: 0, scale: 1, duration: 0.8, ease: 'back.out(1.6)', delay: 1.1 + i * 0.5 });
        else n.style.opacity = 1;
      });
    };
    if (hasGsap && !reduce) {
      gsap.fromTo('.scene-img', { scale: 1.18, xPercent: 6 }, { scale: 1, xPercent: 0, ease: 'power2.out', scrollTrigger: { trigger: '#appCard', start: 'top 95%', end: 'top 35%', scrub: 1 } });
      ScrollTrigger.create({ trigger: '#appCard', start: 'top 35%', once: true, onEnter: powerOn });
    } else powerOn();
    // a cena acompanha a escala da foto: recalcula as telas a cada quadro enquanto ela anima
    let sceneVisible = false;
    new IntersectionObserver((en) => en.forEach((x) => { sceneVisible = x.isIntersecting; })).observe(scene);
    if (hasGsap && !reduce) gsap.ticker.add(() => { if (sceneVisible) layoutFromTransform(); });
    function layoutFromTransform() {
      const img = [...scene.querySelectorAll('.scene-img')].find((i) => i.getBoundingClientRect().width > 0);
      if (!img) return;
      const m = new DOMMatrixReadOnly(getComputedStyle(img).transform);
      const key = img.classList.contains('scene-m') ? 'm' : 'd';
      if (m.isIdentity) { if (scene._lastIdentity) return; scene._lastIdentity = true; layout(); return; }
      scene._lastIdentity = false;
      layout();
      // aplica a mesma transformação da foto às telas e às mensagens
      const cs = getComputedStyle(img); const [ox, oy] = cs.transformOrigin.split(' ').map(parseFloat);
      const map = ([x, y]) => { const p = m.transformPoint(new DOMPoint(x - ox, y - oy)); return [p.x + ox, p.y + oy]; };
      placed = placed.map((q) => q.map(map));
      screens.forEach((el) => { el.style.transform = homography(390, 844, placed[+el.dataset.phone]); });
    }
  }
});
