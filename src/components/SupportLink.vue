<script setup lang="ts">
import { LC_SUPPORT_LINK_TEXT, LC_SUPPORT_URL } from "@/constants";
import { HeadsetIcon } from "@/icons";
</script>

<template>
  <a
    :href="LC_SUPPORT_URL"
    target="_blank"
    rel="noopener noreferrer"
    class="lc-support-link"
  >
    <HeadsetIcon class="lc-support-link__icon w-4 h-4 shrink-0" />
    <span>{{ LC_SUPPORT_LINK_TEXT }}</span>
  </a>
</template>

<style scoped>
.lc-support-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  height: 32px;
  padding: 0 12px;
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 500;
  color: #344054;
  background-color: #ffffff;
  border: 1px solid #d0d5dd;
  border-radius: 6px;
  text-decoration: none;
  transition:
    color 0.15s ease,
    background-color 0.15s ease,
    border-color 0.15s ease;
}

.lc-support-link__icon {
  flex-shrink: 0;
}

.lc-support-link:hover {
  color: #1d2939;
  background-color: #f9fafb;
  border-color: #98a2b3;
}
</style>
