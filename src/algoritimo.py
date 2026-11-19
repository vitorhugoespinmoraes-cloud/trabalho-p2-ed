"""
Trabalho P2 Tema C: Heaps e Filas de Prioridade (Min-Heap / Max-Heap).

"""

def pai(i: int) -> int:
    return (i - 1) // 2


def esquerdo(i: int) -> int:
    return 2 * i + 1


def direito(i: int) -> int:
    return 2 * i + 2


class HeapBinario:

    def __init__(self, max_heap: bool = False) -> None:
        self._dados: list[int] = []
        self._max_heap: bool = max_heap
        self.comparacoes: int = 0
        self.trocas: int = 0

    @property
    def operacoes(self) -> int:
        return self.comparacoes + self.trocas

    def __len__(self) -> int:
        return len(self._dados)

    def array(self) -> list[int]:
        return list(self._dados)

    def _deve_subir(self, a: int, b: int) -> bool:
        self.comparacoes += 1
        return a > b if self._max_heap else a < b

    def _trocar(self, i: int, j: int) -> None:
        self._dados[i], self._dados[j] = self._dados[j], self._dados[i]
        self.trocas += 1

    def _sift_up(self, i: int) -> None:
        while i > 0:
            p = pai(i)
            if not self._deve_subir(self._dados[i], self._dados[p]):
                break
            self._trocar(i, p)
            i = p

    def _sift_down(self, i: int) -> None:
        n = len(self._dados)
        while True:
            melhor = i
            e, d = esquerdo(i), direito(i)
            if e < n and self._deve_subir(self._dados[e], self._dados[melhor]):
                melhor = e
            if d < n and self._deve_subir(self._dados[d], self._dados[melhor]):
                melhor = d
            if melhor == i:
                break
            self._trocar(i, melhor)
            i = melhor

    def insert(self, valor: int) -> None:
        self._dados.append(valor)
        self._sift_up(len(self._dados) - 1)

    def peek(self) -> int:
        if not self._dados:
            raise IndexError("peek em heap vazio")
        return self._dados[0]

    def extract(self) -> int:
        if not self._dados:
            raise IndexError("extract em heap vazio")
        topo = self._dados[0]
        ultimo = self._dados.pop()
        if self._dados:
            self._dados[0] = ultimo
            self._sift_down(0)
        return topo


def executar_cenario(titulo: str, valores: list[int], max_heap: bool = False) -> None:
    print(f"\n=== {titulo} ===")
    heap = HeapBinario(max_heap=max_heap)
    for v in valores:
        heap.insert(v)

    print(f"Entrada (n={len(valores)}):   {valores}")
    print(f"Array após inserções:  {heap.array()}")
    print(f"Topo (peek):           {heap.peek()}")
    print(f"Operações nas inserções: {heap.operacoes}")

    ordem = []
    while len(heap) > 0:
        ordem.append(heap.extract())

    assert ordem == sorted(valores, reverse=max_heap), "Ordem de extração incorreta"
    print(f"Ordem de extração:     {ordem}")
    print(f"Total de operações:    {heap.operacoes} "
          f"(comparações={heap.comparacoes}, trocas={heap.trocas})")


if __name__ == "__main__":
    executar_cenario("Cenário 1 – Caso comum (Min-Heap)", [5, 3, 8, 1, 4, 7, 2])

    executar_cenario(
        "Cenário 2 – Caso de borda (Max-Heap, valores repetidos)",
        [4, 4, 4, 1],
        max_heap=True,
    )
    try:
        HeapBinario().extract()
    except IndexError as erro:
        print(f"Borda extra – extract em heap vazio gera erro: {erro}")

    executar_cenario(
        "Cenário 3 – Pior caso (Min-Heap, entradas decrescentes)",
        list(range(15, 0, -1)),
    )