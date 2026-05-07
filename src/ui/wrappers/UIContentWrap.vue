<script lang="ts">
export default defineComponent({
  name: 'UIContentWrap',
  inheritAttrs: true,
})
</script>
<script lang="ts" setup>
import {
  NConfigProvider,
  NModalProvider,
  NNotificationProvider,
  enUS,
  dateEnUS,
} from 'naive-ui'
import { defineComponent } from 'vue'
import { themeOverrides } from '../theme'
</script>
<template>
  <n-config-provider
    :theme-overrides="themeOverrides"
    :locale="enUS"
    :date-locale="dateEnUS"
    class="leadconn-wrapper-container"
  >
    <n-notification-provider>
      <n-modal-provider>
        <slot></slot>
      </n-modal-provider>
    </n-notification-provider>
  </n-config-provider>
</template>

<style>
.leadconn-wrapper-container {
  width: 100%;
  height: 100%;
  font-family: Inter var, ui-sans-serif, system-ui, -apple-system,
    BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    'Noto Sans', sans-serif;
}
</style>
