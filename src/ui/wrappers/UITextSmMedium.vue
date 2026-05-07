<script lang="ts">
export default defineComponent({
  name: "UITextSmMedium",
  inheritAttrs: false,
});
</script>
<script lang="ts" setup>
import { defineComponent } from "vue";
</script>
<template>
  <div v-bind="$attrs" class="leadconn-text-sm-medium">
    <slot></slot>
  </div>
</template>
