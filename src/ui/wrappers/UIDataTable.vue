<script lang="ts">
export default defineComponent({
  name: 'UIDataTable',
})
</script>
<script lang="ts" setup>
import { NDataTable } from 'naive-ui'
import { defineComponent } from 'vue'
</script>
<template>
  <NDataTable v-bind="$attrs" />
</template>
