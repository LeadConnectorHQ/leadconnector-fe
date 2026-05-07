<script lang="ts">
export default defineComponent({
  name: 'UIModal',
  inheritAttrs: false,
})
</script>
<script lang="ts" setup>
import { NCard, NModal } from 'naive-ui'
import { type PropType, defineComponent } from 'vue'

defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  width: {
    type: Number,
    default: 544,
  },
  zIndex: {
    type: Number,
    default: undefined,
  },
  to: {
    type: [String, HTMLElement] as PropType<string | HTMLElement>,
    default: undefined,
  },
  autoFocus: {
    type: Boolean,
    default: false,
  },
  className: {
    type: String,
    default: undefined,
  },
  maskClosable: {
    type: Boolean,
    default: true,
  },
  showBorder: {
    type: Boolean,
    default: false,
  },
  closeOnEsc: {
    type: Boolean,
  },
})

defineEmits(['update:show', 'onEsc', 'onMaskClick'])
</script>

<style>
.leadconn-modal {
  background: #ffffff;
  box-shadow: 0px 20px 24px -4px rgba(16, 24, 40, 0.08),
    0px 8px 8px -4px rgba(16, 24, 40, 0.03);
  border-radius: 12px;
  padding: 24px;
}
.leadconn-modal .n-card-header {
  padding: 0;
}
.leadconn-modal .n-card__content {
  padding: 0;
}
.leadconn-modal .n-card__footer {
  padding: 0;
}
.leadconn-modal-border {
  padding: 0px;
}
.leadconn-modal-border .n-card-header {
  padding: 24px 24px 0 24px;
}
.leadconn-modal-border .n-card__footer {
  padding: 8px 24px 24px 24px;
}
.leadconn-modal-border .leadconn-modal-content {
  padding: 20px 24px 0 24px;
}
.leadconn-modal-border .leadconn-modal-border-div {
  height: 1px;
  width: 100%;
  background: #eaecf0;
}
.leadconn-modal-border .leadconn-modal-border-div.header-border {
  margin-top: 20px;
}
.leadconn-modal-border .leadconn-modal-border-div.footer-border {
  margin-top: 8px;
}
</style>
<template>
  <n-modal
    :show="show"
    @update:show="(val: boolean) => $emit('update:show', val)"
    :z-index="zIndex"
    :auto-focus="autoFocus"
    :to="to"
    :mask-closable="maskClosable"
    :class="[showBorder ? 'leadconn-modal-border' : '']"
    :close-on-esc="closeOnEsc"
    :on-esc="() => $emit('onEsc')"
    :on-mask-click="() => $emit('onMaskClick')"
  >
    <n-card
      :style="{ width: `${width}px` }"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
      class="leadconn-modal"
      :class="className ? className : ''"
    >
      <template #header>
        <slot name="header"></slot>
      </template>

      <div v-if="showBorder" class="leadconn-modal-border-div header-border"></div>
      <div
        v-if="className"
        :class="
          className && className.trim().split(' ').length === 1
            ? `${className.trim()}__content`
            : ''
        "
      >
        <slot></slot>
      </div>
      <slot v-else></slot>
      <div v-if="showBorder" class="leadconn-modal-border-div footer-border"></div>

      <template #footer>
        <slot name="footer"></slot>
      </template>
    </n-card>
  </n-modal>
</template>
