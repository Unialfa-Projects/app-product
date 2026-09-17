// database/seed/massa-5000.js
// Gera 5.000 produtos sintéticos para exercitar RNF01 (listagem) e RNF02 (consulta por id).
import pg from 'pg';

const { Pool } = pg;
const DATABASE_URL = process.env.DATABASE_URL
  ?? 'postgresql://sige:sige@localhost:5432/sige_produtos';

const TOTAL_PRODUTOS = 5000;

const NOMES_BASE = [
  'Fone de Ouvido Bluetooth', 'Carregador Portátil Power Bank', 'Cabo USB-C Reforçado',
  'Suporte de Celular Articulado', 'Caixa de Som Portátil', 'Mouse Sem Fio Ergonômico',
  'Jogo de Panelas Antiaderente', 'Luminária de Mesa LED', 'Organizador Multiuso',
  'Jogo de Toalhas de Banho', 'Camiseta Básica Algodão', 'Calça Jeans Reta',
  'Tênis Casual Urbano', 'Boné Aba Curva', 'Caderno Universitário 80 Folhas',
  'Kit Canetas Esferográficas', 'Mochila Executiva', 'Estojo Escolar Duplo',
  'Sérum Facial Hidratante', 'Protetor Solar Facial FPS 60', 'Batom Matte Longa Duração',
  'Escova de Cabelo Profissional', 'Porta-Objetos Multiuso', 'Balde Organizador com Tampa',
  'Bola de Futebol Society', 'Quebra-Cabeça 500 Peças', 'Jogo de Tabuleiro Família',
  'Skate Iniciante', 'Relógio Digital Esportivo', 'Cinto de Couro Sintético',
];

const CATEGORIAS_INFO = [
  { nome: 'Acessórios Mobile',    prefixo: 'ELE' },
  { nome: 'Áudio e Som',          prefixo: 'AUD' },
  { nome: 'Cozinha e Casa',       prefixo: 'CAS' },
  { nome: 'Iluminação',           prefixo: 'ILU' },
  { nome: 'Vestuário Básico',     prefixo: 'MOD' },
  { nome: 'Calçados',             prefixo: 'CAL' },
  { nome: 'Escolar e Escritório', prefixo: 'PAP' },
  { nome: 'Escrita',              prefixo: 'ESC' },
  { nome: 'Cuidados Diários',     prefixo: 'BEL' },
  { nome: 'Maquiagem',            prefixo: 'MAQ' },
  { nome: 'Organização',          prefixo: 'UTI' },
  { nome: 'Jogos e Brinquedos',   prefixo: 'LAZ' },
];

function calcularDvEan13(prefixo12) {
  let soma = 0;
  for (let i = 0; i < 12; i++) {
    const digito = Number(prefixo12[i]);
    soma += (i % 2 === 0) ? digito : digito * 3;
  }
  const resto = soma % 10;
  return resto === 0 ? 0 : 10 - resto;
}

function gerarEan13Valido() {
  let prefixo12 = '789';
  for (let i = 0; i < 9; i++) prefixo12 += Math.floor(Math.random() * 10);
  return prefixo12 + calcularDvEan13(prefixo12);
}

function aleatorioEntre(min, max, casas = 2) {
  const valor = Math.random() * (max - min) + min;
  return Number(valor.toFixed(casas));
}

function escolher(lista) {
  return lista[Math.floor(Math.random() * lista.length)];
}

