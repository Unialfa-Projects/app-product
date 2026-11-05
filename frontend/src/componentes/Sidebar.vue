<script setup>
import { computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { Boxes, Tag, Ruler, ChevronLeft, ChevronRight } from 'lucide-vue-next';
import { useSessaoStore } from '@/stores/sessao.js';

defineProps({
  recolhida: { type: Boolean, default: false },
});
defineEmits(['alternar', 'abrir-perfil']);

const route = useRoute();
const sessao = useSessaoStore();

const itens = [
  { nome: 'produtos-lista', rota: '/produtos', rotulo: 'Produtos', Icone: Boxes, prefixo: '/produtos' },
  { nome: 'categorias', rota: '/categorias', rotulo: 'Categorias', Icone: Tag, prefixo: '/categorias' },
  { nome: 'unidades-medida', rota: '/unidades-medida', rotulo: 'Unidades de medida', Icone: Ruler, prefixo: '/unidades-medida' },
];

function estaAtiva(item) {
  return route.path.startsWith(item.prefixo);
}

const dataFormatada = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit',
}).format(new Date());

const iniciais = computed(() => {
  const nome = sessao.usuario?.nome ?? '';
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  return (partes[0][0] + (partes[1]?.[0] ?? '')).toUpperCase();
});
</script>

<template>
  <aside class="sidebar" :class="{ 'sidebar--recolhida': recolhida }">
    <div class="sidebar__topo">
      <div v-if="!recolhida" class="sidebar__marca">
        <span class="sidebar__logo" aria-hidden="true">
          <Boxes :size="18" />
        </span>
        <div class="sidebar__marca-texto">
          <p class="sidebar__marca-nome">Catálogo</p>
          <p class="sidebar__marca-data">Data: {{ dataFormatada }}</p>
        </div>
      </div>
      <button
        class="sidebar__alternar"
        type="button"
        :aria-label="recolhida ? 'Expandir menu' : 'Recolher menu'"
        @click="$emit('alternar')"
      >
        <ChevronRight v-if="recolhida" :size="16" />
        <ChevronLeft v-else :size="16" />
      </button>
    </div>

    <nav class="sidebar__nav" aria-label="Navegação principal">
      <RouterLink
        v-for="item in itens"
        :key="item.nome"
        :to="item.rota"
        class="sidebar__item"
        :class="{ 'sidebar__item--ativo': estaAtiva(item) }"
        :title="recolhida ? item.rotulo : undefined"
      >
        <component :is="item.Icone" :size="18" class="sidebar__item-icone" />
        <span v-if="!recolhida" class="sidebar__item-rotulo">{{ item.rotulo }}</span>
      </RouterLink>
    </nav>

    <button
      type="button"
      class="sidebar__rodape"
      :title="recolhida ? 'Perfil' : undefined"
      @click="$emit('abrir-perfil')"
    >
      <span class="sidebar__avatar" aria-hidden="true">{{ iniciais }}</span>
      <div v-if="!recolhida" class="sidebar__usuario">
        <p class="sidebar__usuario-nome">{{ sessao.usuario?.nome ?? 'Usuário' }}</p>
        <p class="sidebar__usuario-id">ID #{{ sessao.usuario?.id }}</p>
      </div>
    </button>
  </aside>
</template>

<style scoped>
.sidebar {
  display: none;
}

@media (min-width: 1024px) {
  .sidebar {
    display: flex;
    flex-direction: column;
    width: var(--largura-sidebar);
    flex-shrink: 0;
    background: var(--cor-sidebar-fundo);
    height: 100vh;
    position: sticky;
    top: 0;
    transition: width 0.15s ease;
  }

  .sidebar--recolhida {
    width: var(--largura-sidebar-rail);
  }
}

.sidebar__topo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--espaco-2);
  padding: var(--espaco-4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.sidebar--recolhida .sidebar__topo {
  justify-content: center;
}

.sidebar__marca {
  display: flex;
  align-items: center;
  gap: var(--espaco-3);
  min-width: 0;
}

.sidebar__logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: var(--cor-primaria);
  color: #fff;
  flex-shrink: 0;
}

.sidebar__marca-texto {
  min-width: 0;
}

.sidebar__marca-nome {
  color: #fff;
  font-weight: 700;
  font-size: 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar__marca-data {
  color: var(--cor-sidebar-texto);
  font-size: 11.5px;
  white-space: nowrap;
}

.sidebar__alternar {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--raio-sm);
  background: var(--cor-primaria);
  color: #fff;
  border: none;
  cursor: pointer;
}
.sidebar__alternar:hover {
  background: var(--cor-primaria-hover);
}

.sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--espaco-4) var(--espaco-3);
  flex: 1;
}

.sidebar__item {
  display: flex;
  align-items: center;
  gap: var(--espaco-3);
  padding: 10px 14px;
  border-radius: var(--raio-md);
  color: var(--cor-sidebar-texto);
  font-size: 14px;
  font-weight: 500;
}

.sidebar__item:hover {
  background: rgba(255, 255, 255, 0.06);
  color: var(--cor-sidebar-texto-ativo);
}

.sidebar__item--ativo {
  background: var(--cor-sidebar-item-ativo);
  color: #fff;
}

.sidebar__item-icone {
  flex-shrink: 0;
}

.sidebar__item-rotulo {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar__rodape {
  display: flex;
  align-items: center;
  gap: var(--espaco-3);
  padding: var(--espaco-4);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  border-left: none;
  border-right: none;
  border-bottom: none;
  background: transparent;
  width: 100%;
  text-align: left;
  cursor: pointer;
}
.sidebar__rodape:hover {
  background: rgba(255, 255, 255, 0.06);
}

.sidebar__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.sidebar__usuario {
  min-width: 0;
}

.sidebar__usuario-nome {
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar__usuario-id {
  color: var(--cor-sidebar-texto);
  font-size: 11.5px;
}

</style>
