<script setup lang="ts">
import { inject, onMounted, reactive, h, watch, computed } from "vue";
import BackendService from "@/services";
import {
  type SelectBaseOption,
  UIDataTable,
  UIButton,
  UIPopselect,
  UIModalHeader,
  UIModal,
  UIPagination,
  UIInput,
  UITooltip,
} from "@/ui";
import type { BasicSettings, SettingResponse } from "@/types";
import {
  CheckCircleIcon,
  CircleIcon,
  Copy01Icon,
  DotsVerticalIcon,
  FileCheck02Icon,
  LinkExternal01Icon,
} from "@/icons";
import moment from "moment";
import { ensureHttps } from "@/helper";

const lcOptions = inject("lcOptions") as SettingResponse;
const lcAdminSettings = inject("lcAdminSettings") as BasicSettings;

const localState = reactive({
  loading: true,
  forms: [],
  showModal: false,
  selectedForm: {} as any,
  selectedMenuOption: "",
  formsPagination: {
    page: 1,
    per_page: 10,
    total_pages: 1,
  },
  copyText: "Copy",
});

function fetchForms() {
  localState.loading = true;
  BackendService.Forms.getAllForms(localState.formsPagination.page, 3).then(
    (response) => {
      localState.forms = response.forms;
      localState.formsPagination = {
        page: parseInt(response.pagination.page),
        per_page: parseInt(response.pagination.per_page),
        total_pages: parseInt(response.pagination.total_pages),
      };

      localState.loading = false;
    },
  );
}

onMounted(async () => {
  localState.formsPagination.page = 1;
  fetchForms();
});

const menuOptions = [
  {
    label: "Embed",
    value: "embed",
  },
] as SelectBaseOption[];

const columns = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    width: "20%",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (row: any) => {
      return h(
        "span",
        {
          class:
            "text-xs font-medium bg-green-50 text-green-700 rounded-2xl py-1 px-4 capitalize",
        },
        [
          h(CircleIcon, {
            class: "w-2 h-2 bg-green-700 rounded-full mr-2",
          }),
          "Active",
        ],
      );
    },
  },
  {
    title: "Created At",
    dataIndex: "dateAdded",
    key: "dateAdded",
    render: (row: any) => {
      return moment(row.dateAdded).format("MMM DD, YYYY");
    },
  },
  {
    title: "Last Updated",
    dataIndex: "updatedAt",
    key: "updatedAt",
    render: (row: any) => {
      return moment(row.updatedAt).format("MMM DD, YYYY hh:mm A");
    },
  },
  {
    title: "Submissions",
    dataIndex: "submissions",
    key: "submissions",
  },
  {
    title: "",
    dataIndex: "",
    render: (row: any) => {
      return h(
        UIPopselect,
        {
          href: `${lcOptions.white_label_url || lcAdminSettings.baseURL}/v2/location/${lcOptions.location_id}/settings/phone_number?tab=manage`,
          target: "_blank",
          class: "text-blue-500 hover:outline-none",
          options: menuOptions,
          "onUpdate:value": (val) => {
            localState.selectedMenuOption = val;
            localState.selectedForm = row;
          },
        },
        [
          h(DotsVerticalIcon, {
            class: "w-4 h-4 cursor-pointer  hover:outline-none",
          }),
        ],
      );
    },
  },
];

watch(
  () => localState.selectedForm,
  (val) => {
    if (localState.selectedForm) localState.showModal = true;
  },
);
watch(
  () => localState.showModal,
  (val) => {
    if (!val) {
      localState.selectedForm = false;
    }
  },
);

const currentShortcode = computed(() => {
  return `[leadconnector_form id='${localState.selectedForm._id}' title='${localState.selectedForm.name}' ]`;
});

const copyCodeToClipboard = (value: string) => {
  const textElem = document.createElement("textarea");
  textElem.innerHTML = value;
  document.body.appendChild(textElem);
  textElem.select();
  document.execCommand("copy");
  navigator?.clipboard?.writeText(textElem.value);
  document.body.removeChild(textElem);
};

const copyText = () => {
  copyCodeToClipboard(currentShortcode.value);
  localState.copyText = "Copied";
  setTimeout(() => {
    localState.copyText = "Copy";
  }, 3000);
};
</script>
<template>
  <div class="flex justify-between items-center">
    <div class="flex flex-col justify-center">
      <h2 class="text-xl font-sans font-medium mb-1">Forms</h2>
      <span class="text">
        Easily gather customer info and grow your CRM database</span
      >
    </div>

    <div>
      <a
        :href="`${ensureHttps(lcOptions.white_label_url || lcAdminSettings.baseURL)}/v2/location/${lcOptions.location_id}/form-builder/main`"
        target="_blank"
      >
        <UIButton id="manage-service" type="primary">
          Manage
          <LinkExternal01Icon class="w-4 h-4 ml-3" />
        </UIButton>
      </a>
    </div>
  </div>

  <div>
    <UIModal
      :width="450"
      v-model:show="localState.showModal"
      className=" flex justify-center"
    >
      <template #header>
        <UIModalHeader
          id="lc-forms-modal-header"
          @close="localState.showModal = false"
          :icon="FileCheck02Icon"
          style="z-index: 999"
        />
      </template>
      <div class="relative -top-5">
        <div class="flex flex-col">
          <div class="mt-3">
            <span class="text-xl font-medium"> Your form is ready </span>
          </div>
          <div class="mt-1">
            <span class="text-base font-light">
              Now its time to add it to your website
            </span>
          </div>
          <div class="pt-6">
            <span class="text-sm">
              <b
                >Paste this shortcode inside a WordPress page to start getting
                submissions.</b
              >
              Once the form is added to your website, any changes will be
              applied automatically.
            </span>
          </div>
        </div>
        <div class="mt-5 flex">
          <span class="text-sm"> Shortcode </span>
        </div>
        <div class="mt-3 flex flex-row items-center">
          <UIInput
            id="lc-forms-modal-shortcode"
            type="text"
            readonly
            class="outline-none w-full"
            :value="currentShortcode"
          />
          <div class="flex items-center w-auto">
            <UITooltip :placement="'top'" :trigger="'hover'">
              <template #trigger>
                <Copy01Icon
                  class="w-6 bg-white cursor-pointer ml-3"
                  @click="() => copyText()"
                />
              </template>
              {{ localState.copyText }}
            </UITooltip>
          </div>
        </div>
      </div>
    </UIModal>
  </div>
  <div class="pt-5">
    <div class="table-container">
      <UIDataTable
        :columns="columns"
        :loading="localState.loading"
        :data="localState.forms"
        :bordered="false"
        :pagination="false"
      />

      <div
        v-if="!localState.loading && localState.formsPagination.total_pages > 0"
        class="leadconn-table-footer"
      >
        <span class="text-sm text-gray-500">
          Page {{ localState.formsPagination.page }} of
          {{ localState.formsPagination.total_pages }}
        </span>

        <UIPagination
          id="lc-forms-list-pagination"
          :pageCount="localState.formsPagination.total_pages"
          :pageSize="localState.formsPagination.per_page"
          :pageSlot="localState.formsPagination.page"
          :showSizePicker="false"
          :page="localState.formsPagination.page || 1"
          @update:page="
            (page) => {
              localState.formsPagination.page = parseInt(page);
              fetchForms();
            }
          "
        />
      </div>
    </div>
  </div>
</template>
