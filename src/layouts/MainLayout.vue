<template>
  <q-layout view="hHh Lpr fFf" v-if="user.token">
    <!-- Header mejorado -->
    <q-header elevated class="header-gradient">
      <q-toolbar class="toolbar-container">
        <!-- Logo y marca -->
        <div class="brand-section">
          <div class="brand-logo-svg">
            <svg width="60" height="60" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="micGradientHeader" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#f0f9ff;stop-opacity:1" />
                </linearGradient>
                
                <linearGradient id="waveGradientHeader" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style="stop-color:#4ade80;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#38bdf8;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#c084fc;stop-opacity:1" />
                </linearGradient>
                
                <linearGradient id="aiGradientHeader" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#fb923c;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#f97316;stop-opacity:1" />
                </linearGradient>
              </defs>
              
              <!-- Micrófono principal -->
              <g transform="translate(60,60)">
                <rect x="-8" y="-25" width="16" height="30" rx="8" fill="url(#micGradientHeader)" stroke="#e2e8f0" stroke-width="1"/>
                <rect x="-12" y="8" width="24" height="4" rx="2" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
                <rect x="-6" y="12" width="12" height="8" rx="1" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
                <circle cx="0" cy="-15" r="2" fill="#64748b" opacity="0.6"/>
                <rect x="-6" y="-5" width="12" height="1" fill="#64748b" opacity="0.4"/>
                <rect x="-6" y="0" width="12" height="1" fill="#64748b" opacity="0.4"/>
              </g>
              
              <!-- Símbolo AI -->
              <g transform="translate(85,35)">
                <polygon points="0,-6 5,-3 5,3 0,6 -5,3 -5,-3" fill="url(#aiGradientHeader)" stroke="#ffffff" stroke-width="0.5">
                  <animateTransform attributeName="transform" type="rotate" values="0;360" dur="8s" repeatCount="indefinite"/>
                </polygon>
                <text x="0" y="1" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="4" font-weight="bold">AI</text>
              </g>
              
              <!-- Ondas simplificadas -->
              <g opacity="1">
                <path d="M 85 45 Q 95 60 85 75" stroke="url(#waveGradientHeader)" stroke-width="3" fill="none" stroke-linecap="round">
                  <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/>
                </path>
                <path d="M 90 40 Q 105 60 90 80" stroke="url(#waveGradientHeader)" stroke-width="2" fill="none" stroke-linecap="round">
                  <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" begin="0.5s" repeatCount="indefinite"/>
                </path>
              </g>
            </svg>
          </div>
          <div class="brand-text">
            <div class="brand-name">Recap<span class="brand-ai">AI</span></div>
            <div class="brand-tagline">Meeting Intelligence Platform</div>
          </div>
        </div>

        <!-- Spacer para centrar -->
        <q-space />

        <!-- Sección de usuario -->
        <div class="user-section">
          <!-- Indicador de estado -->
          <q-chip
            outline
            class="status-chip"
            icon="circle"
            color="positive"
            text-color="white"
            size="sm"
          >
            Online
          </q-chip>

          <!-- Info del usuario -->
          <div class="user-info">
            <q-avatar
              size="32px"
              color="secondary"
              text-color="white"
              class="user-avatar"
            >
              {{ userInitials }}
            </q-avatar>
            <div class="user-details">
              <div class="user-name">{{ userName }}</div>
              <div class="user-email">{{ user.email }}</div>
            </div>
          </div>

          <!-- Menú de usuario -->
          <!-- <q-btn-dropdown
            flat
            dense
            icon="more_vert"
            class="user-menu-btn"
            dropdown-icon="none"
          >
            <q-list class="user-menu">
              <q-item clickable v-close-popup>
                <q-item-section avatar>
                  <q-icon name="account_circle" />
                </q-item-section>
                <q-item-section>Perfil</q-item-section>
              </q-item>

              <q-item clickable v-close-popup>
                <q-item-section avatar>
                  <q-icon name="settings" />
                </q-item-section>
                <q-item-section>Configuración</q-item-section>
              </q-item>

              <q-separator />
            </q-list>
          </q-btn-dropdown> -->
          <div class="q-gutter-lg">
            <q-btn
              @click="closeSession()"
              flat
              round
              dense
              icon="fas fa-sign-out-alt"
            />
          </div>
        </div>
      </q-toolbar>
    </q-header>

    <!-- Contenido principal -->
    <q-page-container class="main-content">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useUserStore } from "../stores/User";
import { useGeneralStore } from "src/stores/General";
//@ts-ignore
import mixin from "../mixins/mixin";
import { useRouter } from "vue-router";
import { onBeforeMount, computed } from "vue";

const router = useRouter();
const { showLoading, hideLoading, showNoty } = mixin();
const user = useUserStore();
const general = useGeneralStore();

// Computed properties para la info del usuario
const userInitials = computed(() => {
  const email = user.email || "";
  return email.substring(0, 2).toUpperCase();
});

const userName = computed(() => {
  const email = user.email || "";
  return email.split("@")[0];
});

onBeforeMount(() => {
  // initSocketConnection();
});

const closeSession = async () => {
  showLoading("Cerrando sesión...");
  await user.logOut();
  hideLoading();
  router.push("/login");
};
</script>

<style scoped>
/* Header principal */
.header-gradient {
  background: linear-gradient(135deg, #113359 0%, #1a4470 50%, #235587 100%);
  box-shadow: 0 4px 20px rgba(17, 51, 89, 0.15);
}

.toolbar-container {
  padding: 0 24px;
  min-height: 70px;
}

/* Sección de marca */
.brand-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-logo-svg {
  border-radius: 8px;
  padding: 4px;
  transition: transform 0.3s ease;
}

.brand-logo-svg:hover {
  transform: scale(1.05);
}

.brand-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.brand-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  line-height: 1;
  letter-spacing: -0.02em;
}

.brand-ai {
  color: #FF6B35;
  background: linear-gradient(135deg, #FF6B35 0%, #9C27B0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-tagline {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 400;
  line-height: 1;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

/* Sección de usuario */
.user-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-chip {
  border: 1px solid rgba(76, 175, 80, 0.5);
}

.status-chip :deep(.q-chip__icon) {
  color: #4caf50;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.user-avatar {
  font-size: 0.875rem;
  font-weight: 600;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  line-height: 1;
  text-transform: capitalize;
}

.user-email {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1;
}

.user-menu-btn {
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;
}

.user-menu-btn:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

/* Menú desplegable */
.user-menu {
  min-width: 200px;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.user-menu .q-item {
  padding: 12px 16px;
  transition: all 0.2s ease;
}

.user-menu .q-item:hover {
  background: rgba(17, 51, 89, 0.05);
}

.logout-item {
  color: #ef4444;
}

.logout-item:hover {
  background: rgba(239, 68, 68, 0.05);
}

/* Contenido principal */
.main-content {
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: calc(100vh - 70px);
}

/* Responsive */
@media (max-width: 768px) {
  .toolbar-container {
    padding: 0 16px;
    min-height: 60px;
  }

  .brand-tagline {
    display: none;
  }

  .user-info {
    padding: 6px 12px;
  }

  .user-details {
    display: none;
  }

  .status-chip {
    display: none;
  }
}

@media (max-width: 480px) {
  .brand-name {
    font-size: 1.25rem;
  }

  .user-info {
    background: transparent;
    padding: 4px;
  }
}
</style>
