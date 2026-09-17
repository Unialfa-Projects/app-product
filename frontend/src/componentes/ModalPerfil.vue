<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { LogOut } from 'lucide-vue-next';
import { useSessaoStore } from '@/stores/sessao.js';
import Modal from '@/componentes/base/Modal.vue';
import Botao from '@/componentes/base/Botao.vue';

const emit = defineEmits(['fechar']);
const sessao = useSessaoStore();
const router = useRouter();

const iniciais = computed(() => {
  const nome = sessao.usuario?.nome ?? '';
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  return (partes[0][0] + (partes[1]?.[0] ?? '')).toUpperCase();
});

function sair() {
  sessao.encerrarSessao();
  emit('fechar');
  router.push('/login');
}
</script>

<template>
  <Modal titulo="Perfil" @fechar="$emit('fechar')">
    <div class="perfil">
      <span class="perfil__avatar" aria-hidden="true">{{ iniciais }}</span>
      <div class="perfil__dados">
        <p class="perfil__nome">{{ sessao.usuario?.nome ?? 'Usuário' }}</p>
        <p class="perfil__email">{{ sessao.usuario?.email ?? '—' }}</p>
      </div>
    </div>

    <template #rodape>
      <Botao variante="perigo" style="width: 100%;" @click="sair">
        <template #icone><LogOut :size="16" /></template>
        Sair da conta
      </Botao>
    </template>
  </Modal>
</template>

<style scoped>
.perfil {
  display: flex;
  align-items: center;
  gap: var(--espaco-3);
}

.perfil__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--cor-primaria);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
}

.perfil__dados {
  min-width: 0;
}

.perfil__nome {
  font-weight: 600;
  font-size: 14.5px;
  color: var(--cor-texto-principal);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.perfil__email {
  font-size: 13px;
  color: var(--cor-texto-secundario);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
