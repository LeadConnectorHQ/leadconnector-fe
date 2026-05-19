<script setup lang="ts">
import { onMounted, reactive, h, inject, render, watch } from "vue";
import {
  UIButton,
  UIDataTable,
  UIPagination,
  UIPopselect,
  UISkeleton,
  type SelectBaseOption,
} from "@/ui";
import BackendService from "../../services";
import type {
  LeadConnectorPost,
  SettingResponse,
  BasicSettings,
} from "../../types";
import AddNewFunnel from "./funnels/AddNewFunnel.vue";
import {
  LinkExternal01Icon,
  Trash02Icon,
  Edit04Icon,
  Edit05Icon,
  LayoutTopIcon,
  CircleIcon,
  EyeIcon,
  DotsVerticalIcon,
} from "@/icons";
import { LC_PROD_BASE_URL } from "@/constants";
import { ensureHttps } from "@/helper";

const localState = reactive({
  loading: true,
  importedFunnels: [],
  importedFunnelsPagination: {
    total_pages: 1,
    per_page: 2,
    page: 1,
  } as any,
  currentPage: 1,
  showEditModal: false,
  editPost: {} as LeadConnectorPost,
  selectedFunnel: {} as any,
  selectedMenuOption: "",
});
const lcConnectionMethod = inject("lcConnectionMethod") as string;
const lcOptions = inject("lcOptions") as SettingResponse;
const lcAdminSettings = inject("lcAdminSettings") as BasicSettings;

async function deleteFunnel(postId: number) {
  localState.loading = true;
  await BackendService.Funnels.DeleteFunnelPostId(postId);
  localState.loading = false;

  localState.currentPage = 1;
  localState.importedFunnelsPagination.page = 1;
  // localState.importedFunnelsPagination.total_pages = 1;
  // localState.importedFunnels = [];

  fetchFunnels();
}

async function openFunnel(funnelPost: LeadConnectorPost) {
  window.open(`/${funnelPost.slug}`, "_blank");
}

async function editFunnel(funnelPost: LeadConnectorPost) {
  localState.showEditModal = true;
  localState.editPost = funnelPost;
}

async function onCloseEditFunnel(funnelPost: LeadConnectorPost) {
  localState.showEditModal = false;
  localState.editPost = {} as LeadConnectorPost;
}

let lcHost = lcOptions.white_label_url || lcAdminSettings.baseURL;

if (lcConnectionMethod == "api_key")
  lcHost = lcOptions.white_label_url || LC_PROD_BASE_URL;

