<template>
  <q-layout>
    <q-page-sticky position="bottom" :offset="[20, 20]">
      <div
        @click="startStopAudioRecording()"
        v-if="!general.$state.waitingResponse"
        class="column justify-center items-center"
      >
        <q-chip
          v-if="!general.$state.isRecording"
          icon="fa-solid fa-play"
          color="primary"
          text-color="white"
          size="lg"
          >Start recording</q-chip
        >
        <q-spinner-bars
          v-if="general.$state.isRecording"
          color="primary"
          size="3em"
        /><q-chip
          v-if="general.$state.isRecording"
          icon="fa-solid fa-stop"
          color="primary"
          text-color="white"
          size="lg"
          >Stop recording</q-chip
        >
      </div>
      <div
        v-if="general.$state.waitingResponse"
        class="column justify-center items-center"
      >
        <q-spinner-hourglass color="primary" size="5em" />
        <p class="text-white">Waiting for a response...</p>
      </div>
    </q-page-sticky>
  </q-layout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useGeneralStore } from "src/stores/General";
// import { GUI } from "lil-gui";

const general = useGeneralStore();
import mixin from "../mixins/mixin";

const { showNoty } = mixin();

const startStopAudioRecording = () => {
  if (general.$state.isRecording) {
    general.stopAudioRecording();
  } else {
    general.startAudioRecording();
  }
};

const endSessionAgent = () => {
  general.sendMessageWS({
    action: "endSession",
    message: "End session agent",
  });
  showNoty("success", "The conversation history was removed.");
};

const threeContainer = ref(null);
let scene,
  camera,
  renderer,
  controls,
  ambientLight,
  directionalLight,
  mixer,
  clock,
  model;

defineOptions({
  name: "IndexPage",
});
</script>

<style scoped></style>
