<script setup lang="ts">
import { inject, onMounted, reactive, h, watch, render } from "vue";
import BackendService from "@/services";
import {
  type SelectBaseOption,
  UIDataTable,
  UIButton,
  UIPopselect,
  UIModal,
  UIInput,
  UIModalHeader,
  UIAlert,
  UITooltip,
} from "@/ui";
import type { BasicSettings, SettingResponse } from "@/types";
import {
  LinkExternal01Icon,
  DotsVerticalIcon,
  CircleIcon,
  Copy01Icon,
  PhoneIcon,
} from "@/icons";
import { ensureHttps } from "@/helper";

const lcOptions = inject("lcOptions") as SettingResponse;
const lcAdminSettings = inject("lcAdminSettings") as BasicSettings;

const localState = reactive({
  loading: true,
  pools: [],
  selectedDomain: "",
  emailPrefix: "wp",
  isEnabled: false,
  isEligible: false,
  selectedMenuOption: "",
  selectedPool: {} as any,
  showModal: false,
  copyText: "Copy",
});

function fetchForms() {
  localState.loading = true;
  BackendService.Phone.getAllNumberPools().then((response) => {
    localState.pools = response;
    localState.loading = false;
  });
}

onMounted(async () => {
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
    title: "Pool Friendly Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Visitor Source",
    dataIndex: "source",
    key: "source",
  },
  {
    title: "Tracking Number",
    dataIndex: "count",
    key: "count",
    render: (row: any) => {
      return `${row.count} Numbers`;
    },
  },
  {
    title: "Forwarding Number",
    dataIndex: "forwarding_number",
    key: "forwarding_number",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (row: any) => {
      if (row.isActive)
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
      else
        return h(
          "span",
          {
            class:
              "text-xs font-medium bg-red-50 text-red-700 rounded-2xl py-1 px-4 capitalize",
          },
          [
            h(CircleIcon, {
              class: "w-2 h-2 bg-red-700 rounded-full mr-2",
            }),
            "In Active",
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
          href: `${lcOptions.white_label_url || lcAdminSettings.baseURL}/v2/location/${lcOptions.location_id}/settings/phone_number?tab=manage`,
          target: "_blank",
          class: "text-blue-500",
          options: menuOptions,
          "onUpdate:value": (val) => {
            localState.selectedMenuOption = val;
            localState.selectedPool = row;
          },
        },
        [
          h(DotsVerticalIcon, {
            class: "w-4 h-4 cursor-pointer",
          }),
        ],
      );
    },
  },
];

watch(
  () => localState.selectedPool,
  (val) => {
    if (localState.selectedPool) localState.showModal = true;
  },
);

watch(
  () => localState.showModal,
  (val) => {
    if (!val) {
      localState.selectedPool = false;
      localState.selectedMenuOption = "";
    }
  },
);

async function copyToClipboard(textToCopy: string) {
  // Navigator clipboard api needs a secure context (https)
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(textToCopy);
  } else {
    // Use the 'out of viewport hidden text area' trick
    const textArea = document.createElement("textarea");
    textArea.value = textToCopy;

    // Move textarea out of the viewport so it's not visible
    textArea.style.position = "absolute";
    textArea.style.left = "-999999px";

    document.body.prepend(textArea);
    textArea.select();

    try {
      document.execCommand("copy");
    } catch (error) {
      console.error(error);
    } finally {
      textArea.remove();
    }
  }
}

const copyText = (text: string) => {
  copyToClipboard(text);
  localState.copyText = "Copied";
  setTimeout(() => {
    localState.copyText = "Copy";
  }, 2000);
};
</script>
<template>
  <div class="flex justify-between items-center">
    <div class="flex flex-col justify-center">
      <h2 class="text-xl font-sans font-medium mb-1">
        Phone Number Tracking Pool
      </h2>
      <span class="text"
        >Track and attribute calls to boost campaign effectiveness
      </span>
    </div>

    <div>
      <UIModal
        :width="544"
        v-model:show="localState.showModal"
        className="fixed top-10 left-0 right-0 flex justify-center"
      >
        <template #header>
          <UIModalHeader
            :type="'primary'"
            title="Number Pool Info"
            :icon="PhoneIcon"
            description="Use this code to display phone numbers from the pool on any page"
            id="modal-header"
            @close="() => (localState.showModal = false)"
          />
        </template>

        <div>
          <div class="row pt-5">
            <div class="row">
              <span class="text-sm font-medium">Swapping Numbers </span>
            </div>

            <div class="flex justify-between pt-2">
              <div style="border: 1px solid gray" class="rounded-lg p-2 w-5/12">
                {{
                  localState.selectedPool.friendly_forwarding_number[0]
                    ?.national
                }}
              </div>
              <div style="border: 1px solid gray" class="rounded-lg p-2 w-5/12">
                {{
                  localState.selectedPool.friendly_forwarding_number[0]
                    ?.international
                }}
              </div>
            </div>
          </div>

          <div class="pt-5">
            <UIAlert id="ccc" type="info" :closable="false" showIcon>
              <template #content>
                <div class="flex flex-col">
                  <span class="text-sm"> Note: </span>
                  <span class="text-sm pt-2">
                    Pasting the shortcode on any page will dynamically swap the
                    above numbers with available pool numbers.
                  </span>
                </div>
              </template>
            </UIAlert>
          </div>
          <div class="row pt-5">
            <div class="row">
              <span class="text-sm font-medium"> Embed Code </span>
            </div>
            <div class="flex items-center pt-2">
              <UIInput
                id="lc-phone-number-pool-embed-code"
                type="text"
                readonly
                class="outline-none"
                :value="
                  '[leadconnector_phone_number_pool id=' +
                  localState.selectedPool.id +
                  ']'
                "
              />
              <div class="flex items-center w-1/5">
                <UITooltip
                  :content="'Copy'"
                  :placement="'top'"
                  :trigger="'hover'"
                >
                  <template #trigger>
                    <Copy01Icon
                      class="w-6 bg-white cursor-pointer ml-3"
                      @click="
                        copyText(
                          '[leadconnector_phone_number_pool id=' +
                            localState.selectedPool.id +
                            ']',
                        )
                      "
                    />
                  </template>
                  {{ localState.copyText }}
                </UITooltip>
              </div>
            </div>
          </div>

          <div class="row pt-5">
            <div class="row">
              <span class="text-sm font-medium"> Pool Numbers </span>
            </div>
            <div class="flex flex-wrap">
              <span
                v-for="number in Object.keys(localState.selectedPool.numbers)"
                class="inline-flex justify-start border-2 w-1/2 py-2"
              >
                <div
                  style="border: 1px solid gray"
                  class="rounded-lg p-2 w-10/12"
                >
                  {{
                    localState.selectedPool.numbers[number].friendly_name
                      .national
                  }}
                </div>
              </span>
            </div>
          </div>
        </div>
      </UIModal>
    </div>

    <div>
      <a
        :href="`${ensureHttps(lcOptions.white_label_url || (lcAdminSettings.baseURL as string))}/v2/location/${lcOptions.location_id}/settings/phone_number?tab=manage`"
        target="_blank"
      >
        <UIButton id="manage-service" type="primary">
          Manage
          <LinkExternal01Icon class="w-4 h-4 ml-3" />
        </UIButton>
      </a>
    </div>
  </div>

  <div class="pt-5">
    <UIDataTable
      :columns="columns"
      :loading="localState.loading"
      :data="localState.pools"
    />
  </div>
</template>

<style>
.lc-email-box {
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 5px;
  background-color: #ffffff !important;
  flex-wrap: wrap;
}
</style>