const menuOptions = [
  {
    label: "Edit in Builder",
    value: "builderEdit",
  },
] as SelectBaseOption[];
const columns = [
  {
    title: "Page",
    dataIndex: "slug",
    key: "slug",
    width: "10%",
    render: (row: any) => {
      return `/${row.slug}`;
    },
  },
  {
    title: "Funnel Name",
    dataIndex: "leadconnector_funnel_name",
    key: "leadconnector_funnel_name",
    width: "30%",
    render: (row: any) => {
      return h(
        "div",
        {
          class: "flex flex-row items-center",
        },
        [
          h(
            "span",
            {
              class:
                "w-5 h-5 rounded-full p-2 bg-gray-200 flex items-center justify-center",
            },
            [
              h(LayoutTopIcon, {
                class: "w-5 h-5",
              }),
            ],
          ),
          h(
            "div",
            {
              class: "ml-2",
            },
            row.leadconnector_funnel_name,
          ),
          // h('div', {
          //     class: 'ml-2 flex items-center'
          // }, [
          //     h('span', {
          //         class: 'ml-2 text-xs font-medium bg-blue-50 text-primary-700 rounded-2xl py-1 px-4'
          //     }, `Version ${row.globalSectionVersion}`)
          // ])
        ],
      );
    },
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (row: any) => {
      if (row.status == "publish")
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
            "Live",
          ],
        );
      else
        return h(
          "span",
          {
            class:
              "text-xs font-medium bg-yellow-50 text-yellow-700 rounded-2xl py-1 px-4 capitalize",
          },
          [
            h(CircleIcon, {
              class: "w-2 h-2 bg-yellow-700 rounded-full mr-2",
            }),
            row.status,
          ],
        );
    },
  },
  {
    title: "Last Updated",
    dataIndex: "human_modified_date",
    key: "human_modified_date",
  },
  {
    title: "Step",
    dataIndex: "leadconnector_step_name",
    key: "leadconnector_step_name",
  },
  {
    title: "Actions",
    dataIndex: "",
    render: (funnel: LeadConnectorPost) => {
      return h(
        "div",
        {
          class: "flex flex-row",
        },
        [
          h(
            EyeIcon,
            {
              onClick: () => openFunnel(funnel),
              class: "w-5 mr-5 cursor-pointer",
            },
            "View",
          ),
          h(
            Edit05Icon,
            {
              onClick: () => editFunnel(funnel),
              class: "w-5 mr-5 cursor-pointer",
            },
            "Edit",
          ),
          h(
            Trash02Icon,
            {
              onClick: () => deleteFunnel(funnel.template_id as number),
              class: "w-5 cursor-pointer",
            },
            "Delete",
          ),
        ],
      );
    },
  },
  {
    title: "",
    dataIndex: "",
    render: (row: any) => {
      return h(
        UIPopselect,
        {
          href: `${ensureHttps(lcOptions.white_label_url || (lcAdminSettings.baseURL as string))}/v2/location/${lcOptions.location_id}/settings/phone_number?tab=manage`,
          target: "_blank",
          class: "text-blue-500 hover:outline-none",
          options: menuOptions,
          "onUpdate:value": (val) => {
            localState.selectedMenuOption = val;
            localState.selectedFunnel = row;
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

async function fetchFunnels() {
  localState.loading = true;
  const importedFunnels = await BackendService.Funnels.GetImportedFunnels(
    localState.currentPage,
    10,
  );
  localState.importedFunnels = importedFunnels?.funnels;
  localState.importedFunnelsPagination = importedFunnels?.pagination;
  localState.loading = false;
}

onMounted(async () => {
  fetchFunnels();
});

watch(
  () => localState.selectedMenuOption,
  () => {
    if (localState.selectedMenuOption == "builderEdit") {
      const editFunnelUrl = `${ensureHttps(lcHost as string)}/location/${lcOptions.location_id}/funnels-websites/funnels/${localState.selectedFunnel.leadconnector_funnel_id}/steps/${localState.selectedFunnel.leadconnector_step_id}`;

      window.open(editFunnelUrl, "_blank");

      localState.selectedMenuOption = "";
    }
  },
);
</script>

<template>
  <div class="header-section w-full pr-5">
    <div class="row title flex justify-between flex-row items-center">
      <div class="flex flex-col justify-center">
        <h2 class="text-xl font-sans font-medium mb-1">Funnel Pages</h2>
        <span class="text">
          Embed powerful sales funnels to boost conversions
        </span>
      </div>

      <AddNewFunnel @fetch-funnels="fetchFunnels" />
    </div>

    <div v-if="localState.showEditModal">
      <AddNewFunnel
        @modal-close="onCloseEditFunnel"
        :editPost="localState.editPost"
        @fetch-funnels="fetchFunnels"
        mode="edit"
      />
    </div>
    <div class="row content pt-5">
      <div class="table-container">
        <UIDataTable
          :loading="localState.loading"
          :key="
            (row: LeadConnectorPost) => {
              return row.leadconnector_funnel_id as string;
            }
          "
          :columns="columns"
          :data="localState.importedFunnels"
          :bordered="false"
          :pagination="false"
        >
        </UIDataTable>

        <div
          v-if="
            !localState.loading &&
            localState.importedFunnelsPagination.total_pages > 0
          "
          class="leadconn-table-footer"
        >
          <span class="text-sm text-gray-500">
            Page {{ localState.importedFunnelsPagination.page }} of
            {{ localState.importedFunnelsPagination.total_pages }}
          </span>

          <UIPagination
            id="lc-funnels-list-pagination"
            :pageCount="localState.importedFunnelsPagination.total_pages"
            :pageSize="localState.importedFunnelsPagination.per_page"
            :pageSlot="localState.importedFunnelsPagination.page"
            :showSizePicker="false"
            :page="localState.importedFunnelsPagination.page"
            @update:page="
              (page) => {
                localState.currentPage = page;
                fetchFunnels();
              }
            "
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
