<template>
  <q-layout view="hHh Lpr fFf" v-if="user.token">
    <!-- Header mejorado -->
    <q-header elevated class="header-gradient">
      <q-toolbar class="toolbar-container">
        <!-- Logo y marca -->
        <div class="brand-section">
          <q-avatar square size="40px" class="brand-logo">
            <img src="icon.png" alt="Recap AI Logo" />
          </q-avatar>
          <div class="brand-text">
            <div class="brand-name">Recap AI</div>
            <div class="brand-tagline">Smart Meeting Insights</div>
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

.brand-logo {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
}

.brand-tagline {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 400;
  line-height: 1;
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
