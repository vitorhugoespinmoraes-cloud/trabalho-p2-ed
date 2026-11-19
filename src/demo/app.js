const pai = i => Math.floor((i - 1) / 2);
const esq = i => 2 * i + 1;
const dir = i => 2 * i + 2;

const ARVORE_W = 760;
const ARVORE_H = 360;
const NO = 44;
const CELULA = 64;
const ESPACO = 10;
const INTERVALO_MS = 900;

const el = id => document.getElementById(id);

let passos = [];   // registro de todos os passos do cenário carregado
let atual = 0;     // índice do passo exibido
let timer = null;  // id do setInterval (null = pausado)
let proxId = 1;    // ids únicos, para animar elementos entre posições

const mapaNos = new Map();
const mapaCelulas = new Map();

/* ---------- Gerador de passos: executa o algoritmo e grava cada etapa ---------- */
function gerarPassos(operacoes, tipo) {
  const max = tipo === 'max';
  const sim = max ? '>' : '<';
  const lista = [];   // itens: { id, v }
  const registro = [];
  let comp = 0;
  let trocas = 0;

  const antes = (a, b) => { comp++; return max ? a.v > b.v : a.v < b.v; };
  const trocar = (i, j) => { [lista[i], lista[j]] = [lista[j], lista[i]]; trocas++; };
  const snap = (log, dest = {}) => registro.push({
    itens: lista.map(x => ({ ...x })),
    log,
    comp,
    trocas,
    dest,
  });

  snap('Heap vazio. Use "Próximo passo" ou "Executar".');

  for (const op of operacoes) {
    if (op.tipo === 'insert') {
      lista.push({ id: proxId++, v: op.valor });
      let i = lista.length - 1;
      snap(`Inserir ${op.valor}: entra no fim do array, no índice ${i}. Começa o sift-up.`,
           { fase: 'sift-up', i });

      let parou = false;
      while (i > 0) {
        const p = pai(i);
        const a = lista[i].v;
        const b = lista[p].v;
        if (!antes(lista[i], lista[p])) {
          snap(`Comparar ${a} com o pai ${b}: ${a} ${sim} ${b}? Não. A ordem do heap está correta, o sift-up termina.`,
               { fase: 'sift-up', i, cmp: [i, p] });
          parou = true;
          break;
        }
        const filho = i;
        snap(`Comparar ${a} com o pai ${b}: ${a} ${sim} ${b}? Sim. Trocar ${a} com ${b}.`,
             { fase: 'sift-up', i: filho, cmp: [filho, p] });
        trocar(filho, p);
        snap(`Troca feita: ${a} subiu para o índice ${p}.`,
             { fase: 'sift-up', i: p, troca: [filho, p] });
        i = p;
      }
      if (!parou) {
        snap(`${lista[0].v} chegou à raiz (índice 0). O sift-up termina.`, { fase: 'sift-up', i: 0 });
      }

    } else if (op.tipo === 'extract') {
      if (lista.length === 0) {
        snap('extract em heap vazio: erro (IndexError).');
        continue;
      }
      const topo = lista[0].v;
      snap(`extract: o topo ${topo} (índice 0) será retornado e removido.`,
           { fase: 'sift-down', i: 0 });

      const ultimo = lista.pop();
      if (lista.length === 0) {
        snap(`${topo} era o único elemento: o heap fica vazio.`, { fase: 'extract' });
        continue;
      }
      lista[0] = ultimo;
      snap(`Mover o último elemento ${ultimo.v} para a raiz (índice 0). Começa o sift-down.`,
           { fase: 'sift-down', i: 0 });

      let i = 0;
      while (true) {
        const n = lista.length;
        const e = esq(i);
        const d = dir(i);
        let melhor = i;
        const textos = [];
        const cmp = [];

        if (e < n) {
          cmp.push(e);
          const ok = antes(lista[e], lista[melhor]);
          textos.push(`esq ${lista[e].v} ${sim} ${lista[melhor].v}? ${ok ? 'Sim' : 'Não'}`);
          if (ok) melhor = e;
        }
        if (d < n) {
          cmp.push(d);
          const ok = antes(lista[d], lista[melhor]);
          textos.push(`dir ${lista[d].v} ${sim} ${lista[melhor].v}? ${ok ? 'Sim' : 'Não'}`);
          if (ok) melhor = d;
        }

        if (melhor === i) {
          const msg = textos.length
            ? `Comparações: ${textos.join('; ')}. Nenhum filho é melhor que ${lista[i].v}.`
            : `${lista[i].v} não tem filhos.`;
          snap(`${msg} O sift-down termina.`, { fase: 'sift-down', i, cmp });
          break;
        }

        snap(`Comparações: ${textos.join('; ')}. Trocar ${lista[i].v} com ${lista[melhor].v}.`,
             { fase: 'sift-down', i, cmp });
        const antigo = i;
        trocar(antigo, melhor);
        i = melhor;
        snap(`Troca feita: ${lista[i].v} desceu para o índice ${i}.`,
             { fase: 'sift-down', i, troca: [antigo, i] });
      }
      snap(`extract concluído: ${topo} foi removido e o heap foi reorganizado.`, { fase: 'extract' });

    } else if (op.tipo === 'peek') {
      if (lista.length === 0) {
        snap('peek em heap vazio: erro (IndexError).');
      } else {
        snap(`peek: o topo ${lista[0].v} (índice 0) é lido sem ser removido.`,
             { fase: 'peek', i: 0 });
      }
    }
  }
  return registro;
}

