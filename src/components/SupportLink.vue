<script setup lang="ts">
import { LC_SUPPORT_LINK_TEXT, LC_SUPPORT_URL } from "@/constants";
</script>

<template>
  <a
    :href="LC_SUPPORT_URL"
    target="_blank"
    rel="noopener noreferrer"
    class="lc-support-link"
  >
    {{ LC_SUPPORT_LINK_TEXT }}
  </a>
</template>

<style scoped>
.lc-support-link {
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: #667085;
  text-decoration: none;
  transition: color 0.15s ease;
}

.lc-support-link:hover {
  color: #344054;
  text-decoration: underline;
}
</style>
