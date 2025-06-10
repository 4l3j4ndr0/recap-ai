<template>
  <div class="recording-summary-container">
    <!-- Header con estadísticas -->
    <!-- <div class="summary-header q-mb-lg items-center">
      <div class="row q-gutter-md">
        <q-card class="stat-card col-12 col-sm-6 col-md-3">
          <q-card-section class="text-center">
            <q-icon name="mic" size="2rem" color="primary" />
            <div class="text-h6 q-mt-sm">{{ totalRecordings }}</div>
            <div class="text-caption text-grey-6">Total Recordings</div>
          </q-card-section>
        </q-card>

        <q-card class="stat-card col-12 col-sm-6 col-md-3">
          <q-card-section class="text-center">
            <q-icon name="schedule" size="2rem" color="orange" />
            <div class="text-h6 q-mt-sm">{{ processingCount }}</div>
            <div class="text-caption text-grey-6">Processing</div>
          </q-card-section>
        </q-card>

        <q-card class="stat-card col-12 col-sm-6 col-md-3">
          <q-card-section class="text-center">
            <q-icon name="check_circle" size="2rem" color="positive" />
            <div class="text-h6 q-mt-sm">{{ completedCount }}</div>
            <div class="text-caption text-grey-6">Completed</div>
          </q-card-section>
        </q-card>

        <q-card class="stat-card col-12 col-sm-6 col-md-3">
          <q-card-section class="text-center">
            <q-icon name="favorite" size="2rem" color="pink" />
            <div class="text-h6 q-mt-sm">{{ favoritesCount }}</div>
            <div class="text-caption text-grey-6">Favorites</div>
          </q-card-section>
        </q-card>
      </div>
    </div> -->

    <!-- Controles de filtro y búsqueda -->
    <div class="controls-section q-mb-lg">
      <div
        class="q-gutter-md items-center"
        :class="{
          column: $q.screen.xxs,
          row: $q.screen.gt.sm,
        }"
      >
        <div class="col-12 col-sm-4 col-md-4">
          <q-input
            v-model="searchQuery"
            outlined
            dense
            placeholder="Search recordings..."
            debounce="300"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
            <template v-slot:append>
              <q-icon
                v-if="searchQuery"
                name="clear"
                class="cursor-pointer"
                @click="searchQuery = ''"
              />
            </template>
          </q-input>
        </div>

        <div class="col-12 col-sm-3 col-md-2">
          <q-select
            v-model="statusFilter"
            outlined
            dense
            :options="statusOptions"
            label="Status"
            emit-value
            map-options
          />
        </div>

        <div class="col-12 col-sm-3 col-md-2">
          <q-select
            v-model="sortBy"
            outlined
            dense
            :options="sortOptions"
            label="Sort by"
            emit-value
            map-options
          />
        </div>

        <div class="col-auto">
          <q-btn
            @click="refreshRecordings"
            :loading="isLoading"
            color="primary"
            icon="refresh"
            dense
            round
          >
            <q-tooltip>Refresh</q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>

    <!-- Lista de recordings -->

    <div class="recordings-grid">
      <q-card
        v-for="recording in filteredRecordings"
        :key="recording.id"
        class="recording-card q-mb-md"
        :class="{ 'favorite-card': recording.isFavorite }"
      >
        <q-expansion-item class="recording-header">
          <template v-slot:header>
            <q-card-section style="width: -webkit-fill-available">
              <div class="row items-center no-wrap">
                <div class="col">
                  <div class="recording-title">
                    {{
                      recording.summaryTitle ||
                      formatFileName(recording.originalFileName)
                    }}
                  </div>
                  <div class="recording-meta text-caption text-grey-6">
                    {{ formatDate(recording.createdAt) }} •
                    {{ recording.languageCode || "es-ES" }}
                    <span v-if="recording.duration">
                      • {{ recording.duration }}</span
                    >
                  </div>
                </div>

                <div class="col-auto">
                  <q-chip
                    :color="getStatusColor(recording.status)"
                    :icon="getStatusIcon(recording.status)"
                    size="sm"
                    dense
                  >
                    {{ getStatusLabel(recording.status) }}
                  </q-chip>
                </div>
              </div>
            </q-card-section>
          </template>

          <q-card>
            <q-card-section>
              <q-card-section
                v-if="recording.transcriptionText || recording.summaryMarkdown"
              >
                <!-- Transcripción -->
                <div v-if="recording.transcriptionText" class="q-mb-md">
                  <div class="section-title">
                    <q-icon name="transcribe" size="1.2rem" color="primary" />
                    Transcription
                  </div>
                  <div class="transcription-text">
                    {{ recording.transcriptionText.substring(0, 200) }}
                    <span v-if="recording.transcriptionText.length > 200"
                      >...</span
                    >
                  </div>
                </div>

                <!-- Resumen -->
                <div v-if="recording.summaryMarkdown" class="q-mb-md">
                  <div class="section-title">
                    <q-icon name="summarize" size="1.2rem" color="secondary" />
                    Summary
                  </div>
                  <div class="summary-text">
                    <vue-markdown :source="recording.summaryMarkdown" />
                  </div>
                </div>

                <!-- Notas -->
                <div v-if="recording.notes" class="q-mb-md">
                  <div class="section-title">
                    <q-icon name="note" size="1.2rem" color="warning" />
                    Notes
                  </div>
                  <div class="notes-text">{{ recording.notes }}</div>
                </div>
              </q-card-section>

              <q-card-section v-else-if="recording.status === 'FAILED'">
                <div class="error-section">
                  <q-icon name="error" size="1.5rem" color="negative" />
                  <div class="error-text q-ml-sm">
                    <div class="text-negative">Processing failed</div>
                    <div class="text-caption" v-if="recording.errorMessage">
                      {{ recording.errorMessage }}
                    </div>
                  </div>
                </div>
              </q-card-section>

              <q-card-section
                v-else-if="
                  recording.status !== 'COMPLETED' ||
                  recording.status !== 'FAILED'
                "
              >
                <div class="processing-section">
                  <q-linear-progress
                    indeterminate
                    color="primary"
                    class="q-mb-sm"
                  />
                  <div class="text-center text-grey-6">
                    <q-icon name="hourglass_empty" />
                    {{
                      recording.status === "TRANSCRIBING"
                        ? "Processing your recording..."
                        : "Generating AI summary..."
                    }}
                  </div>
                </div>
              </q-card-section>
            </q-card-section>
          </q-card>
        </q-expansion-item>

        <!-- Acciones -->
        <q-card-actions align="right" class="q-pa-md">
          <!-- <q-btn
            @click="toggleFavorite(recording)"
            :color="recording.isFavorite ? 'pink' : 'grey-5'"
            :icon="recording.isFavorite ? 'favorite' : 'favorite_border'"
            flat
            dense
            round
          >
            <q-tooltip>
              {{
                recording.isFavorite
                  ? "Remove from favorites"
                  : "Add to favorites"
              }}
            </q-tooltip>
          </q-btn> -->

          <q-btn
            v-if="recording.transcriptionS3Uri"
            @click="downloadTranscription(recording)"
            color="primary"
            icon="download"
            flat
            dense
            round
          >
            <q-tooltip>Download transcription</q-tooltip>
          </q-btn>

          <q-btn
            @click="!audioPlayer ? playAudio(recording) : stopAudio()"
            :color="!audioPlayer ? 'positive' : 'negative'"
            :icon="audioPlayer ? 'stop' : 'play_arrow'"
            flat
            dense
            round
            :loading="playingId === recording.id"
          >
            <q-tooltip>{{
              audioPlayer ? "Play audio" : "Stop audio"
            }}</q-tooltip>
          </q-btn>

          <q-btn
            @click="showRecordingDetails(recording)"
            color="info"
            icon="visibility"
            flat
            dense
            round
          >
            <q-tooltip>View details</q-tooltip>
          </q-btn>

          <q-btn
            @click="deleteRecording(recording)"
            color="negative"
            icon="delete"
            flat
            dense
            round
          >
            <q-tooltip>Delete</q-tooltip>
          </q-btn>
        </q-card-actions>
      </q-card>
    </div>

    <!-- Estado vacío -->
    <div
      v-if="!isLoading && filteredRecordings.length === 0"
      class="empty-state"
    >
      <q-icon name="mic_off" size="4rem" color="grey-4" />
      <div class="text-h6 q-mt-md text-grey-6">No recordings found</div>
      <div class="text-body2 text-grey-5 q-mt-sm">
        {{
          searchQuery || statusFilter !== "all"
            ? "Try adjusting your filters"
            : "Start recording to see your summaries here"
        }}
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="loading-state">
      <q-spinner-dots size="3rem" color="primary" />
      <div class="text-body1 q-mt-md">Loading recordings...</div>
    </div>
  </div>
