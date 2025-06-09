<template>
  <div class="detail-summary-page" v-if="recordingSummary.recordingSummary">
    <!-- Header con navegación -->
    <div class="page-header q-pa-lg">
      <div class="header-content">
        <q-btn
          @click="goBack"
          icon="arrow_back"
          flat
          round
          color="primary"
          size="md"
        >
          <q-tooltip>Go back</q-tooltip>
        </q-btn>

        <div class="header-info">
          <h4 class="q-ma-none text-weight-bold">
            {{
              recordingSummary.recordingSummary.summaryTitle
                ? recordingSummary.recordingSummary.summaryTitle
                : "Recording Details"
            }}
          </h4>
          <p class="text-grey-6 q-ma-none">
            {{ formatDate(recordingSummary.recordingSummary?.createdAt) }}
          </p>
        </div>

        <div class="header-actions">
          <q-btn
            @click="shareRecording"
            icon="share"
            color="primary"
            flat
            round
          >
            <q-tooltip>Share recording</q-tooltip>
          </q-btn>
          <q-btn
            @click="deleteRecording(recordingSummary.recordingSummary)"
            color="negative"
            icon="delete"
            flat
            dense
            round
          >
            <q-tooltip>Delete</q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="main-content q-pa-lg">
      <div class="content-grid">
        <!-- Panel izquierdo - Información y controles -->
        <div class="left-panel">
          <!-- Reproductor de audio -->
          <q-card class="audio-player-card q-mb-lg" elevated>
            <q-card-section class="text-center">
              <div class="audio-title q-mb-md">
                <q-icon
                  name="mic"
                  size="24px"
                  color="primary"
                  class="q-mr-sm"
                />
                <span class="text-h6">Audio Recording</span>
              </div>

              <!-- Controles principales -->
              <div class="main-controls q-mb-md">
                <q-btn
                  @click="playAudio"
                  :icon="isPlaying ? 'pause_circle' : 'play_circle'"
                  size="xl"
                  color="primary"
                  flat
                  :loading="isLoading"
                >
                  <q-tooltip>{{ isPlaying ? "Pause" : "Play" }}</q-tooltip>
                </q-btn>
              </div>

              <!-- Información del audio -->
              <div class="audio-info q-mb-md">
                <div class="time-display">
                  <span class="current-time">{{
                    formatTime(currentTime)
                  }}</span>
                  <span class="separator">/</span>
                  <span class="total-time">{{ formatTime(duration) }}</span>
                </div>
              </div>

              <!-- Barra de progreso -->
              <q-linear-progress
                :value="progress / 100"
                color="primary"
                size="8px"
                class="audio-progress cursor-pointer"
                @click="seekAudio"
              />

              <!-- Controles secundarios -->
              <div class="secondary-controls q-mt-md">
                <q-btn
                  @click="rewind"
                  icon="replay_10"
                  flat
                  dense
                  color="grey-7"
                />
                <q-btn @click="stop" icon="stop" flat dense color="negative" />
                <q-btn
                  @click="forward"
                  icon="forward_10"
                  flat
                  dense
                  color="grey-7"
                />
              </div>
            </q-card-section>
          </q-card>

          <!-- Información del recording -->
          <q-card class="info-card q-mb-lg" elevated>
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="info" class="q-mr-sm" />
                Recording Information
              </div>

              <div class="info-grid">
                <div class="info-item">
                  <span class="label">Status:</span>
                  <q-chip
                    :color="
                      getStatusColor(recordingSummary.recordingSummary?.status)
                    "
                    text-color="white"
                    size="sm"
                  >
                    {{ recordingSummary.recordingSummary?.status || "Unknown" }}
                  </q-chip>
                </div>

                <div class="info-item">
                  <span class="label">File Size:</span>
                  <span class="value">{{
                    formatFileSize(recordingSummary.recordingSummary?.fileSize)
                  }}</span>
                </div>

                <div class="info-item">
                  <span class="label">Created:</span>
                  <span class="value">{{
                    formatDate(recordingSummary.recordingSummary?.createdAt)
                  }}</span>
                </div>

                <div class="info-item">
                  <span class="label">Language:</span>
                  <span class="value">{{
                    recordingSummary.recordingSummary?.languageCode ||
                    "Auto-detected"
                  }}</span>
                </div>

                <!-- <div class="info-item">
                  <span class="label">Quality:</span>
                  <q-rating
                    v-model="recording.quality"
                    readonly
                    size="sm"
                    color="amber"
                  />
                </div> -->
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Panel derecho - Summary y transcripción -->
        <div class="right-panel">
          <!-- Tabs para el contenido -->
          <q-card class="content-card" elevated>
            <q-tabs
              v-model="activeTab"
              dense
              class="text-grey"
              active-color="primary"
              indicator-color="primary"
              align="justify"
            >
              <q-tab name="summary" icon="summarize" label="AI Summary" />
              <q-tab name="transcript" icon="text_snippet" label="Transcript" />
              <q-tab name="diagrams" icon="account_tree" label="Diagrams" />
            </q-tabs>

            <q-separator />

            <q-tab-panels v-model="activeTab" animated>
              <!-- Panel de Summary -->
              <q-tab-panel name="summary" class="summary-panel">
                <!-- <div class="panel-header q-mb-lg">
                  <h5 class="q-ma-none">AI Summary</h5>
                  <q-btn
                    @click="regenerateSummary"
                    icon="refresh"
                    flat
                    dense
                    color="primary"
                  >
                    <q-tooltip>Regenerate summary</q-tooltip>
                  </q-btn>
                </div> -->

                <div
                  v-if="recordingSummary.recordingSummary?.summaryMarkdown"
                  class="summary-text"
                >
                  <vue-markdown
                    :source="recordingSummary.recordingSummary?.summaryMarkdown"
                    class="markdown-content"
                  />
                </div>

                <div v-else class="no-content">
                  <q-icon name="summarize" size="48px" color="grey-5" />
                  <p class="text-grey-6">No summary available yet</p>
                </div>
              </q-tab-panel>

              <!-- Panel de Transcript -->
              <q-tab-panel name="transcript" class="transcript-panel">
                <div class="panel-header q-mb-lg">
                  <h5 class="q-ma-none">Transcription</h5>
                  <div>
                    <q-btn
                      @click="copyTranscript()"
                      icon="content_copy"
                      flat
                      dense
                      color="primary"
                    >
                      <q-tooltip>Copy transcript</q-tooltip>
                    </q-btn>
                    <q-btn
                      @click="downloadTranscript()"
                      icon="download"
                      flat
                      dense
                      color="primary"
                    >
                      <q-tooltip>Download transcript</q-tooltip>
                    </q-btn>
                  </div>
                </div>

                <div
                  v-if="recordingSummary.recordingSummary?.transcriptionText"
                  class="transcript-content"
                >
                  <div class="transcript-text">
                    {{ recordingSummary.recordingSummary?.transcriptionText }}
                  </div>
                </div>

                <div v-else class="no-content">
                  <q-icon name="text_snippet" size="48px" color="grey-5" />
                  <p class="text-grey-6">Transcription not available</p>
                </div>
              </q-tab-panel>

              <!-- Panel de Diagrams -->
              <q-tab-panel name="diagrams" class="diagrams-panel">
                <!-- Iteración de diagramas -->
                <div
                  v-if="recordingSummary.recordingSummary?.mermaidDiagram"
                  class="diagrams-content"
                >
                  <div
                    v-for="(diagram, index) in JSON.parse(
                      recordingSummary.recordingSummary?.mermaidDiagram,
                    ) || []"
                    :key="`diagram-${index}`"
                    class="diagram-container q-mb-xl"
                  >
                    <q-card class="diagram-card" elevated>
                      <q-card-section class="diagram-header">
                        <div class="diagram-info">
                          <h6 class="q-ma-none text-weight-medium">
                            <q-icon
                              :name="getDiagramIcon(diagram.type)"
                              class="q-mr-sm"
                            />
                            {{ diagram.title || `Diagram ${index + 1}` }}
                          </h6>
                        </div>
                      </q-card-section>
                      <q-separator />
                      <q-card-section class="diagram-content">
                        <div class="mermaid-wrapper">
                          <vue-mermaid-string
                            :value="diagram.diagram"
                            :key="`mermaid-${index}`"
                            class="mermaid-diagram"
                          />
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>

                <div v-else class="no-content">
                  <q-icon name="account_tree" size="48px" color="grey-5" />
                  <p class="text-grey-6">No diagrams available</p>
                </div>
              </q-tab-panel>
            </q-tab-panels>
          </q-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import VueMarkdown from "vue-markdown-render";
