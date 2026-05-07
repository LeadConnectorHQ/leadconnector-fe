<script lang="ts">
export default defineComponent({
  name: "UISpace",
  inheritAttrs: false,
});
</script>
<script lang="ts" setup>
import { NSpace } from "naive-ui";
import { defineComponent } from "vue";
</script>
<template>
  <NSpace v-bind="$attrs">
    <slot></slot>
  </NSpace>
</template>
