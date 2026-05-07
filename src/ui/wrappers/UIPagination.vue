<script lang="ts">
export default defineComponent({
  name: 'UIPagination',
  inheritAttrs: false,
})
</script>
<script lang="ts" setup>
import { NPagination } from 'naive-ui'
import type { PaginationSizeOption } from 'naive-ui'
import { type PropType, defineComponent } from 'vue'

defineProps({
  pageCount: {
    type: Number,
    default: 10,
  },
  page: {
    type: Number,
  },
  id: {
    type: String,
    required: true,
  },
  pageSize: {
    type: Number as PropType<number | undefined>,
    default: undefined,
  },
  pageSlot: {
    type: Number as PropType<number>,
    default: 9,
  },
  showSizePicker: {
    type: Boolean,
    default: false,
  },
  simple: {
    type: Boolean,
    default: false,
  },
  pageSizes: {
    type: Array as PropType<(number | PaginationSizeOption)[]>,
    default: () => [10, 20, 30, 40],
  },
})

const emit = defineEmits(['update:page', 'update:page-size'])
</script>
<template>
  <NPagination
    :id="`${id}-pagination`"
    :page-count="pageCount"
    :page-size="pageSize"
    :page-sizes="pageSizes"
    :page-slot="pageSlot"
    :page="page"
    :show-size-picker="showSizePicker"
    :simple="simple"
    @update:page-size="(val: number) => emit('update:page-size', val)"
    @update:page="(val: number) => emit('update:page', val)"
  />
</template>
<style>
.n-pagination {
  align-items: center;
}
.n-pagination .n-base-selection {
  --n-height: 36px !important;
}
</style>
