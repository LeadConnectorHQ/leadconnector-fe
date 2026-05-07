<script setup lang="ts">
import { computed, inject } from "vue";
import { LinkExternal01Icon, LinkExternal02Icon } from "@/icons";
import { UIButton } from "@/ui";
import type { SettingResponse } from "@/types";
import { pluginAssetUrl } from "@/helper";
const lcOptions = inject("lcOptions") as SettingResponse;

const emits = defineEmits(["open-page-function"]);
const props = defineProps({
  heading: String,
  subTitle: String,
  buttonText: String,
});
</script>

<template>
  <div class="flex flex-col items-center justify-center">
    <img
      :src="pluginAssetUrl(lcOptions.plugin_directory_url, 'images/leadconnector-no-data-found.svg')"
      alt="No Data Found"
    />
    <div class="row">
      <p class="font-semibold text-sm">{{ heading }}</p>
      <p class="text-xs text-gray-500 -mt-1">{{ subTitle }}</p>
    </div>
    <div class="row">
      <UIButton
        id="redirect"
        @click="emits('open-page-function')"
        type="primary"
      >
        {{ buttonText }} &nbsp;<LinkExternal01Icon class="w-4 h-4" />
      </UIButton>
    </div>
  </div>
</template>
