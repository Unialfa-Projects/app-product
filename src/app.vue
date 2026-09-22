<template>
  <div class="app-shell">
    <header class="topbar">
      <nav class="breadcrumb" aria-label="Navegação estrutural">
        <span>Início</span>
        <span class="breadcrumb-separator">/</span>
        <strong>{{ telaAtual === 'login' ? 'Login' : 'Cadastro' }}</strong>
      </nav>
    </header>

    <main class="pagina">
      <section class="login-card" :aria-labelledby="telaAtual === 'login' ? 'login-title' : 'cadastro-title'">
        <template v-if="telaAtual === 'login'">
          <p class="eyebrow">BEM-VINDO DE VOLTA</p>
          <h1 id="login-title">Acesse sua conta</h1>
          <p class="intro">Entre com seus dados para continuar.</p>

          <form @submit.prevent="entrar">
            <label for="usuario">Usuário</label>
            <div class="input-wrap">
              <svg class="field-icon" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="8" r="3.5" />
                <path d="M5.5 20c.5-3.1 2.7-5 6.5-5s6 1.9 6.5 5" />
              </svg>
              <input id="usuario" type="text" placeholder="Digite seu usuário" autocomplete="username">
            </div>

            <label for="senha">Senha</label>
            <div class="input-wrap">
              <svg class="field-icon" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="5.5" y="10" width="13" height="10" rx="1.5" />
                <path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10" />
              </svg>
              <input id="senha" type="password" placeholder="Digite sua senha" autocomplete="current-password">
            </div>

            <div class="form-options">
              <label class="remember-option">
                <input type="checkbox">
                <span>Lembrar de mim</span>
              </label>
              <a href="#" @click.prevent>Esqueci minha senha</a>
            </div>

            <button type="submit">
              <span>Entrar</span>
              <span class="button-arrow" aria-hidden="true">&#8594;</span>
            </button>
          </form>

          <p class="support">Ainda não tem uma conta? <a href="#" @click.prevent="abrirCadastro">Cadastre-se</a></p>
        </template>

        <template v-else>
          <p class="eyebrow">CRIE SUA CONTA</p>
          <h1 id="cadastro-title">Faça seu cadastro</h1>
          <p class="intro">Preencha seus dados para começar.</p>

          <form @submit.prevent="cadastrar">
            <label for="nome">Nome completo</label>
            <div class="input-wrap">
              <svg class="field-icon" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="8" r="3.5" />
                <path d="M5.5 20c.5-3.1 2.7-5 6.5-5s6 1.9 6.5 5" />
              </svg>
              <input id="nome" type="text" placeholder="Digite seu nome" autocomplete="name" required>
            </div>

            <label for="email">E-mail</label>
            <div class="input-wrap">
              <svg class="field-icon" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="4" y="6" width="16" height="12" rx="1.5" />
                <path d="m5 7 7 5 7-5" />
              </svg>
              <input id="email" type="email" placeholder="Digite seu e-mail" autocomplete="email" required>
            </div>

            <label for="novo-usuario">Usuário</label>
            <div class="input-wrap">
              <svg class="field-icon" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="8" r="3.5" />
                <path d="M5.5 20c.5-3.1 2.7-5 6.5-5s6 1.9 6.5 5" />
              </svg>
              <input id="novo-usuario" type="text" placeholder="Escolha um usuário" autocomplete="username" required>
            </div>

            <label for="nova-senha">Senha</label>
            <div class="input-wrap">
              <svg class="field-icon" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="5.5" y="10" width="13" height="10" rx="1.5" />
                <path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10" />
              </svg>
              <input id="nova-senha" type="password" placeholder="Crie uma senha" autocomplete="new-password" required>
            </div>

            <label for="confirmar-senha">Confirmar senha</label>
            <div class="input-wrap">
              <svg class="field-icon" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="5.5" y="10" width="13" height="10" rx="1.5" />
                <path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10" />
              </svg>
              <input id="confirmar-senha" type="password" placeholder="Repita sua senha" autocomplete="new-password" required>
            </div>

            <button type="submit">
              <span>Criar conta</span>
              <span class="button-arrow" aria-hidden="true">&#8594;</span>
            </button>
          </form>

          <p class="support">Já tem uma conta? <a href="#" @click.prevent="abrirLogin">Entrar</a></p>
        </template>
      </section>
    </main>
  </div>