/* ---------- Renderização ---------- */
function posNo(i, niveis) {
  const nivel = Math.floor(Math.log2(i + 1));
  const pos = i + 1 - 2 ** nivel;
  return {
    x: ((pos + 0.5) / 2 ** nivel) * ARVORE_W,
    y: ((nivel + 0.5) / niveis) * ARVORE_H,
  };
}

function classesDe(i, dest) {
  const c = [];
  if (dest.i === i) c.push('atual');
  else if (dest.i !== undefined && dest.i > 0 && i === pai(dest.i)) c.push('pai');
  else if (dest.i !== undefined && (i === esq(dest.i) || i === dir(dest.i))) c.push('filho');
  if (dest.cmp && dest.cmp.includes(i)) c.push('comparado');
  if (dest.troca && dest.troca.includes(i)) c.push('troca');
  return c;
}

/* Sincroniza os elementos do DOM com os itens do passo, mantendo
   a identidade (id) de cada valor para animar o movimento entre índices. */
function sincronizar(container, mapa, itens, aplicar) {
  const vivos = new Set(itens.map(x => x.id));
  for (const [id, node] of mapa) {
    if (!vivos.has(id)) {
      mapa.delete(id);
      node.classList.add('saindo');
      setTimeout(() => node.remove(), 500);
    }
  }
  itens.forEach((item, i) => {
    let node = mapa.get(item.id);
    if (node) {
      aplicar(node, item, i);
      return;
    }
    node = document.createElement('div');
    aplicar(node, item, i);
    node.classList.add('novo');
    container.appendChild(node);
    mapa.set(item.id, node);
    void node.offsetWidth;          // força o estado inicial antes da animação
    node.classList.remove('novo');
  });
}

function renderArvore(passo) {
  const itens = passo.itens;
  const niveis = Math.max(4, Math.floor(Math.log2(Math.max(itens.length, 1))) + 1);

  let linhas = '';
  for (let i = 1; i < itens.length; i++) {
    const a = posNo(pai(i), niveis);
    const b = posNo(i, niveis);
    linhas += `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"></line>`;
  }
  el('arestas').innerHTML = linhas;

  sincronizar(el('arvore'), mapaNos, itens, (node, item, i) => {
    const { x, y } = posNo(i, niveis);
    node.className = ['no', ...classesDe(i, passo.dest)].join(' ');
    node.style.left = `${x - NO / 2}px`;
    node.style.top = `${y - NO / 2}px`;
    node.textContent = item.v;
  });
}

function renderArray(passo) {
  el('array').style.width = `${Math.max(passo.itens.length, 8) * (CELULA + ESPACO)}px`;
  sincronizar(el('array'), mapaCelulas, passo.itens, (node, item, i) => {
    node.className = ['celula', ...classesDe(i, passo.dest)].join(' ');
    node.style.left = `${i * (CELULA + ESPACO)}px`;
    node.dataset.idx = i;
    node.textContent = item.v;
  });
}

