<script lang="ts">
export default defineComponent({
  name: 'UIEmpty',
  inheritAttrs: false,
})
</script>
<script lang="ts" setup>
import { NEmpty } from 'naive-ui'
import { defineComponent } from 'vue'
</script>
<template>
  <NEmpty v-bind="$attrs">
    <slot></slot>
    <template #icon><slot name="icon" /></template>
    <template #extra><slot name="extra" /></template>
  </NEmpty>
</template>
