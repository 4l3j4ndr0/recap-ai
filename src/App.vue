<template>
  <router-view />
</template>

<script setup lang="ts">
//@ts-ignore
window.global = window;
window.process = {
  //@ts-ignore
  env: { DEBUG: undefined },
};
var exports = {};
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../amplify/data/resource";
//@ts-ignore
import outputs from "../amplify_outputs.json";
Amplify.configure(outputs);
const existingConfig = Amplify.getConfig();

Amplify.configure({
  ...existingConfig,
});
// Polyfill for 'global' object
//@ts-ignore
window.global = window;
window.process = {
  //@ts-ignore
  env: { DEBUG: undefined },
};
var exports = {};
import { onBeforeMount, watch } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "./stores/User";
import { useGeneralStore } from "./stores/General";
import { Hub } from "aws-amplify/utils";
//@ts-ignore
import mixin from "./mixins/mixin";
const user = useUserStore();
const general = useGeneralStore();
// general.setWebsocketEndpoint(outputs.custom.WebSocketApiEndpoint);
const router = useRouter();
const { hideLoading } = mixin();

watch(user, (val) => {
  if (val.$state.token) {
    hideLoading();
    router.push("/");
  }
});

const client = generateClient<Schema>();

onBeforeMount(async () => {
  const sub = client.models.RecordingSummary.onCreate().subscribe({
    next: (data) => console.log("New Data::::", data),
    error: (error) => console.warn(error),
  });

  Hub.listen("auth", ({ payload }) => {
    switch (payload.event) {
      case "signedIn":
        console.log("user have been signedIn successfully.");
        user.currentSession();
        break;
      case "signedOut":
        console.log("user have been signedOut successfully.");
        router.push("/login");
        break;
      case "tokenRefresh":
        console.log("auth tokens have been refreshed.");
        user.currentSession();
        break;
      case "tokenRefresh_failure":
        console.log("failure while refreshing auth tokens.");
        break;
      case "signInWithRedirect":
        console.log("signInWithRedirect API has successfully been resolved.");
        break;
      case "signInWithRedirect_failure":
        console.log("failure while trying to resolve signInWithRedirect API.");
        break;
      case "customOAuthState":
        console.log("custom state returned from CognitoHosted UI");
        break;
    }
  });
});
</script>
