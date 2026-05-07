<script lang="ts">
export default defineComponent({
  name: "UITooltip",
  inheritAttrs: false,
});
</script>
<script lang="ts" setup>
import { NTooltip } from "naive-ui";
import { defineComponent } from "vue";
</script>
<template>
  <NTooltip v-bind="$attrs">
    <slot></slot>
    <template #trigger><slot name="trigger" /></template>
  </NTooltip>
</template>
