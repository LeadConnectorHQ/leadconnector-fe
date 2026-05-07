<script lang="ts" setup>
import { XIcon } from "@/icons";
import { type PropType, useSlots } from "vue";
import UIButton from "./UIButton.vue";

const iconType: Record<string, string> = {
  custom: "icon-custom",
  success: "icon-success",
  error: "icon-error",
  warning: "icon-warning",
  primary: "icon-primary",
};

const slots = useSlots();

defineProps({
  id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
  icon: {
    type: Function,
    default: undefined,
  },
  type: {
    type: String as PropType<
      "error" | "primary" | "success" | "warning" | "custom"
    >,
    default: "primary",
  },
});
defineEmits(["close"]);
</script>
<template>
  <div class="leadconn-modal-heading">
    <div v-if="slots.customHeader">
      <slot name="customHeader"></slot>
    </div>
    <div v-else>
      <div class="leadconn-icon-container" v-if="icon">
        <div class="icon" :class="iconType[type]">
          <component :is="icon" />
        </div>
        <div class="action">
          <UIButton
            circle
            quaternary
            @click="$emit('close')"
            :id="`${id}-modal-close-btn`"
          >
            <XIcon class="w-5 h-5"></XIcon>
          </UIButton>
        </div>
      </div>
      <div class="title">
        {{ title }}
        <div class="action" v-if="!icon">
          <UIButton
            circle
            quaternary
            @click="$emit('close')"
            :id="`${id}-modal-close-btn`"
          >
            <XIcon class="w-6 h-6"></XIcon>
          </UIButton>
        </div>
      </div>
      <div v-if="slots.customDescription">
        <slot name="customDescription"></slot>
      </div>
      <div class="description" v-else-if="description">
        {{ description }}
      </div>
    </div>
  </div>
</template>

<style>
.leadconn-modal-heading {
  width: 100%;
}
.leadconn-modal-heading .leadconn-icon-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.leadconn-modal-heading .leadconn-icon-container .icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.leadconn-modal-heading .leadconn-icon-container .icon.icon-primary {
  border: 1px solid #d1e0ff;
  background: #eff4ff;
  color: #155eef;
}
.leadconn-modal-heading .leadconn-icon-container .icon.icon-success {
  border: 1px solid #a6f4c5;
  background: #d1fadf;
  color: #039855;
}
.leadconn-modal-heading .leadconn-icon-container .icon.icon-error {
  border: 1px solid #fecdca;
  background: #fee4e2;
  color: #d92d20;
}
.leadconn-modal-heading .leadconn-icon-container .icon.icon-warning {
  border: 1px solid #fedf89;
  background: #fef0c7;
  color: #dc6803;
}
.leadconn-modal-heading .leadconn-icon-container .icon.icon-custom {
  border: 1px solid #e4e7ec;
  background: #f9fafb;
  color: #344054;
}
.leadconn-modal-heading .title {
  font-family: "Inter", sans-serif;
  font-weight: 600;
  font-size: 18px;
  line-height: 28px;
  color: #101828;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
}
.leadconn-modal-heading .description {
  font-family: "Inter", sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: #667085;
  margin-top: 4px;
}
</style>
