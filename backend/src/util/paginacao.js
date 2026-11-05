// RNF09 — paginação padrão 20, máximo 100
export function montarPaginacao({ pagina, limite, total }) {
  const totalPaginas = total === 0 ? 0 : Math.ceil(total / limite);
  return { pagina, limite, total, total_paginas: totalPaginas };
}

export function calcularOffset({ pagina, limite }) {
  return (pagina - 1) * limite;
}
