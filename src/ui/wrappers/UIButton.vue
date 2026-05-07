<script lang="ts">
export default defineComponent({
  name: 'UIButton',
})
</script>
<script lang="ts" setup>
import { NButton } from 'naive-ui'
import { type PropType, defineComponent, useSlots } from 'vue'

type Type = 'default' | 'primary' | 'info' | 'success' | 'warning' | 'error'
type Size = 'tiny' | 'small' | 'medium' | 'large'

const slots = useSlots()

defineProps({
  id: {
    type: String,
    required: true,
  },
  type: {
    type: String as PropType<Type>,
    default: 'default',
  },
  size: {
    type: String as PropType<Size>,
    default: 'medium',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  ghost: {
    type: Boolean,
    default: false,
  },
  quaternary: {
    type: Boolean,
    default: false,
  },
  circle: {
    type: Boolean,
    default: false,
  },
  text: {
    type: Boolean,
    default: false,
  },
  active: {
    type: Boolean,
    default: undefined,
  },
  linkGray: {
    type: Boolean,
  },
})

defineEmits(['click'])
</script>

<template>
  <NButton
    :id="id"
    :text="text"
    :class="[
      quaternary ? 'quaternary' : null,
      circle || text ? 'icon-only' : null,
      active ? 'leadconn-active-btn' : null,
      text ? 'leadconn-text-btn' : null,
      linkGray ? 'leadconn-linkgray-btn' : null,
    ]"
    :type="type"
    :size="size"
    v-bind="$attrs"
    :disabled="disabled"
    :loading="loading"
    @click="(e: MouseEvent) => $emit('click', e)"
    :quaternary="quaternary"
    :circle="circle"
  >
    <slot></slot>
    <slot v-if="slots.icon" name="icon"></slot>
  </NButton>
</template>