async function main() {
  const pool = new Pool({ connectionString: DATABASE_URL });
  const client = await pool.connect();

  try {
    const { rows: categorias } = await client.query(
      `SELECT id, nome FROM categoria WHERE categoria_pai_id IS NOT NULL`
    );
    const { rows: unidades } = await client.query(`SELECT id FROM unidade_medida`);

    if (categorias.length === 0 || unidades.length === 0) {
      throw new Error('Rode db:seed antes de db:massa — faltam categorias ou unidades de medida.');
    }

    const categoriaPorNome = new Map(categorias.map((c) => [c.nome, c.id]));
    const infoDisponivel = CATEGORIAS_INFO.filter((c) => categoriaPorNome.has(c.nome));

    console.log(`Gerando ${TOTAL_PRODUTOS} produtos sintéticos...`);
    const inicio = Date.now();

    await client.query('BEGIN');

    const contadorPorPrefixo = new Map();
    const nomesUsadosPorCategoria = new Map();
    const produtosInseridos = [];

    for (let i = 0; i < TOTAL_PRODUTOS; i++) {
      const info = escolher(infoDisponivel);
      const categoriaId = categoriaPorNome.get(info.nome);
      const unidadeId = escolher(unidades).id;

      const seq = (contadorPorPrefixo.get(info.prefixo) ?? 0) + 1;
      contadorPorPrefixo.set(info.prefixo, seq);
      const sku = `${info.prefixo}${String(seq).padStart(4, '0')}`;

      const usados = nomesUsadosPorCategoria.get(categoriaId) ?? new Set();
      let nome = `${escolher(NOMES_BASE)} ${info.nome}`;
      let tentativa = 0;
      while (usados.has(nome) && tentativa < 20) {
        nome = `${escolher(NOMES_BASE)} ${info.nome} ${sku}`;
        tentativa++;
      }
      usados.add(nome);
      nomesUsadosPorCategoria.set(categoriaId, usados);

      const ean13 = Math.random() < 0.7 ? gerarEan13Valido() : null;
      const precoCusto = aleatorioEntre(1, 500);
      const precoVenda = Number((precoCusto * aleatorioEntre(1.2, 2.5)).toFixed(2));
      const estoque = Math.random() < 0.1 ? 0 : aleatorioEntre(0, 500, 3);
      const ativo = Math.random() >= 0.1;
      const descricao = `[MASSA] Produto sintético gerado para teste de carga (RNF01/RNF02).`;

      produtosInseridos.push({
        sku, nome, descricao, ean13, categoriaId, unidadeId,
        precoCusto, precoVenda, estoque, ativo,
      });
    }

    for (const p of produtosInseridos) {
      const { rows } = await client.query(
        `INSERT INTO produto
           (sku, nome, descricao, ean13, categoria_id, unidade_medida_id,
            preco_custo, preco_venda, estoque, ativo)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         RETURNING id`,
        [p.sku, p.nome, p.descricao, p.ean13, p.categoriaId, p.unidadeId,
         p.precoCusto, p.precoVenda, p.estoque, p.ativo]
      );
      const produtoId = rows[0].id;

      await client.query(
        `INSERT INTO produto_preco_historico
           (produto_id, tipo_preco, valor_anterior, valor_novo, motivo)
         VALUES ($1, 'venda', NULL, $2, 'Cadastro inicial (massa de teste)')`,
        [produtoId, p.precoVenda]
      );

      if (Math.random() < 0.15) {
        const novoValor = Number((p.precoVenda * aleatorioEntre(1.02, 1.15)).toFixed(2));
        await client.query(
          `INSERT INTO produto_preco_historico
             (produto_id, tipo_preco, valor_anterior, valor_novo, motivo)
           VALUES ($1, 'venda', $2, $3, 'Reajuste (massa de teste)')`,
          [produtoId, p.precoVenda, novoValor]
        );
        await client.query(`UPDATE produto SET preco_venda = $1 WHERE id = $2`, [novoValor, produtoId]);
      }
    }

    await client.query('COMMIT');

    const duracaoInsercao = Date.now() - inicio;
    console.log(`Massa inserida em ${duracaoInsercao} ms.`);

    const t1 = Date.now();
    await client.query(
      `SELECT id, sku, nome, preco_venda FROM produto WHERE ativo = TRUE ORDER BY id LIMIT 20`
    );
    console.log(`RNF01 — listagem (20 registros, base de ${TOTAL_PRODUTOS}): ${Date.now() - t1} ms (limite: 2000 ms)`);

    const algumId = produtosInseridos.length > 0 ? (await client.query('SELECT id FROM produto ORDER BY random() LIMIT 1')).rows[0].id : null;
    if (algumId) {
      const t2 = Date.now();
      await client.query(`SELECT * FROM produto WHERE id = $1`, [algumId]);
      console.log(`RNF02 — consulta por id: ${Date.now() - t2} ms (limite: 500 ms)`);
    }

    console.log('Concluído.');
  } catch (erro) {
    await client.query('ROLLBACK');
    console.error('Falha ao gerar massa de dados:', erro);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
