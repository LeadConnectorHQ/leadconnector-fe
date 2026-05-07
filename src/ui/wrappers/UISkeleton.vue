<script lang="ts">
export default defineComponent({
  name: "UISkeleton",
  inheritAttrs: false,
});
</script>
<script lang="ts" setup>
import { NSkeleton } from "naive-ui";
import { defineComponent } from "vue";
</script>
<template>
  <NSkeleton v-bind="$attrs" />
</template>
