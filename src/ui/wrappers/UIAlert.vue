<script lang="ts">
export default defineComponent({
  name: 'UIAlert',
  inheritAttrs: false,
})
</script>
<script lang="ts" setup>
import { NAlert } from 'naive-ui'
import { defineComponent } from 'vue'
</script>
<template>
  <NAlert v-bind="$attrs">
    <slot></slot>
    <template #header><slot name="header" /></template>
    <template #icon><slot name="icon" /></template>
  </NAlert>
</template>
