<script lang="ts">
defineComponent({
  name: 'UIModalFooter',
})
</script>

<script lang="ts" setup>
import { computed, defineComponent, type PropType, useSlots } from 'vue'
import UIButton from './UIButton.vue'

defineProps({
  id: {
    type: String,
    required: true,
  },
  positiveText: {
    type: String,
    default: '',
  },
  negativeText: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String as PropType<'default' | 'primary' | 'error'>,
    default: 'primary',
  },
  disableNegativeBtn: {
    type: Boolean,
    default: undefined,
  },
})
const slots = useSlots()
const isActionRightSlotEnabled = computed(() => !!slots.actionRight)
</script>
<template>
  <div class="leadconn-modal-footer-actions">
    <div class="action-left">
      <slot name="actionLeft"></slot>
    </div>
    <div class="action-right">
      <slot name="actionRight"></slot>
      <template v-if="!isActionRightSlotEnabled">
        <UIButton
          v-if="negativeText"
          @click="$emit('negativeClick')"
          :id="`${id}-btn-negative-action`"
          :disabled="disableNegativeBtn"
        >
          {{ negativeText }}
        </UIButton>
        <UIButton
          :loading="loading"
          :disabled="disabled"
          v-if="positiveText"
          :type="type"
          :id="`${id}-btn-positive-action`"
          @click="$emit('positiveClick')"
        >
          {{ positiveText }}
        </UIButton>
      </template>
    </div>
  </div>
</template>

<style>
.leadconn-modal-footer-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 24px;
}
.leadconn-modal-footer-actions .action-right {
  display: flex;
  gap: 12px;
  margin-left: auto;
}
</style>