</template>

<script setup>
import VueMarkdown from "vue-markdown-render";
import { ref, computed, onMounted, watch } from "vue";
import { useRecordingSummaryStore } from "../stores/RecordingSumary";
import { useGeneralStore } from "../stores/General";
import { date } from "quasar";
import { useRouter } from "vue-router";
//@ts-ignore
import mixin from "../mixins/mixin";

const { showNoty } = mixin();
const recordingStore = useRecordingSummaryStore();
const generalStore = useGeneralStore();
const router = useRouter();

// Estado reactivo
const isLoading = ref(false);
const searchQuery = ref("");
const statusFilter = ref("all");
const sortBy = ref("newest");
const playingId = ref(null);
const audioPlayer = ref(null);

// Opciones para filtros
const statusOptions = [
  { label: "All", value: "all" },
  { label: "Processing", value: "TRANSCRIBING" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Failed", value: "FAILED" },
];

const sortOptions = [
  { label: "Newest first", value: "newest" },
  { label: "Oldest first", value: "oldest" },
  { label: "Name A-Z", value: "name-asc" },
  { label: "Name Z-A", value: "name-desc" },
];

// Computed properties
const totalRecordings = computed(
  () => recordingStore.recordingSummaries.length,
);

const processingCount = computed(
  () =>
    recordingStore.recordingSummaries.filter((r) => r.status === "TRANSCRIBING")
      .length,
);

const completedCount = computed(
  () =>
    recordingStore.recordingSummaries.filter((r) => r.status === "COMPLETED")
      .length,
);

const favoritesCount = computed(
  () => recordingStore.recordingSummaries.filter((r) => r.isFavorite).length,
);

const filteredRecordings = computed(() => {
  let filtered = recordingStore.recordingSummaries;

  // Filtro por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (recording) =>
        recording.originalFileName?.toLowerCase().includes(query) ||
        recording.transcriptionText?.toLowerCase().includes(query) ||
        recording.summaryMarkdown?.toLowerCase().includes(query) ||
        recording.notes?.toLowerCase().includes(query),
    );
  }

  // Filtro por estado
  if (statusFilter.value !== "all") {
    filtered = filtered.filter(
      (recording) => recording.status === statusFilter.value,
    );
  }

  // Ordenamiento
  filtered = [...filtered].sort((a, b) => {
    switch (sortBy.value) {
      case "newest":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "oldest":
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case "name-asc":
        return (a.originalFileName || "").localeCompare(
          b.originalFileName || "",
        );
      case "name-desc":
        return (b.originalFileName || "").localeCompare(
          a.originalFileName || "",
        );
      default:
        return 0;
    }
  });

  return filtered;
});

