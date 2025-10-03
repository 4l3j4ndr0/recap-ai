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
                  <div class="animated-logo">
                    <svg
                      width="120"
                      height="120"
                      viewBox="0 0 120 120"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <defs>
                        <!-- Gradientes actualizados con colores del brand -->
                        <linearGradient
                          id="micGradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop
                            offset="0%"
                            style="stop-color: #113359; stop-opacity: 1"
                          />
                          <stop
                            offset="100%"
                            style="stop-color: #0a1f3d; stop-opacity: 1"
                          />
                        </linearGradient>

                        <linearGradient
                          id="waveGradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="0%"
                        >
                          <stop
                            offset="0%"
                            style="stop-color: #21ba45; stop-opacity: 0.8"
                          />
                          <stop
                            offset="50%"
                            style="stop-color: #31ccec; stop-opacity: 0.6"
                          />
                          <stop
                            offset="100%"
                            style="stop-color: #9c27b0; stop-opacity: 0.4"
                          />
                        </linearGradient>

                        <linearGradient
                          id="aiGradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop
                            offset="0%"
                            style="stop-color: #ff6b35; stop-opacity: 1"
                          />
                          <stop
                            offset="100%"
                            style="stop-color: #e55a2b; stop-opacity: 1"
                          />
                        </linearGradient>

                        <radialGradient
                          id="circuitGradient"
                          cx="50%"
                          cy="50%"
                          r="50%"
                        >
                          <stop
                            offset="0%"
                            style="stop-color: #ff6b35; stop-opacity: 0.3"
                          />
                          <stop
                            offset="100%"
                            style="stop-color: #9c27b0; stop-opacity: 0.1"
                          />
                        </radialGradient>
                      </defs>

                      <!-- Círculo de fondo con efecto neural -->
                      <circle
                        cx="60"
                        cy="60"
                        r="55"
                        fill="url(#circuitGradient)"
                        stroke="#113359"
                        stroke-width="2"
                        opacity="0.1"
                      />

                      <!-- Red neural de fondo más prominente -->
                      <g opacity="0.4">
                        <line
                          x1="20"
                          y1="30"
                          x2="40"
                          y2="45"
                          stroke="#FF6B35"
                          stroke-width="2"
                        />
                        <line
                          x1="40"
                          y1="45"
                          x2="60"
                          y2="35"
                          stroke="#FF6B35"
                          stroke-width="2"
                        />
                        <line
                          x1="60"
                          y1="35"
                          x2="80"
                          y2="25"
                          stroke="#FF6B35"
                          stroke-width="2"
                        />
                        <line
                          x1="80"
                          y1="25"
                          x2="95"
                          y2="40"
                          stroke="#FF6B35"
                          stroke-width="2"
                        />
                        <line
                          x1="25"
                          y1="80"
                          x2="45"
                          y2="95"
                          stroke="#FF6B35"
                          stroke-width="2"
                        />
                        <line
                          x1="45"
                          y1="95"
                          x2="75"
                          y2="85"
                          stroke="#FF6B35"
                          stroke-width="2"
                        />
                        <line
                          x1="75"
                          y1="85"
                          x2="95"
                          y2="75"
                          stroke="#FF6B35"
                          stroke-width="2"
                        />

                        <!-- Nodos neurales con colores del brand -->
                        <circle cx="20" cy="30" r="3" fill="#21BA45" />
                        <circle cx="40" cy="45" r="3" fill="#31CCEC" />
                        <circle cx="60" cy="35" r="3" fill="#9C27B0" />
                        <circle cx="80" cy="25" r="3" fill="#21BA45" />
                        <circle cx="100" cy="40" r="3" fill="#31CCEC" />
                        <circle cx="25" cy="95" r="3" fill="#9C27B0" />
                        <circle cx="45" cy="95" r="3" fill="#21BA45" />
                        <circle cx="75" cy="85" r="3" fill="#31CCEC" />
                        <circle cx="95" cy="75" r="3" fill="#9C27B0" />
                      </g>

                      <!-- Micrófono principal -->
                      <g transform="translate(60,60)">
                        <!-- Cuerpo del micrófono -->
                        <rect
                          x="-8"
                          y="-25"
                          width="16"
                          height="30"
                          rx="8"
                          fill="url(#micGradient)"
                        />

                        <!-- Base del micrófono -->
                        <rect
                          x="-12"
                          y="8"
                          width="24"
                          height="4"
                          rx="2"
                          fill="#0a1f3d"
                        />
                        <rect
                          x="-6"
                          y="12"
                          width="12"
                          height="8"
                          rx="1"
                          fill="#0a1f3d"
                        />

                        <!-- Detalles del micrófono -->
                        <circle
                          cx="0"
                          cy="-15"
                          r="2"
                          fill="#ffffff"
                          opacity="0.3"
                        />
                        <rect
                          x="-6"
                          y="-5"
                          width="12"
                          height="1"
                          fill="#ffffff"
                          opacity="0.2"
                        />
                        <rect
                          x="-6"
                          y="0"
                          width="12"
                          height="1"
                          fill="#ffffff"
                          opacity="0.2"
                        />
                      </g>

                      <!-- Símbolo AI prominente -->
                      <g transform="translate(85,35)">
                        <!-- Hexágono AI -->
                        <polygon
                          points="0,-8 7,-4 7,4 0,8 -7,4 -7,-4"
                          fill="url(#aiGradient)"
                          opacity="0.9"
                        >
                          <animateTransform
                            attributeName="transform"
                            type="rotate"
                            values="0;360"
                            dur="8s"
                            repeatCount="indefinite"
                          />
                        </polygon>

                        <!-- Texto AI -->
                        <text
                          x="0"
                          y="2"
                          text-anchor="middle"
                          fill="white"
                          font-family="Arial, sans-serif"
                          font-size="6"
                          font-weight="bold"
                        >
                          AI
                        </text>
                      </g>

                      <!-- Ondas de sonido animadas -->
                      <g opacity="0.7">
                        <!-- Onda 1 -->
                        <path
                          d="M 85 45 Q 95 60 85 75"
                          stroke="url(#waveGradient)"
                          stroke-width="3"
                          fill="none"
                          stroke-linecap="round"
                        >
                          <animate
                            attributeName="opacity"
                            values="0.3;0.8;0.3"
                            dur="2s"
                            repeatCount="indefinite"
                          />
                        </path>

                        <!-- Onda 2 -->
                        <path
                          d="M 90 40 Q 105 60 90 80"
                          stroke="url(#waveGradient)"
                          stroke-width="2"
                          fill="none"
                          stroke-linecap="round"
                        >
                          <animate
                            attributeName="opacity"
                            values="0.2;0.6;0.2"
                            dur="2s"
                            begin="0.5s"
                            repeatCount="indefinite"
                          />
                        </path>

                        <!-- Onda 3 -->
                        <path
                          d="M 95 35 Q 115 60 95 85"
                          stroke="url(#waveGradient)"
                          stroke-width="1"
                          fill="none"
                          stroke-linecap="round"
                        >
                          <animate
                            attributeName="opacity"
                            values="0.1;0.4;0.1"
                            dur="2s"
                            begin="1s"
                            repeatCount="indefinite"
                          />
                        </path>
                      </g>

                      <!-- Partículas de procesamiento AI -->
                      <g opacity="0.8">
                        <circle cx="25" cy="45" r="2" fill="#FF6B35">
                          <animate
                            attributeName="r"
                            values="1;3;1"
                            dur="3s"
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="opacity"
                            values="0.3;1;0.3"
                            dur="3s"
                            repeatCount="indefinite"
                          />
                        </circle>
                        <circle cx="30" cy="55" r="1.5" fill="#9C27B0">
                          <animate
                            attributeName="r"
                            values="0.5;2.5;0.5"
                            dur="3s"
                            begin="1s"
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="opacity"
                            values="0.2;0.8;0.2"
                            dur="3s"
                            begin="1s"
                            repeatCount="indefinite"
                          />
                        </circle>
                        <circle cx="20" cy="65" r="1.8" fill="#FF6B35">
                          <animate
                            attributeName="r"
                            values="0.8;2.8;0.8"
                            dur="3s"
                            begin="2s"
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="opacity"
                            values="0.4;1;0.4"
                            dur="3s"
                            begin="2s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      </g>

                      <!-- Cerebro estilizado (AI) -->
                      <g transform="translate(25,25)" opacity="0.6">
                        <path
                          d="M 0,8 Q -2,4 0,0 Q 4,-2 8,0 Q 12,2 10,6 Q 8,10 4,8 Q 0,10 0,8 Z"
                          fill="#FF6B35"
                          opacity="0.7"
                        >
                          <animate
                            attributeName="opacity"
                            values="0.4;0.9;0.4"
                            dur="4s"
                            repeatCount="indefinite"
                          />
                        </path>
                        <!-- Conexiones sinápticas -->
                        <circle cx="2" cy="3" r="0.5" fill="#9C27B0" />
                        <circle cx="6" cy="2" r="0.5" fill="#9C27B0" />
                        <circle cx="8" cy="5" r="0.5" fill="#9C27B0" />
                        <circle cx="4" cy="6" r="0.5" fill="#9C27B0" />
                      </g>

                      <!-- Texto/Documento estilizado (representando el resumen) -->
                      <g transform="translate(25,75)" opacity="0.5">
                        <rect width="20" height="2" fill="#113359" rx="1" />
                        <rect
                          y="4"
                          width="15"
                          height="1"
                          fill="#113359"
                          rx="0.5"
                        />
                        <rect
                          y="7"
                          width="18"
                          height="1"
                          fill="#113359"
                          rx="0.5"
                        />
                        <rect
                          y="10"
                          width="12"
                          height="1"
                          fill="#113359"
                          rx="0.5"
                        />
                      </g>
                    </svg>
                  </div>
                  <div class="brand-text">
                    <h1 class="brand-name">
                      Recap<span class="brand-ai">AI</span>
                    </h1>
                    <p class="brand-tagline">Meeting Intelligence Platform</p>
                  </div>
                </div>
              </q-card-section>

              <q-card-section class="login-form">
                <authenticator :hide-sign-up="true">
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
    url("https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&auto=format&fit=crop&w=1965&q=80");
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
  padding: 0.5rem 1rem 0.2rem;
}

.logo-container {
  margin-bottom: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
}

.animated-logo {
  transition: transform 0.3s ease;
}

.animated-logo:hover {
  transform: scale(1.05);
}

.brand-text {
  text-align: center;
}

.brand-name {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  color: #113359;
  letter-spacing: -0.02em;
}

.brand-ai {
  color: #ff6b35;
  background: linear-gradient(135deg, #ff6b35 0%, #9c27b0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-tagline {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
  font-weight: 400;
  letter-spacing: 0.5px;
  text-transform: uppercase;
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

  .animated-logo svg {
    width: 80px;
    height: 80px;
  }

  .brand-name {
    font-size: 1.8rem;
  }

  .brand-tagline {
    font-size: 0.8rem;
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
