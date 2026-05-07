<script lang="ts">
export default defineComponent({
  name: 'UICard',
  inheritAttrs: false,
})
</script>
<script lang="ts" setup>
import { NCard } from 'naive-ui'
import { defineComponent } from 'vue'
</script>
<template>
  <NCard v-bind="$attrs">
    <slot></slot>
    <template #header><slot name="header" /></template>
    <template #footer><slot name="footer" /></template>
    <template #header-extra><slot name="header-extra" /></template>
  </NCard>
</template>