// Métodos
const refreshRecordings = async () => {
  isLoading.value = true;
  try {
    const result = await recordingStore.getRecordingSummaries();
    if (result.error) {
      showNoty("error", result.message);
    }
  } catch (error) {
    showNoty("error", "Error loading recordings");
  } finally {
    isLoading.value = false;
  }
};

const formatFileName = (fileName) => {
  if (!fileName) return "Untitled Recording";
  return fileName
    .replace(/recording-|\.webm|\.mp3|\.wav/g, "")
    .replace(/[-_]/g, " ");
};

const formatDate = (dateString) => {
  return date.formatDate(dateString, "MMM DD, YYYY - HH:mm");
};

const getStatusColor = (status) => {
  const colors = {
    TRANSCRIBING: "orange",
    COMPLETED: "positive",
    FAILED: "negative",
  };
  return colors[status] || "grey";
};

const getStatusIcon = (status) => {
  const icons = {
    TRANSCRIBING: "hourglass_empty",
    COMPLETED: "check_circle",
    FAILED: "error",
  };
  return icons[status] || "help";
};

const getStatusLabel = (status) => {
  const labels = {
    TRANSCRIBING: "Processing",
    COMPLETED: "Completed",
    FAILED: "Failed",
  };
  return labels[status] || status;
};

const toggleFavorite = async (recording) => {
  try {
    const result = await recordingStore.updateRecordingSummary(recording.id, {
      isFavorite: !recording.isFavorite,
    });

    if (result.error) {
      showNoty("error", result.message);
    } else {
      showNoty(
        "success",
        recording.isFavorite ? "Removed from favorites" : "Added to favorites",
      );
    }
  } catch (error) {
    showNoty("error", "Error updating favorite status");
  }
};

const downloadTranscription = async (recording) => {
  try {
    // Crear y descargar archivo de transcripción
    const content = recording.transcriptionText || "No transcription available";
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${formatFileName(recording.originalFileName)}-transcription.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNoty("success", "Transcription downloaded");
  } catch (error) {
    showNoty("error", "Error downloading transcription");
  }
};

const playAudio = async (recording) => {
  if (playingId.value === recording.id) {
    // Si ya está reproduciéndose, detener
    playingId.value = null;
    return;
  }

  try {
    playingId.value = recording.id;
    // Aquí puedes implementar la lógica para obtener la URL del audio desde S3
    const audioUrl = await generalStore.getAudioSignedUrl(recording.s3Uri);
    audioPlayer.value = new Audio(audioUrl);
    audioPlayer.value.play();

    // Por ahora, simular reproducción
    setTimeout(() => {
      playingId.value = null;
    }, 3000);

    showNoty("info", "Playing audio...");
  } catch (error) {
    console.log("error:::::", error);
    playingId.value = null;
    showNoty("error", "Error playing audio");
  }
};

