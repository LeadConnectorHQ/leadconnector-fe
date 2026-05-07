<script lang="ts">
export default defineComponent({
  name: "UISpin",
  inheritAttrs: false,
});
</script>
<script lang="ts" setup>
import { NSpin } from "naive-ui";
import { defineComponent } from "vue";
</script>
<template>
  <NSpin v-bind="$attrs">
    <slot></slot>
  </NSpin>
</template>