import VueMermaidString from "vue-mermaid-string";
import { ref, onUnmounted, onBeforeMount, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
//@ts-ignore
import mixin from "../mixins/mixin";
import { useRecordingSummaryStore } from "../../src/stores/RecordingSumary";
import { useGeneralStore } from "../../src/stores/General";
const { showNoty } = mixin();
const router = useRouter();
const route = useRoute();

// Props
const props = defineProps({
  recordingId: {
    type: String,
    required: true,
  },
});

// Estado reactivo
const recording = ref(null);
const activeTab = ref("summary");
const isPlaying = ref(false);
const isLoading = ref(false);
const currentAudio = ref(null);
const currentTime = ref(0);
const duration = ref(0);
const progress = ref(0);
const diagrams = ref([]);
const generalStore = useGeneralStore();
const recordingSummary = useRecordingSummaryStore();

// Computed
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatFileSize = (bytes) => {
  if (!bytes) return "N/A";
  const sizes = ["Bytes", "KB", "MB", "GB"];
  if (bytes === 0) return "0 Byte";
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
};

const getStatusColor = (status) => {
  const colors = {
    COMPLETED: "positive",
    TRANSCRIBING: "warning",
    FAILED: "negative",
    GENERATING_SUMMARY: "info",
  };
  return colors[status] || "grey";
};

// Métodos
const goBack = () => {
  router.go(-1);
};

const loadRecording = async () => {
  try {
    isLoading.value = true;
    const recordingId = props.recordingId || route.params.recordingId;
    await recordingSummary.getRecordSummaryById(recordingId);
  } catch (error) {
    console.error("Error loading recording:", error);
    showNoty("error", "Failed to load recording details");
  } finally {
    isLoading.value = false;
  }
};

const playAudio = async () => {
  try {
    if (!currentAudio.value) {
      const audioUrl = await generalStore.getAudioSignedUrl(
        recordingSummary.recordingSummary?.s3Uri,
      );
      currentAudio.value = new Audio(audioUrl);
      currentAudio.value.addEventListener("loadedmetadata", () => {
        duration.value = currentAudio.value.duration;
      });
      currentAudio.value.addEventListener("timeupdate", () => {
        currentTime.value = currentAudio.value.currentTime;
        progress.value = (currentTime.value / duration.value) * 100;
      });
      currentAudio.value.addEventListener("ended", () => {
        isPlaying.value = false;
      });
    }

    if (isPlaying.value) {
      currentAudio.value.pause();
      isPlaying.value = false;
    } else {
      await currentAudio.value.play();
      isPlaying.value = true;
    }
  } catch (error) {
    console.error("Error playing audio:", error);
    showNoty("error", "Failed to play audio");
  }
};

const stop = () => {
  if (currentAudio.value) {
    currentAudio.value.pause();
    currentAudio.value.currentTime = 0;
    isPlaying.value = false;
    currentTime.value = 0;
    progress.value = 0;
  }
};

const rewind = () => {
  if (currentAudio.value) {
    currentAudio.value.currentTime = Math.max(
      0,
      currentAudio.value.currentTime - 10,
    );
  }
};

const forward = () => {
  if (currentAudio.value) {
    currentAudio.value.currentTime = Math.min(
      duration.value,
      currentAudio.value.currentTime + 10,
    );
  }
};

const seekAudio = (event) => {
  if (currentAudio.value && duration.value) {
    const rect = event.target.getBoundingClientRect();
    const percentage = (event.clientX - rect.left) / rect.width;
    currentAudio.value.currentTime = percentage * duration.value;
  }
};

const shareRecording = () => {
  if (navigator.share) {
    navigator.share({
      title: "Audio Recording",
      text: "Check out this audio recording",
      url: window.location.href,
    });
  } else {
    navigator.clipboard.writeText(window.location.href);
    showNoty("success", "Link copied to clipboard");
  }
};

const downloadTranscript = () => {
  if (recordingSummary.recordingSummary?.transcriptionText) {
    const blob = new Blob(
      [recordingSummary.recordingSummary?.transcriptionText],
      { type: "text/plain" },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `transcript-${recordingSummary.recordingSummary?.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

const copyTranscript = async () => {
  if (recordingSummary.recordingSummary?.transcriptionText) {
    try {
      await navigator.clipboard.writeText(
        recordingSummary.recordingSummary?.transcriptionText,
      );
      showNoty("success", "Transcript copied to clipboard");
    } catch (error) {
      showNoty("error", "Failed to copy transcript");
    }
  }
};

const deleteRecording = async (recording) => {
  try {
    const confirmed = await new Promise((resolve) => {
      // Usar Quasar Dialog
      import("quasar").then(({ Dialog }) => {
        Dialog.create({
          title: "Delete Recording",
          message: `Are you sure you want to delete "${recordingSummary.recordingSummary?.originalFileName}"?`,
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

// Método para obtener el ícono según el tipo de diagrama
const getDiagramIcon = (type) => {
  const icons = {
    flowchart: "account_tree",
    timeline: "timeline",
    sequence: "swap_horiz",
    classDiagram: "schema",
    erDiagram: "storage",
    gantt: "event_note",
    pie: "pie_chart",
    mindmap: "hub",
    gitgraph: "merge_type",
    quadrantChart: "grid_4x4",
    sankey: "waterfall_chart",
  };
  return icons[type] || "account_tree";
};

// Manejo de errores de Mermaid
const handleMermaidError = (error) => {
  console.error("Mermaid diagram error:", error);
  showNoty("warning", "Some diagrams may not display correctly");
};

// Lifecycle
onBeforeMount(() => {
  loadRecording();
});

onUnmounted(() => {
  if (currentAudio.value) {
    currentAudio.value.pause();
    currentAudio.value = null;
    recordingSummary.resetRecordingSummary();
  }
});
</script>

<style lang="scss" scoped>
.detail-summary-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.page-header {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1200px;
    margin: 0 auto;
  }

  .header-info {
    flex: 1;
    margin-left: 16px;
  }

  .header-actions {
    display: flex;
    gap: 8px;
  }
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
}

.content-grid {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.audio-player-card {
  .audio-title {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .main-controls {
    .q-btn {
      transform: scale(1);
      transition: transform 0.2s ease;

      &:hover {
        transform: scale(1.05);
      }
    }
  }

  .time-display {
    font-family: "Courier New", monospace;
    font-size: 18px;
    font-weight: bold;
    color: #666;

    .separator {
      margin: 0 8px;
      color: #ccc;
    }
  }

  .audio-progress {
    margin: 16px 0;
    border-radius: 4px;
  }

  .secondary-controls {
    display: flex;
    justify-content: center;
    gap: 16px;
  }
}

.info-card,
.actions-card {
  .info-grid,
  .actions-grid {
    display: grid;
    gap: 16px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  .label {
    font-weight: 500;
    color: #666;
  }

  .value {
    font-weight: 600;
    color: #333;
  }
}

.content-card {
  min-height: 600px;

  .q-tab-panels {
    min-height: 500px;
  }
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 16px;
}

.summary-content {
  .markdown-content {
    line-height: 1.6;

    h2,
    h3 {
      color: #333;
      margin: 24px 0 12px 0;
    }

    p {
      margin: 12px 0;
    }

    ul,
    ol {
      padding-left: 24px;
      margin: 12px 0;
    }
  }
}

.transcript-content {
  .transcript-text {
    background: #f8f9fa;
    padding: 24px;
    border-radius: 8px;
    border-left: 4px solid #007bff;
    line-height: 1.6;
    font-size: 16px;
  }
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.insight-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .insight-content {
    margin-left: 16px;

    .insight-title {
      font-size: 14px;
      color: #666;
      font-weight: 500;
    }

    .insight-value {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      margin-top: 4px;
    }
  }
}

.no-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;

  p {
    margin: 16px 0 24px 0;
    font-size: 16px;
  }
}

// Responsive
@media (max-width: 768px) {
  .page-header {
    .header-content {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }

    .header-actions {
      align-self: flex-end;
    }
  }

  .actions-grid {
    grid-template-columns: 1fr !important;
  }

  .insights-grid {
    grid-template-columns: 1fr !important;
  }
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
.diagrams-panel {
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .diagrams-content {
    .diagram-container {
      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .diagram-card {
    border-radius: 12px;

    .diagram-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;

      .diagram-info {
        flex: 1;

        h6 {
          display: flex;
          align-items: center;
          color: #333;
        }
      }

      .diagram-actions {
        display: flex;
        gap: 4px;
      }
    }

    .diagram-content {
      padding: 24px;
      background: #fafafa;

      .mermaid-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 200px;

        .mermaid-diagram {
          max-width: 100%;
          overflow-x: auto;
        }
      }
    }
  }
}

.no-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  text-align: center;
}
</style>
