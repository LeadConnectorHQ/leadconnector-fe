<script setup lang="ts">
import { onMounted, reactive, h, inject, computed, ref } from "vue";
import {
  UIButton,
  UIDataTable,
  UIPagination,
  UIInput,
  UIEmpty,
  UITable,
  renderIcon,
  UITooltip,
} from "@/ui";

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: void, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}
import BackendService from "../../services";
import type { SettingResponse, BasicSettings } from "../../types";
import {
  FolderIcon,
  Copy01Icon,
  PlusIcon,
  LinkExternal01Icon,
  FileSearch01Icon,
  SearchLgIcon,
  RefreshCw01Icon,
  RefreshCcw01Icon,
  InfoCircleIcon,
} from "@/icons";
import { LC_PROD_BASE_URL } from "@/constants";
import { ensureHttps } from "@/helper";
import NoDataAvailable from "./customValueComponents/NoDataAvailable.vue";

const localState = reactive({
  loading: true,
  searchQuery: "",
  foldersMap: new Map<string, string>(), // Fix: Define as array type instead of Array constructor
  pageSizes: [10, 20, 50, 100],
  currentPageSize: 10,
  currentPage: 1,
  totalPageCount: 1,
  skip: 0,
  totalCustomValuesCount: 0,
  customValues: [],
});

const lcConnectionMethod = inject("lcConnectionMethod") as string;
const lcOptions = inject("lcOptions") as SettingResponse;
const lcAdminSettings = inject("lcAdminSettings") as BasicSettings;

let lcHost = lcOptions.white_label_url || lcAdminSettings.baseURL;

if (lcConnectionMethod == "api_key")
  lcHost = lcOptions.white_label_url || LC_PROD_BASE_URL;

function copyToClipboard(text: string, id: string) {
  const textElem = document.createElement("textarea");
  textElem.innerHTML = text;
  document.body.appendChild(textElem);
  textElem.select();
  document.execCommand("copy");
  navigator?.clipboard?.writeText(textElem.value);
  document.body.removeChild(textElem);

  // Set copied state for this specific item
  copyStates.value[id] = true;
  setTimeout(() => {
    copyStates.value[id] = false;
  }, 2000); // Reset after 2 seconds
}

interface CustomValueRow {
  id: string;
  name: string;
  value: string;
  fieldKey: string;
  folder?: string;
  [key: string]: any;
}

const copyStates = ref<{ [key: string]: boolean }>({});

function hasNoData() {
  return localState.customValues.length === 0; // Fix: Access .value of the ref
}