</template>

<script>
export default {
  data() {
    return {
      telaAtual: 'login'
    }
  },
  methods: {
    entrar() {
      alert('Login realizado!')
    },
    cadastrar() {
      alert('Cadastro realizado!')
    },
    abrirCadastro() {
      this.telaAtual = 'cadastro'
    },
    abrirLogin() {
      this.telaAtual = 'login'
    }
  }
}
</script>

<style>
* {
  box-sizing: border-box;
}

html,
body {
  min-width: 320px;
  min-height: 100%;
}

body {
  margin: 0;
  color: #142843;
  font-family: Arial, Helvetica, sans-serif;
  background: #f7f7fc;
}

.app-shell {
  min-height: 100vh;
}

.topbar {
  height: 43px;
  padding: 0 28px;
  display: flex;
  align-items: center;
  background: #071d3d;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 9px;
  color: #d9e1ef;
  font-size: 11px;
}

.breadcrumb-separator {
  color: #72829b;
}

.breadcrumb strong {
  color: #ffffff;
  font-weight: 700;
}

.pagina {
  min-height: calc(100vh - 43px);
  padding: 55px 24px;
  background: #f7f7fc;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-card {
  width: min(440px, 100%);
  min-height: 480px;
  padding: 43px 40px 29px;
  background: #ffffff;
  border: 1px solid #cfd2d8;
  border-radius: 4px;
  box-shadow: 0 12px 28px rgba(16, 35, 63, 0.08);
}

.eyebrow {
  margin: 0 0 10px;
  color: #1475cf;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.login-card h1 {
  margin: 0;
  color: #142843;
  font-size: 25px;
  line-height: 1.2;
  font-weight: 700;
}

.intro {
  margin: 8px 0 27px;
  color: #6d727a;
  font-size: 12px;
}

form > label {
  display: block;
  margin: 0 0 7px;
  color: #1b2b40;
  font-size: 11px;
  font-weight: 700;
}

.input-wrap {
  position: relative;
  margin-bottom: 20px;
}

.input-wrap input {
  width: 100%;
  height: 46px;
  padding: 0 14px 0 39px;
  border: 1px solid #bfc3c9;
  border-radius: 4px;
  color: #1b2b40;
  font: inherit;
  font-size: 12px;
  outline: none;
  transition: border-color 150ms ease, box-shadow 150ms ease;
}

.input-wrap input::placeholder {
  color: #aab0b8;
}

.input-wrap input:focus {
  border-color: #167be4;
  box-shadow: 0 0 0 2px rgba(22, 123, 228, 0.13);
}

.field-icon {
  position: absolute;
  top: 13px;
  left: 12px;
  width: 18px;
  height: 18px;
  fill: none;
  stroke: #7b858f;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.2;
  pointer-events: none;
}

.form-options {
  min-height: 22px;
  margin: -2px 0 17px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #707780;
  font-size: 11px;
}

.remember-option {
  display: flex;
  align-items: center;
  gap: 7px;
  cursor: pointer;
}

.remember-option input {
  width: 14px;
  height: 14px;
  margin: 0;
  accent-color: #147be1;
}

a {
  color: #1475cf;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

form > button {
  width: 100%;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 13px;
  border: none;
  border-radius: 4px;
  background: #147be5;
  color: #ffffff;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: background 150ms ease, transform 150ms ease;
}

form > button:hover {
  background: #096bcf;
}

form > button:active {
  transform: translateY(1px);
}

.button-arrow {
  font-size: 18px;
  line-height: 1;
}

.support {
  margin: 26px 0 0;
  color: #858a91;
  text-align: center;
  font-size: 11px;
}

@media (max-width: 520px) {
  .topbar {
    padding: 0 18px;
  }

  .pagina {
    padding: 30px 16px;
  }

  .login-card {
    min-height: 0;
    padding: 34px 24px 27px;
  }
}
</style>