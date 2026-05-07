<script lang="ts">
export default defineComponent({
  name: "UISwitch",
  inheritAttrs: false,
});
</script>
<script lang="ts" setup>
import { NSwitch } from "naive-ui";
import { defineComponent } from "vue";
</script>
<template>
  <NSwitch v-bind="$attrs">
    <template #checked><slot name="checked" /></template>
    <template #unchecked><slot name="unchecked" /></template>
  </NSwitch>
</template>
