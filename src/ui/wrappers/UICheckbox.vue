<script lang="ts">
export default defineComponent({
  name: 'UICheckbox',
  inheritAttrs: false,
})
</script>
<script lang="ts" setup>
import { NCheckbox } from 'naive-ui'
import { defineComponent } from 'vue'
</script>
<template>
  <NCheckbox v-bind="$attrs">
    <slot></slot>
  </NCheckbox>
</template>
