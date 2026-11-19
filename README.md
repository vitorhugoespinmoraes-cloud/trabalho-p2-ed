# Trabalho P2 – Simulador Visual de Heap Binário

https://drive.google.com/file/d/1b4UdVxmOjf6PB1TwYdHDhks_fZj_bmD4/view?usp=sharing

- Vitor Hugo Espin Moraes
- 2840482521029
- Tema C – Heaps e Filas de Prioridade (Min-Heap / Max-Heap)
- Estrutura de Dados – ADS FatecRP

---

## 1. Resumo teórico

Um **heap binário** é uma árvore binária **completa** (todos os níveis preenchidos, exceto possivelmente o último, preenchido da esquerda para a direita) que obedece à **propriedade de heap**:

- **Min-Heap:** cada pai é menor ou igual a seus filhos; o topo (raiz) é o menor elemento.
- **Max-Heap:** cada pai é maior ou igual a seus filhos; o topo é o maior elemento.

Por ser completa, a árvore pode ser guardada em um **array sem ponteiros**, usando (base 0):

- `pai(i) = (i - 1) // 2`
- `esq(i) = 2i + 1`
- `dir(i) = 2i + 2`

### Operações

- **`insert(x)`**: adiciona `x` no fim do array (mantém a árvore completa) e executa o **sift-up**: enquanto o elemento for melhor que o pai, troca com ele.
- **`peek()`**: lê o topo (índice 0) sem remover.
- **`extract()`**: guarda o topo, move o último elemento para a raiz, remove a última posição e executa o **sift-down**: enquanto algum filho for melhor que o elemento, troca com o melhor filho.

### Uso no mundo real

- Filas de prioridade de sistemas operacionais (escalonamento de processos).
- Algoritmos de grafos como Dijkstra e Prim (fila de prioridade de distâncias/arestas).
- Heapsort e seleção dos *k* maiores (ou menores) elementos de um conjunto.
- Intercalação de *k* listas ordenadas e simulações de eventos discretos.
- Construção da árvore de Huffman (compressão de dados).

## 2. Análise de complexidade (Big-O)

*n* é o número de elementos no heap.

| Operação  | Melhor caso                                                 | Caso médio                      | Pior caso                              | Espaço auxiliar |
|-----------|-------------------------------------------------------------|---------------------------------|----------------------------------------|-----------------|
| `insert`  | O(1) – novo valor já é melhor que o pai, então não há troca | O(1) – para entradas aleatórias | O(log n) – sobe até a raiz             | O(1)            |
| `extract` | O(1) – último elemento já é melhor que os filhos            | O(log n)                        | O(log n) – desce da raiz até uma folha | O(1)            |
| `peek`    | O(1)                                                        | O(1)                            | O(1)                                   | O(1)            |

**Espaço:** o array ocupa O(n) no total. A implementação é iterativa (sem recursão), por isso o espaço **auxiliar** é O(1).

**Por que o pior caso ocorre:**

- **`insert`:** no pior caso o novo valor é o melhor de todos (menor, em um min-heap). Ele percorre todos os níveis até a raiz, que tem altura h = ⌊log₂ n⌋. Cada nível custa 1 comparação e 1 troca.
- **`extract`:** o último elemento do array costuma ser um valor grande (está numa folha). Ao ser levado para a raiz, ele tende a descer até uma folha, passando por h níveis e fazendo até 2 comparações por nível.

## 3. Estrutura do projeto

```
trabalho-p2-ed/
├── README.md
└── src/
    ├── algoritmo.py     # Implementação em Python puro + 3 cenários de teste
    └── demo/
        ├── index.html   # Interface do simulador
        ├── styles.css   # Estilo e animações
        └── app.js       # Lógica da simulação passo a passo
```

## 4. Como executar

- **Testes em Python** (Python 3.9+, sem dependências):
  ```bash
  python src/algoritmo.py
  ```
- **Simulador:** abra `src/demo/index.html` diretamente no navegador (não precisa de servidor).

### Controles do simulador

- **Executar (Play) / Pausar:** execução automática e pausa.
- **Próximo passo (Step):** avança uma etapa.
- **Reiniciar (Reset):** volta ao estado inicial (heap vazio) do cenário carregado.
- **Caso Médio, Pior Caso, Exemplo Customizado:** carregam cenários. Para o Pior Caso, o tipo (Min/Max) escolhido define a sequência de entradas. Após mudar o tipo, clique novamente no cenário.

## 5. Diário de Engenharia com IA

### 5.1 Ferramenta(s) utilizada(s)

 "Claude Code"

### 5.2 Três principais prompts

1. **Aprendizado:** "nao entendi esse heap, pode me explicar de um jeito mais facil?"
2. **Geração/refino do simulador:** "me explique oq é sift-up e sift-down pfvr"
3. **Refino do código ou da explicação:** "me de um passo a passo doq ta acontecendo no codigo styles.css"

### 5.3 Erros, limitações e ajustes manuais

- Ao dar duplo clique no index.html, ele abriu como texto no Bloco de Notas, e não no navegador. Corrigi escolhendo o Microsoft Windows em "Abrir com". 
...parece bobo mas eu realmente tive esse problema...