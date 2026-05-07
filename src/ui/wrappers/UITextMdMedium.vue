<script lang="ts">
export default defineComponent({
  name: "UITextMdMedium",
  inheritAttrs: false,
});
</script>
<script lang="ts" setup>
import { defineComponent } from "vue";
</script>
<template>
  <div v-bind="$attrs" class="leadconn-text-md-medium">
    <slot></slot>
  </div>
</template>