function renderPainel(passo, k) {
  const itens = passo.itens;
  const n = itens.length;
  const i = passo.dest.i;
  const temI = i !== undefined;
  const ref = j => (j < n ? `${j} (valor ${itens[j].v})` : '— (fora do heap)');

  el('log-atual').textContent = passo.log;
  el('m-passo').textContent = `${k} / ${passos.length - 1}`;
  el('m-n').textContent = n;
  el('m-comp').textContent = passo.comp;
  el('m-trocas').textContent = passo.trocas;
  el('m-ops').textContent = passo.comp + passo.trocas;

  el('v-i').textContent = temI ? ref(i) : '—';
  el('v-pai').textContent = temI && i > 0 ? ref(pai(i)) : '—';
  el('v-esq').textContent = temI ? ref(esq(i)) : '—';
  el('v-dir').textContent = temI ? ref(dir(i)) : '—';

  const hist = el('historico');
  hist.innerHTML = '';
  passos.slice(0, k + 1).forEach(p => {
    const li = document.createElement('li');
    li.textContent = p.log;
    hist.appendChild(li);
  });
  hist.scrollTop = hist.scrollHeight;
}

function atualizarBotoes() {
  el('btn-executar').disabled = timer !== null;
  el('btn-pausar').disabled = timer === null;
}

function render() {
  const passo = passos[atual];
  renderArvore(passo);
  renderArray(passo);
  renderPainel(passo, atual);
  atualizarBotoes();
}

/* ---------- Controle da execução ---------- */
function executar() {
  if (timer !== null) return;
  if (atual >= passos.length - 1) {
    atual = 0;
    render();
  }
  timer = setInterval(() => {
    if (atual >= passos.length - 1) {
      pausar();
      return;
    }
    atual++;
    render();
  }, INTERVALO_MS);
  atualizarBotoes();
}

function pausar() {
  if (timer !== null) {
    clearInterval(timer);
    timer = null;
  }
  atualizarBotoes();
}

function proximo() {
  if (atual < passos.length - 1) {
    atual++;
    render();
  }
}

function carregar(nome, operacoes) {
  pausar();
  el('titulo-cenario').textContent = nome;
  passos = gerarPassos(operacoes, el('tipo').value);
  atual = 0;
  render();
}

/* ---------- Cenários pré-configurados ---------- */
const ins = valor => ({ tipo: 'insert', valor });
const EXTRAIR = { tipo: 'extract' };
const PEEK = { tipo: 'peek' };

function opsMedio() {
  return [...[7, 3, 9, 1, 5, 8, 2].map(ins), PEEK, EXTRAIR, EXTRAIR];
}

function opsPior(tipo) {
  const base = [9, 8, 7, 6, 5, 4, 3, 2, 1];
  // Min-heap: entradas decrescentes (cada uma sobe até a raiz).
  // Max-heap: o caso espelhado, entradas crescentes.
  const seq = tipo === 'min' ? base : [...base].reverse();
  return [...seq.map(ins), EXTRAIR, EXTRAIR];
}

function opsCustom(texto) {
  const nums = texto.split(',').map(s => s.trim()).filter(s => s !== '').map(Number);
  if (nums.length === 0 || nums.some(Number.isNaN)) return null;
  return [...nums.map(ins), ...nums.map(() => EXTRAIR)];
}

/* ---------- Eventos ---------- */
el('btn-medio').addEventListener('click', () => carregar('Caso Médio', opsMedio()));
el('btn-pior').addEventListener('click', () => carregar('Pior Caso', opsPior(el('tipo').value)));
el('btn-custom').addEventListener('click', () => {
  const ops = opsCustom(el('entrada-custom').value);
  if (!ops) {
    alert('Digite números separados por vírgula. Ex.: 6, 2, 9, 4');
    return;
  }
  carregar('Exemplo Customizado', ops);
});
el('btn-executar').addEventListener('click', executar);
el('btn-pausar').addEventListener('click', pausar);
el('btn-proximo').addEventListener('click', () => { pausar(); proximo(); });
el('btn-reiniciar').addEventListener('click', () => { pausar(); atual = 0; render(); });

carregar('Caso Médio', opsMedio());