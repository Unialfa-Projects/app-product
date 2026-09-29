<template>
  <div class="pagina">
    <AppSidebar />

    <main class="conteudo">
      <header class="topo">
        <div>
          <div class="breadcrumb">
            <span>Unidades de medida</span>
          </div>

          <h1>Unidades de medida</h1>
          <p>Gerencie as unidades usadas no cadastro de produtos.</p>
        </div>
      </header>

      <section class="card">
        <form class="filtros filtros-unidade" @submit.prevent="salvarUnidade">
          <div class="campo">
            <label for="nome">Nome</label>

            <input
              id="nome"
              v-model="form.nome"
              type="text"
              maxlength="60"
              placeholder="Ex.: Quilograma"
              required
            />
          </div>

          <div class="campo">
            <label for="sigla">Sigla</label>

            <input
              id="sigla"
              v-model="form.sigla"
              type="text"
              maxlength="10"
              placeholder="Ex.: KG"
              required
              @input="form.sigla = form.sigla.toUpperCase()"
            />
          </div>

          <div class="campo">
            <label for="descricao">Descrição</label>

            <input
              id="descricao"
              v-model="form.descricao"
              type="text"
              maxlength="200"
              placeholder="Opcional"
            />
          </div>

          <div class="campo">
            <label for="casasDecimais">Casas decimais</label>

            <input
              id="casasDecimais"
              v-model.number="form.casasDecimais"
              type="number"
              min="0"
              step="1"
            />
          </div>

          <button type="submit" class="btn-novo" :disabled="salvando">
            <span>+</span>
            {{ salvando ? 'Salvando...' : 'Nova unidade' }}
          </button>
        </form>

        <div v-if="erro" class="resultado-info erro">
          {{ erro }}
        </div>

        <div class="tabela-container">
          <table>
            <thead>
              <tr>
                <th>Sigla</th>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Casas decimais</th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="unidades.length === 0">
                <td colspan="4" class="sem-resultados">
                  Nenhuma unidade cadastrada.
                </td>
              </tr>

              <tr
                v-for="unidade in unidades"
                :key="unidade.id"
              >
                <td><span class="sku">{{ unidade.sigla }}</span></td>
                <td><div class="produto-nome">{{ unidade.nome }}</div></td>
                <td>{{ unidade.descricao || '—' }}</td>
                <td>{{ unidade.casas_decimais }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'

import AppSidebar from '../components/AppSidebar.vue'
import { obterUnidades, criarUnidade } from '../data/produtos'

const unidades = ref([])
const erro = ref('')
const salvando = ref(false)

const form = ref({
  nome: '',
  sigla: '',
  descricao: '',
  casasDecimais: 0
})

onMounted(() => {
  carregarUnidades()
})

async function carregarUnidades() {
  try {
    unidades.value = await obterUnidades()
  } catch (e) {
    erro.value = e.message
  }
}

async function salvarUnidade() {
  erro.value = ''
  salvando.value = true

  try {
    await criarUnidade({
      nome: form.value.nome.trim(),
      sigla: form.value.sigla.trim(),
      descricao: form.value.descricao.trim() || null,
      casas_decimais: form.value.casasDecimais || 0
    })

    form.value = { nome: '', sigla: '', descricao: '', casasDecimais: 0 }

    await carregarUnidades()
  } catch (e) {
    erro.value = e.message
  }

  salvando.value = false
}
</script>

<style scoped src="./catalogo.css"></style>
