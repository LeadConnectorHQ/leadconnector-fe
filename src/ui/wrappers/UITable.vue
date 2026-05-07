<script lang="ts">
export default defineComponent({
  name: "UITable",
  inheritAttrs: false,
});
</script>
<script lang="ts" setup>
import { SearchLgIcon } from "@/icons";
import { NDataTable } from "naive-ui";
import type { PaginationSizeOption } from "naive-ui";
import { type PropType, computed, defineComponent, useSlots } from "vue";
import UIInput from "./UIInput.vue";
import UIPagination from "./UIPagination.vue";

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  columns: {
    type: Array as PropType<any[]>,
    default: () => [],
  },
  data: {
    type: Array as PropType<any[]>,
    default: () => [],
  },
  page: {
    type: Number,
  },
  pageCount: {
    type: Number,
  },
  enableTextSearch: {
    type: Boolean,
    default: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  searchInputPlaceholder: {
    type: String,
    default: undefined,
  },
  searchText: {
    type: String,
    default: "",
  },
  showSizePicker: {
    type: Boolean,
    default: false,
  },
  pageSizes: {
    type: Array as PropType<(number | PaginationSizeOption)[]>,
    default: () => [10, 20, 30, 40],
  },
  pageSize: {
    type: Number as PropType<number | undefined>,
    default: undefined,
  },
  pageSlot: {
    type: Number as PropType<number>,
    default: 9,
  },
  scrollX: {
    type: [Number, undefined] as PropType<number | undefined>,
    required: false,
    default: undefined,
  },
  maxHeight: {
    type: [Number, String],
    default: undefined,
  },
  minHeight: {
    type: Number,
    default: undefined,
  },
  tableLayout: {
    type: String as PropType<"auto" | "fixed">,
    default: "auto",
  },
  rowClassName: {
    type: String,
    default: undefined,
  },
  rowProps: {
    type: Function as PropType<(rowData: any, rowIndex?: number) => object>,
    default: undefined,
  },
  striped: {
    type: Boolean,
    default: false,
  },
  hideFooter: {
    type: Boolean,
    default: false,
  },
  rowKey: {
    type: Function as PropType<(row: any) => string | number>,
    default: undefined,
  },
  checkedRowKeys: {
    type: Array as PropType<(string | number)[]>,
    default: undefined,
  },
  remote: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "update:page",
  "update:page-size",
  "update:searchText",
  "update:checkedRowKeys",
  "update:sorter",
]);

function onUpdateSearchText(val: string) {
  emit("update:searchText", val);
}

const slots = useSlots();

const showFilterBar = computed(() => {
  return (
    props.enableTextSearch ||
    slots["filter-right"] ||
    slots["filter-left"] ||
    slots["filter-left-start"] ||
    slots["filter-left-end"] ||
    slots["filter-right-start"] ||
    slots["filter-right-end"]
  );
});
</script>

<template>
  <div class="table-container">
    <div class="leadconn-table-custom-header">
      <div class="filter-bar" v-if="showFilterBar">
        <div class="filter-bar--left">
          <slot name="filter-left"></slot>
          <slot name="filter-left-start" v-if="!slots?.['filter-left']"></slot>
          <slot name="filter-left-end"></slot>
        </div>
        <div class="filter-bar--right">
          <slot name="filter-right"></slot>
          <slot
            name="filter-right-start"
            v-if="!slots?.['filter-right']"
          ></slot>
          <UIInput
            class="filter-search"
            :modelValue="searchText"
            @update:modelValue="onUpdateSearchText"
            clearable
            size="large"
            v-if="enableTextSearch"
            :placeholder="searchInputPlaceholder"
            :id="`hl-table-${id}-filter-text-search`"
          >
            <template #prefix>
              <SearchLgIcon class="w-4 h-4" />
            </template>
          </UIInput>
          <slot name="filter-right-end"></slot>
        </div>
      </div>
    </div>

    <div class="leadconn-table-container">
      <NDataTable
        @update:sorter="(val: any) => $emit('update:sorter', val)"
        :checked-row-keys="checkedRowKeys"
        @update:checked-row-keys="
          (val: any) => $emit('update:checkedRowKeys', val)
        "
        :row-key="rowKey"
        :columns="columns"
        :data="data"
        :pagination="false"
        :bordered="false"
        :loading="loading"
        :scroll-x="scrollX"
        :max-height="maxHeight"
        :min-height="minHeight"
        :table-layout="tableLayout"
        :row-class-name="rowClassName"
        :row-props="rowProps"
        :remote="remote"
        :striped="striped"
      >
        <template #empty>
          <slot name="empty"></slot>
        </template>
      </NDataTable>
      <div v-if="!hideFooter">
        <div class="leadconn-table-footer" v-if="data.length">
          <div class="leadconn-table-footer-left">
            <template v-if="slots['footer-left']">
              <slot name="footer-left"></slot>
            </template>
          </div>
          <div class="leadconn-table-footer-right">
            <template v-if="slots.pagination">
              <slot name="pagination"></slot>
            </template>
            <div class="pagination" v-else>
              <UIPagination
                :show-size-picker="showSizePicker"
                :page-sizes="pageSizes"
                :page-size="pageSize"
                :page-count="pageCount"
                @update:page="(val: number) => $emit('update:page', val)"
                @update:page-size="
                  (val: number) => $emit('update:page-size', val)
                "
                :page="page"
                :id="id"
                :page-slot="pageSlot"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.table-container {
  color: rgb(107, 114, 128);
  border-radius: 8px;
  background: var(--base-white, #fff);
  border: 1px solid #eaecf0;
  box-shadow:
    0px 1px 3px rgba(16, 24, 40, 0.1),
    0px 1px 2px rgba(16, 24, 40, 0.06);
}
.table-container .n-data-table .n-data-table-th {
  border-top: 1px solid #eaecf0;
}
.table-container .filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
}
.table-container .filter-bar--right,
.table-container .filter-bar--left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.table-container .leadconn-table-container {
  border-radius: 8px;
  background: var(--base-white, #fff);
}
.table-container table thead tr th,
.table-container .n-data-table .n-data-table-th {
  border-bottom: 1px solid #eaecf0;
  font-family: "Inter", sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 18px;
  padding: 12px 24px;
  background: var(--gray-50, #f9fafb);
  color: var(--gray-500, #667085);
}
.table-container table thead tr td,
.table-container .n-data-table .n-data-table-tr {
  font-family: "Inter", sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
}
.table-container .n-data-table .n-data-table-td {
  color: var(--gray-500, #667085);
  padding: 16px 24px;
  border-bottom: 1px solid #eaecf0;
  font-family: "Inter", sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
}
.table-container .pagination {
  display: flex;
  justify-content: flex-end;
}
.leadconn-table-footer {
  padding: 14px 24px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.filter-search {
  max-width: 320px;
}
</style>
