<template>
  <div class="upload-section">
    <q-file
      v-model="selectedFile"
      accept=".mp3,.webm,.wav,.m4a,.ogg,.flac,.mp4,.mov,.avi,.mkv"
      max-file-size="2147483648"
      @update:model-value="handleFileSelect"
      @rejected="onRejected"
      outlined
      :loading="uploading"
      :disable="uploading"
      class="upload-file"
      label="Upload Meeting"
      :hint="uploading ? 'Uploading...' : 'Click to select audio/video file'"
    >
      <template v-slot:prepend>
        <q-icon name="upload_file" />
      </template>
    </q-file>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { uploadData } from "@aws-amplify/storage";
//@ts-ignore
import { useQuasar } from "quasar";
import { useRecordingSummaryStore } from "../stores/RecordingSumary";
import { useUserStore } from "../stores/User";

const $q = useQuasar();
const recordingStore = useRecordingSummaryStore();
const userStore = useUserStore();

const uploading = ref(false);
const selectedFile = ref<File | null>(null);

const onRejected = (rejectedEntries: any[]) => {
  rejectedEntries.forEach((entry) => {
    if (entry.failedPropValidation === "max-file-size") {
      $q.notify({
        type: "negative",
        message: "El archivo es muy grande. Máximo 2GB.",
      });
    } else if (entry.failedPropValidation === "accept") {
      $q.notify({
        type: "negative",
        message: "Formato no soportado.",
      });
    }
  });
};

const handleFileSelect = async (file: File | null) => {
  if (!file) return;

  uploading.value = true;

  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `upload-${timestamp}-${file.name}`;

    const path = `users-recordings/${userStore.userId}/${new Date().getFullYear()}/${
      new Date().getMonth() + 1
    }/${fileName}`;

    await uploadData({
      path,
      data: file,
      options: {
        contentType: file.type,
      },
    }).result;

    $q.notify({
      type: "positive",
      message: "Archivo cargado exitosamente. Procesando...",
    });

    await recordingStore.getRecordingSummaries();
    selectedFile.value = null;
  } catch (error) {
    console.error("Upload error:", error);
    $q.notify({
      type: "negative",
      message: "Error al cargar el archivo",
    });
  } finally {
    uploading.value = false;
  }
};
</script>

<style scoped>
.upload-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  position: relative;
}

.upload-file {
  min-width: 250px;
}

.upload-file :deep(.q-field__control) {
  border-radius: 12px;
  background: #1976d2;
  border: none;
  min-height: 56px;
  cursor: pointer;
}

.upload-file :deep(.q-field__control):before {
  border: none;
}

.upload-file :deep(.q-field__control):after {
  border: none;
}

.upload-file :deep(.q-field__native) {
  color: white;
  font-weight: 600;
  font-size: 16px;
  text-align: center;
}

.upload-file :deep(.q-field__label) {
  color: white;
  font-weight: 600;
  font-size: 16px;
  transform: translateY(-50%) scale(1) !important;
  top: 50% !important;
}

.upload-file :deep(.q-field__prepend) {
  color: white;
}

.upload-file:hover :deep(.q-field__control) {
  background: #1565c0;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(25, 118, 210, 0.3);
}

.upload-file:active :deep(.q-field__control) {
  transform: translateY(0);
}
</style>
