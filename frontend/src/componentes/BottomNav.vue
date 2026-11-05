<script setup>
import { computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { Boxes, Tag, Ruler } from 'lucide-vue-next';
import { useSessaoStore } from '@/stores/sessao.js';

defineEmits(['abrir-perfil']);

const route = useRoute();
const sessao = useSessaoStore();

const iniciais = computed(() => {
  const nome = sessao.usuario?.nome ?? '';
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  return (partes[0][0] + (partes[1]?.[0] ?? '')).toUpperCase();
});

const itens = [
  { nome: 'produtos-lista', rota: '/produtos', rotulo: 'Produtos', Icone: Boxes, prefixo: '/produtos' },
  { nome: 'categorias', rota: '/categorias', rotulo: 'Categorias', Icone: Tag, prefixo: '/categorias' },
  { nome: 'unidades-medida', rota: '/unidades-medida', rotulo: 'Unidades', Icone: Ruler, prefixo: '/unidades-medida' },
];

function estaAtiva(item) {
  return route.path.startsWith(item.prefixo);
}
</script>

<template>
  <nav class="bottom-nav" aria-label="Navegação principal">
    <RouterLink
      v-for="item in itens"
      :key="item.nome"
      :to="item.rota"
      class="bottom-nav__item"
      :class="{ 'bottom-nav__item--ativo': estaAtiva(item) }"
      :aria-label="item.rotulo"
    >
      <component :is="item.Icone" :size="20" />
    </RouterLink>
    <span class="bottom-nav__divisor" aria-hidden="true" />
    <button
      type="button"
      class="bottom-nav__avatar"
      :title="sessao.usuario?.nome"
      aria-label="Perfil"
      @click="$emit('abrir-perfil')"
    >{{ iniciais }}</button>
  </nav>
</template>

<style scoped>
.bottom-nav {
  display: flex;
  align-items: center;
  gap: var(--espaco-3);
  padding: 10px var(--espaco-4);
  background: var(--cor-sidebar-fundo);
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 40;
  height: var(--altura-bottomnav);
}

@media (min-width: 1024px) {
  .bottom-nav {
    display: none;
  }
}

.bottom-nav__item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  border-radius: var(--raio-md);
  color: var(--cor-sidebar-texto);
}

.bottom-nav__item--ativo {
  background: var(--cor-primaria);
  color: #fff;
}

.bottom-nav__divisor {
  width: 1px;
  height: 28px;
  background: rgba(255, 255, 255, 0.15);
}

.bottom-nav__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
  border: none;
  cursor: pointer;
  padding: 0;
}
.bottom-nav__avatar:hover {
  background: rgba(255, 255, 255, 0.25);
}
</style>
