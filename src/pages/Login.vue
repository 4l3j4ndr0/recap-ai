<template>
  <q-layout
    :style="$q.platform.is.bex ? 'min-width: 750px; min-height: 500px' : ''"
  >
    <q-page-container>
      <q-page class="login-page">
        <!-- Contenedor principal responsive -->
        <div class="login-container">
          <!-- Sección de imagen/background izquierda -->
          <div class="login-hero">
            <div class="hero-content">
              <h2 class="hero-title">Welcome to the Future</h2>
              <p class="hero-subtitle">
                Where AI Turns Conversations into Clarity
              </p>
            </div>
          </div>

          <!-- Panel de login derecha -->
          <div class="login-panel">
            <q-card class="login-card" flat>
              <q-card-section class="login-header">
                <div class="logo-container">
                  <img class="logo" alt="Logo" src="logo.jpeg" />
                </div>
              </q-card-section>

              <q-card-section class="login-form">
                <authenticator :hide-sign-up="false">
                  <template v-slot:header>
                    <!-- Header personalizado ya está arriba -->
                  </template>
                </authenticator>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { Authenticator } from "@aws-amplify/ui-vue";
import "@aws-amplify/ui-vue/styles.css";
//@ts-ignore
import { useQuasar } from "quasar";

const $q: any = useQuasar();
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  overflow: hidden;
}

.login-container {
  display: flex;
  min-height: 100vh;
}

/* Sección izquierda - Hero/Background */
.login-hero {
  flex: 1;
  background:
    linear-gradient(
      135deg,
      rgba(17, 51, 89, 0.7) 0%,
      rgba(17, 51, 89, 0.5) 50%,
      rgba(17, 51, 89, 0.6) 100%
    ),
    url("https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.hero-content {
  text-align: center;
  color: white;
  padding: 2rem;
  max-width: 500px;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
  font-weight: 300;
}

/* Panel de login derecha */
.login-panel {
  flex: 0 0 480px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  box-shadow: -5px 0 20px rgba(0, 0, 0, 0.1);
}

.login-card {
  width: 100%;
}

.login-header {
  text-align: center;
  padding: 2rem 1rem 1rem;
}

.logo-container {
  margin-bottom: 2rem;
}

.logo {
  width: 200px;
  height: auto;
  border-radius: 12px;
}

.login-title {
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
  color: #1a1a1a;
}

.login-form {
  padding: 1rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }

  .login-hero {
    flex: 0 0 40vh;
    min-height: 300px;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .login-panel {
    flex: 1;
    padding: 1rem;
  }

  .login-header {
    padding: 1rem 1rem 0.5rem;
  }

  .logo {
    width: 80px;
  }

  .login-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .login-hero {
    min-height: 250px;
  }

  .hero-content {
    padding: 1rem;
  }

  .hero-title {
    font-size: 1.8rem;
  }

  .login-panel {
    padding: 0.5rem;
  }
}

/* Personalización del Authenticator */
:deep(.amplify-authenticator) {
  --amplify-colors-brand-primary-80: #113359;
  --amplify-colors-brand-primary-90: #0d2644;
  --amplify-colors-brand-primary-100: #113359;
}

:deep(.amplify-button--primary) {
  background: #113359 !important;
  border-color: #113359 !important;
}

:deep(.amplify-button--primary:hover) {
  background: #0d2644 !important;
  border-color: #0d2644 !important;
}

:deep(.amplify-field__label) {
  font-weight: 500;
  color: #374151;
}

:deep(.amplify-input) {
  border-radius: 8px;
  border: 1px solid #d1d5db;
  padding: 12px 16px;
}

:deep(.amplify-input:focus) {
  border-color: #113359;
  box-shadow: 0 0 0 3px rgba(17, 51, 89, 0.1);
}
</style>
