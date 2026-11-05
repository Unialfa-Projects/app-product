// Monta as opções de categoria em ordem hierárquica: cada principal seguida das suas subcategorias.
// O texto das subcategorias leva o nome da principal ("Eletrônicos › Gabinetes") para que a
// pesquisa por uma principal também encontre as subcategorias dela.
export function opcoesCategoriaHierarquicas(categorias = []) {
  const principais = categorias.filter((c) => !c.categoria_pai_id);
  const idsPrincipais = new Set(principais.map((c) => c.id));
  const opcoes = [];

  for (const principal of principais) {
    opcoes.push({ valor: principal.id, texto: principal.nome, nivel: 0 });
    for (const sub of categorias.filter((c) => c.categoria_pai_id === principal.id)) {
      opcoes.push({ valor: sub.id, texto: `${principal.nome} › ${sub.nome}`, rotuloCurto: sub.nome, nivel: 1 });
    }
  }

  // Subcategorias cuja principal não veio na lista (ex.: principal inativa) não podem sumir da seleção.
  for (const orfa of categorias.filter((c) => c.categoria_pai_id && !idsPrincipais.has(c.categoria_pai_id))) {
    opcoes.push({
      valor: orfa.id,
      texto: orfa.categoria_pai_nome ? `${orfa.categoria_pai_nome} › ${orfa.nome}` : orfa.nome,
      nivel: 0,
    });
  }

  return opcoes;
}

// Comparação sem acento e sem diferenciar maiúsculas ("eletronicos" encontra "Eletrônicos").
export function normalizarTexto(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}