const columnsHeadings = [
  {
    title: "Name",
    key: "name",
  },
  {
    title: "Folder",
    key: "parentId",
    render(row: CustomValueRow) {
      if (row.parentId)
        return h(
          `div`,
          {
            class:
              "w-fit flex w-max-full border border-solid border-gray-300 max py-0.5 px-1 items-center rounded-md",
          },
          [
            h(renderIcon(FolderIcon), { style: "width:20px" }),
            h(
              "span",
              {
                class: "pl-2 py-0.5 whitespace-nowrap folder-name truncate",
                style: "max-width:250px",
                id: `${row.id}-folder-name`,
              },
              localState.foldersMap.get(row.parentId) || "",
            ),
          ],
        );
      return h("div", { style: "min-width:100px" });
    },
  },
  {
    title: "Key",
    key: "fieldKey",
    render(row: CustomValueRow) {
      return h(
        `div`,
        {
          class:
            "w-auto min-w-[200px] flex py-0.5 px-1 items-center whitespace-nowrap cursor-pointer",
          id: `${row.id}-copy-key`,
          onClick: () =>
            copyToClipboard(`{{ custom_values.${row.fieldKey} }}`, row.id),
        },
        [
          h(
            "span",
            {
              class: "pr-2 whitespace-nowrap truncate max-w-[80%]",
              id: `${row.id}-field-key`,
            },
            `{{ custom_values.${row.fieldKey} }}`,
          ),
        ],
      );
    },
  },
  {
    title: "Value",
    key: "value",
    render(row: CustomValueRow) {
      const maxLength = 25; // Adjust this value based on your needs
      if (row.value && row.value.length > maxLength) {
        return h(
          UITooltip,
          {
            placement: "top-start",
            trigger: "hover",
          },
          {
            trigger: () =>
              h(
                "div",
                {
                  class: "truncate",
                  style: "min-width:100px; max-width:200px",
                  id: `${row.id}-field-value`,
                },
                row.value,
              ),
            default: () =>
              h(
                "div",
                {
                  class:
                    "bg-gray-900 text-white p-2 rounded-md max-w-[200px] text-sm",
                },
                row.value,
              ),
          },
        );
      } else {
        return h(
          "div",
          {
            class: "truncate",
            style: "min-width:80px; max-width:200px",
            id: `${row.id}-field-value`,
          },
          row.value,
        );
      }
    },
  },
  {
    title: "Last Updated",
    key: "lastUpdated",
    render(row: CustomValueRow) {
      return h(
        "div",
        { style: "min-width:50px" },
        new Date(row.dateUpdated).toLocaleString("en-US", {
          month: "short",
          year: "numeric",
        }),
      );
    },
  },
  {
    title: "Copy Shortcode",
    align: "center" as const,
    key: "shortCode",
    render(row: CustomValueRow) {
      return h(
        UITooltip,
        {
          placement: "top",
          trigger: "hover",
        },
        {
          trigger: () =>
            h(
              "div",
              {
                style:
                  "display: flex; justify-content: center; align-items: center; min-width: 50px;",
              },
              [
                h(renderIcon(Copy01Icon), {
                  class: "text-primary-500 cursor-pointer",
                  onClick: () =>
                    copyToClipboard(
                      `{{ custom_values.${row.fieldKey} }}`,
                      row.id,
                    ),
                }),
              ],
            ),
          default: () =>
            h(
              "div",
              {
                class: "bg-gray-900 text-white px-2 py-1 rounded text-xs",
              },
              copyStates.value[row.id] ? "Copied!" : "Copy",
            ),
        },
      );
    },
  },
];

/**
 * Redirect to manager custom value page
 */
function redirectToManagerCustomValue() {
  window.open(
    `${ensureHttps(lcHost as string)}/v2/location/${
      lcOptions.location_id
    }/settings/custom_values`,
    "_blank",
  );
}

async function getAllFoldersToSync() {
  const folders = [];
  let skip = 0;
  const limit = 1000;
  let hasMore = true;

  while (hasMore) {
    const res = await BackendService.CustomValues.getFolders(skip, limit);
    if (res && Array.isArray(res.body.data)) {
      res.body.data.forEach((folder: any) => {
        localState.foldersMap.set(folder.id, folder.name);
      });
      if (res.body.data.length < limit) {
        hasMore = false;
      } else {
        skip += limit;
      }
    } else {
      hasMore = false;
    }
    console.log(localState.foldersMap);
  }
}

const getCustomValues = async (searchQuery: string = "") => {
  const res = await BackendService.CustomValues.getCustomValues(
    searchQuery,
    localState.skip,
    localState.currentPageSize,
  );
  if (res && Array.isArray(res.body.data)) {
    localState.customValues = res.body.data;
    localState.totalCustomValuesCount = res.body.count;
    localState.totalPageCount = Math.ceil(
      res.body.count / localState.currentPageSize,
    );
  }
};

const clearCachedCustomValues = async () => {
  const res = await BackendService.CustomValues.clearCachedCustomValues();
  if (res) {
    localState.customValues = [];
    localState.totalCustomValuesCount = 0;
    localState.totalPageCount = 1;
  }
};

// Create a debounced version of getCustomValues
const debouncedGetCustomValues = debounce((query: string) => {
  getCustomValues(query);
}, 300); // 300ms delay

const handleSearchTextChange = (searchQuery: string) => {
  localState.searchQuery = searchQuery;
  localState.currentPage = 1;
  localState.skip = 0;
  debouncedGetCustomValues(searchQuery);
};

