<template>
  <aside class="sidebar">
    <div class="logo">
      <span class="logo-icon">S</span>
      <span>SIGE</span>
    </div>

    <nav>
      <router-link to="/" class="menu-item" exact-active-class="ativo">
        <span>▦</span>
        Produtos
      </router-link>

      <router-link to="/categorias" class="menu-item">
        <span>▤</span>
        Categorias
      </router-link>

      <router-link to="/unidades-medida" class="menu-item">
        <span>◫</span>
        Unidades de medida
      </router-link>
    </nav>
  </aside>
</template>

<style scoped>
/* Mesmo visual da barra lateral de Produtos.vue */

.sidebar {
  width: 240px;
  min-width: 240px;
  min-height: 100vh;

  background: #101b36;

  color: #ffffff;

  padding: 24px 16px;

  flex-shrink: 0;
}

.logo {
  display: flex;
  align-items: center;

  gap: 10px;

  font-size: 22px;
  font-weight: 700;

  margin-bottom: 42px;

  padding-left: 8px;

  color: #ffffff;
}

.logo-icon {
  width: 34px;
  height: 34px;

  border-radius: 8px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: #2563eb;

  color: #ffffff;

  font-size: 18px;
}

nav {
  display: flex;

  flex-direction: column;

  gap: 6px;
}

.menu-item {
  display: flex;

  align-items: center;

  gap: 12px;

  padding: 12px 14px;

  border-radius: 8px;

  color: #cbd5e1;

  text-decoration: none;

  font-size: 14px;

  transition: 0.2s;
}

.menu-item:hover {
  background: #182746;

  color: #ffffff;
}

.menu-item.ativo,
.menu-item.router-link-exact-active {
  background: #2563eb;

  color: #ffffff;
}

.menu-item.ativo:hover,
.menu-item.router-link-exact-active:hover {
  background: #1d4ed8;

  color: #ffffff;
}

@media (max-width: 1100px) {
  .sidebar {
    width: 220px;

    min-width: 220px;
  }
}

@media (max-width: 900px) {
  .sidebar {
    width: 190px;

    min-width: 190px;

    padding: 22px 12px;
  }
}

@media (max-width: 700px) {
  .sidebar {
    width: 100%;

    min-width: 100%;

    min-height: auto;

    padding: 14px 16px;

    border-bottom: 1px solid #1d2a4a;
  }

  .logo {
    margin-bottom: 12px;

    padding-left: 0;
  }

  nav {
    flex-direction: row;

    overflow-x: auto;

    gap: 6px;

    scrollbar-width: none;
  }

  nav::-webkit-scrollbar {
    display: none;
  }

  .menu-item {
    flex: 0 0 auto;

    white-space: nowrap;
  }
}

@media (max-width: 430px) {
  .sidebar {
    padding: 12px;
  }

  .logo {
    font-size: 20px;
  }

  .menu-item {
    font-size: 13px;

    padding: 9px 11px;
  }
}
</style>
