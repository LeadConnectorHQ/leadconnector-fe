<script setup lang="ts">
import { reactive, onMounted, provide, ref } from "vue";
import Header from "./layouts/header/Header.vue";
import FullPageLoader from "./pages/FullPageLoader.vue";
import AuthWall from "./pages/AuthWall.vue";

import BackendService from "./services";
import { LC_BASE_URL } from "./constants";
import { UIContentWrap } from "@/ui";
import AuthSuccess from "./pages/AuthSuccess.vue";

const localState = reactive({
  initialLoading: true,
  isConnectionStatusActive: false,
  connectionMethod: "" as string,
  lcOptions: {} as Object,
});

const lcAdminSettings = {
  ...(window as any).lc_admin_settings,
  baseURL: LC_BASE_URL,
};
provide("lcAdminSettings", lcAdminSettings);
const urlParamsCode = new URLSearchParams(window.location.search).get(
  "lc_code",
);

async function initChecks() {
  localState.initialLoading = true;
  localState.isConnectionStatusActive = false;

  const respond = await BackendService.Common.GetLCOptions();
  localState.lcOptions = respond;

  const urlParamsCodeRefreshed = new URLSearchParams(
    window.location.search,
  ).get("lc_code");

  if (!(urlParamsCodeRefreshed && urlParamsCodeRefreshed?.length == 40)) {
    const baseChecks = await BackendService.ValidateAuthToken();

    if (baseChecks.is_connection_status_active) {
      localState.isConnectionStatusActive = true;
      localState.connectionMethod = baseChecks.connection_method;
    }
  }

  localState.initialLoading = false;
}

onMounted(async () => {
  initChecks();
});
</script>

<template>
  <UIContentWrap>
    <FullPageLoader v-if="localState.initialLoading" />
    <AuthSuccess
      v-else-if="
        !localState.isConnectionStatusActive &&
        urlParamsCode &&
        urlParamsCode.length == 40
      "
      @init-checks="initChecks"
    />
    <AuthWall
      v-else-if="!localState.isConnectionStatusActive"
      @init-checks="initChecks"
    />
    <div v-else-if="!localState.initialLoading" class="lc-app">
      <Header
        v-if="localState.lcOptions"
        @init-checks="initChecks"
        :connectionMethod="localState.connectionMethod"
        :lcOptions="localState.lcOptions"
      />
    </div>
  </UIContentWrap>
</template>

<style scoped>
.lc-app {
  padding: 32px 100px;
  background-color: #ffffff !important;
}
</style>
<style>
body
  .n-notification-container.n-notification-container--scrollable.n-notification-container--top-right {
  z-index: 999999 !important;
}
#wpbody,
#wpbody-content {
  background-color: #fff !important;
}
.lc-card-border {
  border: 1px solid #ddd !important;
}

*:focus,
textarea:focus {
  outline: none !important;
}
</style>