onMounted(async () => {
  const [_, customValueFetchFunction] = await Promise.all([
    getAllFoldersToSync(),
    getCustomValues(localState.searchQuery),
  ]);
  localState.loading = false;
});

function getPageDetails() {
  const from = (localState.currentPage - 1) * localState.currentPageSize + 1;
  const to =
    localState.currentPage * localState.currentPageSize >
    localState.totalCustomValuesCount
      ? localState.totalCustomValuesCount
      : localState.currentPage * localState.currentPageSize;
  const total = localState.totalCustomValuesCount;

  return `Showing ${from} to ${to} of ${total} results`;
}

function pageChange(pageNumber: number) {
  localState.currentPage = pageNumber;
  localState.skip = (pageNumber - 1) * localState.currentPageSize;
  getCustomValues(localState.searchQuery);
}

function pageSizeChange(selectedSize: number) {
  localState.currentPage = 1;
  localState.skip = 0;
  localState.currentPageSize = selectedSize;
  getCustomValues(localState.searchQuery);
}

async function refreshCustomValues() {
  localState.loading = true;
  await clearCachedCustomValues();
  await getCustomValues(localState.searchQuery);
  localState.loading = false;
}
</script>

<template>
  <div class="header-section w-full pr-5">
    <div class="row title flex justify-between flex-row items-center">
      <div class="flex flex-col justify-center">
        <h2 class="text-xl font-sans font-medium mb-1">Custom Values</h2>
        <span class="text max-w-[720px]">
          Click to copy the custom value and paste it anywhere on your WordPress
          site to personalize content. Use this shortcode in your pages, posts,
          or builders it will auto-populate with dynamic data from your Account.
        </span>
      </div>
      <div class="flex flex-row gap-2">
        <UITooltip v-if="!hasNoData()" :placement="'bottom'" trigger="hover">
          <template #trigger>
            <UIButton
              id="refresh-btn"
              type="default"
              @click="refreshCustomValues"
            >
              <RefreshCcw01Icon class="w-4 h-4" /> &nbsp; Refresh
            </UIButton>
          </template>
          <div class="flex items-start gap-2 max-w-[250px]">
            <InfoCircleIcon class="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span
              >Custom values refresh every 5 minutes. You can either wait for
              the update or click manually for an instant refresh.</span
            >
          </div>
        </UITooltip>
        <UIButton
          v-if="!hasNoData()"
          id="manage-btn"
          type="primary"
          @click="redirectToManagerCustomValue"
        >
          Manage &nbsp;
          <LinkExternal01Icon class="w-4 h-4" />
        </UIButton>
      </div>
    </div>
    <!-- Content -->
    <div class="mt-5">
      <UITable
        :columns="columnsHeadings"
        :data="localState.customValues"
        :loading="localState.loading"
        :enableTextSearch="true"
        :searchInputPlaceholder="'Search Custom Values'"
        :pageCount="localState.totalPageCount"
        :page="localState.currentPage"
        :pageSize="localState.currentPageSize"
        :pageSizes="localState.pageSizes"
        :search-text="localState.searchQuery"
        :showSizePicker="true"
        @update:searchText="handleSearchTextChange"
        @update:page="pageChange"
        @update:page-size="pageSizeChange"
        id="custom-values-table"
      >
        <template v-slot:footer-left>
          <UITextSmMedium class="text-gray-700">
            {{ getPageDetails() }}
          </UITextSmMedium>
        </template>
        <template v-slot:empty>
          <div class="text-center">
            <NoDataAvailable
              @open-page-function="redirectToManagerCustomValue"
              button-text="Add Custom Value"
              heading="No Data Here"
              sub-title="Add custom value(s) on your account to see data here"
            />
          </div>
        </template>
      </UITable>
    </div>
  </div>
</template>

<style scoped>
.header-section,
.header-section * {
  font-family: "Inter", "Segoe UI", "Arial", sans-serif !important;
}
</style>

<style></style>
