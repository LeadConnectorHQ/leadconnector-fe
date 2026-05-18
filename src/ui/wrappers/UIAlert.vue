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
    <template #header>
      <slot name="header" />
      <slot name="title" />
    </template>
    <template #default>
      <slot name="content"><slot /></slot>
      <slot name="actions" />
    </template>
    <template #icon><slot name="icon" /></template>
  </NAlert>
</template>
