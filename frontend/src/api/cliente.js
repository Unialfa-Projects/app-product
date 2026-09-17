import { useSessaoStore } from '@/stores/sessao.js';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export class ErroApi extends Error {
  constructor({ erro, codigo, detalhes, status }) {
    super(erro);
    this.codigo = codigo;
    this.detalhes = detalhes ?? [];
    this.status = status;
  }
}

function obterUsuarioId() {
  try {
    const bruto = localStorage.getItem('sige.sessao');
    if (!bruto) return null;
    return JSON.parse(bruto)?.id ?? null;
  } catch {
    return null;
  }
}

async function requisitar(caminho, { method = 'GET', body, query, autenticado = false } = {}) {
  const url = new URL(BASE_URL + caminho);
  if (query) {
    for (const [chave, valor] of Object.entries(query)) {
      if (valor !== undefined && valor !== null && valor !== '') url.searchParams.set(chave, valor);
    }
  }

  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (autenticado) {
    const usuarioId = obterUsuarioId();
    if (usuarioId) headers['x-usuario-id'] = usuarioId;
  }

  const resposta = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (resposta.status === 204) return null;

  const dados = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    const erro = new ErroApi({
      erro: dados?.erro ?? 'Erro inesperado ao comunicar com o servidor',
      codigo: dados?.codigo ?? 'ERRO_INTERNO',
      detalhes: dados?.detalhes,
      status: resposta.status,
    });

    // RF32/P-18: sessão inválida (usuário não existe mais, ex.: após reset do banco) —
    // encerra a sessão local e manda para o login em vez de deixar o erro cru no formulário.
    // A checagem de /api/auth/eu é ignorada aqui: quem a chama (o guard de rota) já trata
    // a falha com mais contexto (redirecionarPara), então redirecionar aqui também duplicaria a navegação.
    if (erro.codigo === 'NAO_AUTENTICADO' && caminho !== '/api/auth/eu') {
      const sessao = useSessaoStore();
      sessao.encerrarSessao();
      // import dinâmico: evita ciclo estático com rotas/index.js, que importa api/auth.js
      import('@/rotas/index.js').then(({ router }) => {
        if (router.currentRoute.value.name !== 'login') {
          router.push({ name: 'login', query: { sessaoExpirada: '1' } });
        }
      });
    }

    throw erro;
  }

  return dados;
}

export const api = {
  get: (caminho, opcoes) => requisitar(caminho, { ...opcoes, method: 'GET' }),
  post: (caminho, body, opcoes) => requisitar(caminho, { ...opcoes, method: 'POST', body, autenticado: true }),
  put: (caminho, body, opcoes) => requisitar(caminho, { ...opcoes, method: 'PUT', body, autenticado: true }),
  patch: (caminho, body, opcoes) => requisitar(caminho, { ...opcoes, method: 'PATCH', body, autenticado: true }),
  delete: (caminho, opcoes) => requisitar(caminho, { ...opcoes, method: 'DELETE', autenticado: true }),
};