const stopAudio = () => {
  if (audioPlayer.value) {
    audioPlayer.value.pause();
    audioPlayer.value = null;
    playingId.value = null;
  }
};

const showRecordingDetails = (recording) => {
  router.push(`/recording/${recording.id}`);
};

const deleteRecording = async (recording) => {
  try {
    const confirmed = await new Promise((resolve) => {
      // Usar Quasar Dialog
      import("quasar").then(({ Dialog }) => {
        Dialog.create({
          title: "Delete Recording",
          message: `Are you sure you want to delete "${formatFileName(recording.originalFileName)}"?`,
          cancel: true,
          persistent: true,
        })
          .onOk(() => resolve(true))
          .onCancel(() => resolve(false));
      });
    });

    if (confirmed) {
      const result = await recordingStore.deleteRecordingSummary(recording.id);
      if (result.error) {
        showNoty("error", result.message);
      } else {
        showNoty("success", "Recording deleted successfully");
      }
    }
  } catch (error) {
    showNoty("error", "Error deleting recording");
  }
};

// Lifecycle
onMounted(() => {
  refreshRecordings();
});

// Watch para refrescar automáticamente
watch(
  () => recordingStore.recordingSummaries,
  (newVal, oldVal) => {
    if (newVal.length !== oldVal?.length) {
      // Scroll suave hacia arriba cuando hay nuevos recordings
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  },
);
</script>

<style scoped>
.recording-summary-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.controls-section {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.recordings-grid {
  display: grid;
  gap: 1rem;
}

.recording-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.recording-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.favorite-card {
  border-left: 4px solid #e91e63;
  background: linear-gradient(135deg, #ffeef1 0%, #ffffff 100%);
}

.recording-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.recording-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.recording-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #34495e;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.transcription-text {
  background: #f8f9fa;
  padding: 0.75rem;
  border-radius: 8px;
  border-left: 3px solid #3498db;
  font-size: 0.9rem;
  line-height: 1.5;
}

.summary-text :deep(h1) {
  font-size: 1.3rem;
  font-weight: 600;
  margin: 8px 0 4px 0;
  color: var(--q-primary);
}

.summary-text :deep(h2) {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 6px 0 3px 0;
  color: var(--q-secondary);
}

.summary-text :deep(h3) {
  font-size: 1rem;
  font-weight: 500;
  margin: 4px 0 2px 0;
  color: var(--q-dark);
}

.summary-text :deep(h4),
.summary-text :deep(h5),
.summary-text :deep(h6) {
  font-size: 0.95rem;
  font-weight: 500;
  margin: 3px 0 1px 0;
  color: var(--q-grey-8);
}

.summary-text :deep(p) {
  margin-bottom: 4px;
  line-height: 1.3;
}

.summary-text :deep(ul),
.summary-text :deep(ol) {
  margin: 2px 0 4px 0;
  padding-left: 16px;
}

.summary-text :deep(li) {
  margin-bottom: 1px;
  line-height: 1.2;
}

.summary-text :deep(h1 + p),
.summary-text :deep(h2 + p),
.summary-text :deep(h3 + p) {
  margin-top: 0;
}

.summary-text :deep(p + h1),
.summary-text :deep(p + h2),
.summary-text :deep(p + h3) {
  margin-top: 8px;
}
.notes-text {
  background: #f0f8ff;
  padding: 0.75rem;
  border-radius: 8px;
  border-left: 3px solid #9b59b6;
  font-size: 0.9rem;
  line-height: 1.5;
}

.error-section {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: #fff5f5;
  border-radius: 8px;
  border-left: 3px solid #e74c3c;
}

.error-text {
  flex: 1;
}

.processing-section {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: center;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  background: #fafafa;
  border-radius: 12px;
  margin-top: 2rem;
}

.loading-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #666;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .recording-summary-container {
    padding: 0.5rem;
  }

  .controls-section {
    padding: 0.75rem;
  }

  .recording-title {
    font-size: 1rem;
  }
}

/* Dark mode support */
.body--dark .stat-card {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
}

.body--dark .controls-section {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.body--dark .recording-card {
  background: #2d3748;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.body--dark .recording-header {
  background: #4a5568;
}

.body--dark .transcription-text {
  background: #2d3748;
  color: #e2e8f0;
}

.body--dark .summary-text {
  background: #2d3748;
  color: #e2e8f0;
}

.body--dark .notes-text {
  background: #2d3748;
  color: #e2e8f0;
}
</style>
