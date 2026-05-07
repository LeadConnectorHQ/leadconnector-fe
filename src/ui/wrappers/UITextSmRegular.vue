<script lang="ts">
export default defineComponent({
  name: "UITextSmRegular",
  inheritAttrs: false,
});
</script>
<script lang="ts" setup>
import { defineComponent } from "vue";
</script>
<template>
  <div v-bind="$attrs" class="leadconn-text-sm-regular">
    <slot></slot>
  </div>
</template>
