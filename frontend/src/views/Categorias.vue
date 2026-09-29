<template>
  <div class="pagina">
    <AppSidebar />

    <main class="conteudo">
      <header class="topo">
        <div>
          <div class="breadcrumb">
            <span>Categorias</span>
          </div>

          <h1>Categorias</h1>
          <p>Gerencie as categorias usadas no cadastro de produtos.</p>
        </div>
      </header>

      <section class="card">
        <form class="filtros" @submit.prevent="salvarCategoria">
          <div class="campo">
            <label for="nome">Nome da categoria</label>

            <input
              id="nome"
              v-model="form.nome"
              type="text"
              maxlength="60"
              placeholder="Digite o nome da categoria"
              required
            />
          </div>

          <div class="campo">
            <label for="categoriaPai">Categoria pai</label>

            <select id="categoriaPai" v-model="form.categoriaPai">
              <option value="">Nenhuma</option>

              <option
                v-for="categoria in categoriasAtivas"
                :key="categoria.id"
                :value="categoria.id"
              >
                {{ categoria.nome }}
              </option>
            </select>
          </div>

          <button type="submit" class="btn-novo" :disabled="salvando">
            <span>+</span>
            {{ salvando ? 'Salvando...' : 'Nova categoria' }}
          </button>
        </form>

        <div v-if="erro" class="resultado-info erro">
          {{ erro }}
        </div>

        <div class="tabela-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Categoria</th>
                <th>Categoria pai</th>
                <th>Situação</th>
                <th class="th-acoes">Ações</th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="categorias.length === 0">
                <td colspan="5" class="sem-resultados">
                  Nenhuma categoria cadastrada.
                </td>
              </tr>

              <tr
                v-for="categoria in categorias"
                :key="categoria.id"
              >
                <td><span class="sku">{{ categoria.id }}</span></td>

                <td><div class="produto-nome">{{ categoria.nome }}</div></td>

                <td>{{ nomeCategoria(categoria.categoria_pai_id) }}</td>

                <td>
                  <span
                    class="status"
                    :class="categoria.ativo ? 'status-ativo' : 'status-inativo'"
                  >
                    <span class="bolinha"></span>

                    {{ categoria.ativo ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>

                <td>
                  <button
                    v-if="categoria.ativo"
                    class="acao"
                    title="Inativar"
                    @click="inativar(categoria)"
                  >
                    ⊘
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

import AppSidebar from '../components/AppSidebar.vue'
import {
  obterCategorias,
  criarCategoria,
  inativarCategoria
} from '../data/produtos'

const categorias = ref([])
const erro = ref('')
const salvando = ref(false)

const form = ref({
  nome: '',
  categoriaPai: ''
})

const categoriasAtivas = computed(() =>
  categorias.value.filter(categoria => categoria.ativo)
)

onMounted(() => {
  carregarCategorias()
})

async function carregarCategorias() {
  try {
    categorias.value = await obterCategorias()
  } catch (e) {
    erro.value = e.message
  }
}

function nomeCategoria(id) {
  if (!id) return '—'

  return categorias.value.find(categoria => categoria.id === id)?.nome ?? id
}

async function salvarCategoria() {
  erro.value = ''
  salvando.value = true

  try {
    await criarCategoria({
      nome: form.value.nome.trim(),
      categoria_pai_id: form.value.categoriaPai || null
    })

    form.value = { nome: '', categoriaPai: '' }

    await carregarCategorias()
  } catch (e) {
    erro.value = e.message
  }

  salvando.value = false
}

async function inativar(categoria) {
  const confirmado = confirm(
    `Deseja realmente inativar a categoria "${categoria.nome}"?`
  )

  if (!confirmado) return

  try {
    await inativarCategoria(categoria.id)
  } catch (e) {
    alert(e.message)
  }

  carregarCategorias()
}
</script>

<style scoped src="./catalogo.css"></style>
