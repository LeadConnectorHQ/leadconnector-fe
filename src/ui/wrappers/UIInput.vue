<script lang="ts">
export default defineComponent({
  name: 'UIInput',
})
</script>
<script lang="ts" setup>
import { NInput } from 'naive-ui'
import { type PropType, computed, defineComponent } from 'vue'

type SupportedTypes = 'text' | 'textarea' | 'password'
type ExtendedTypes = 'tel' | 'email' | 'url'

const supportedTypes = ['text', 'textarea', 'password']

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  modelValue: {
    type: [String, Array] as PropType<string | [string, string] | null>,
    default: '',
  },
  type: {
    type: String as PropType<SupportedTypes | ExtendedTypes>,
    default: 'text',
  },
  placeholder: { type: String as PropType<string>, default: undefined },
  readonly: {
    type: Boolean,
    default: false,
  },
  rows: {
    type: Number,
    default: 3,
  },
  maxlength: Number,
  minlength: Number,
  loading: {
    type: Boolean,
    default: undefined,
  },
  autosize: {
    type: [Boolean, Object] as PropType<
      | boolean
      | { minRows?: number; maxRows?: number }
    >,
  },
  clearable: {
    type: Boolean,
    default: false,
  },
  size: {
    type: String as PropType<'small' | 'medium' | 'large'>,
    default: 'large',
  },
  showCount: {
    type: Boolean,
  },
  disabled: {
    type: Boolean,
  },
  inputProps: {
    type: Object as PropType<Record<string, any>>,
  },
  showPasswordOn: {
    type: String as PropType<'mousedown' | 'click'>,
    default: undefined,
  },
})

const emit = defineEmits(['update:modelValue', 'onBlur', 'onChange'])

const transformedType = computed(() => {
  return supportedTypes.includes(props.type)
    ? (props.type as SupportedTypes)
    : ('text' as SupportedTypes)
})

const nativeInputProps = computed(() => {
  if (!supportedTypes.includes(props.type)) {
    return { type: props.type, ...props.inputProps }
  }
  return props.inputProps ?? undefined
})

function emitValueUpdate(value: string) {
  emit('update:modelValue', value)
}
</script>

<template>
  <NInput
    v-bind="$attrs"
    :id="id"
    :clearable="clearable"
    :disabled="disabled"
    :loading="loading"
    :maxlength="maxlength"
    :minlength="minlength"
    :placeholder="placeholder"
    :readonly="readonly"
    :rows="rows"
    :show-count="showCount"
    :size="size"
    :type="transformedType"
    :input-props="nativeInputProps"
    :value="modelValue"
    :autosize="autosize"
    :show-password-on="showPasswordOn"
    @update:value="emitValueUpdate"
    @blur="(val: FocusEvent) => $emit('onBlur', val)"
    @change="(val: string) => $emit('onChange', val)"
    class="leadconn-input-text font-sans"
  >
    <template #prefix>
      <slot name="prefix" />
    </template>
    <template #suffix>
      <slot name="suffix" />
    </template>
    <template #password-visible-icon>
      <slot name="password-visible-icon" />
    </template>
    <template #password-invisible-icon>
      <slot name="password-invisible-icon" />
    </template>
  </NInput>
</template>
<style scoped>
.leadconn-input-text.n-input--error-status:not(
    .n-input--disabled
  ).n-input--focus:deep(.n-input__state-border) {
  box-shadow: 0px 0px 0px 4px #fee4e2;
  border: 1px solid #fda29b;
}
.leadconn-input-text:not(.n-input--disabled).n-input--focus:deep(
    .n-input__state-border
  ) {
  box-shadow: 0px 0px 0px 4px #d1e0ff;
  border: 1px solid #84adff;
}
.leadconn-input-text:deep(.n-input__input-el),
.leadconn-input-text:deep(.n-input__textarea-el) {
  color: var(--gray-900);
}
</style>
