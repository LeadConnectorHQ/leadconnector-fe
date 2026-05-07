<template>
  <div class="header-section w-full pr-5">
    <div class="row title flex justify-between flex-row items-center">
      <div class="flex flex-col justify-center">
        <h2 class="text-xl font-sans font-medium mb-1">Reviews Widget</h2>
        <span class="text max-w-[720px]"
          >Give your customers a great way to talk about you online.</span
        >
      </div>
      <div class="flex flex-row gap-2">
        <UITooltip :placement="'bottom'" trigger="hover">
          <template #trigger>
            <UIButton id="refresh-btn" type="default" @click="refreshWidget">
              <RefreshCcw01Icon class="w-4 h-4" /> &nbsp; Refresh
            </UIButton>
          </template>
          <div
            class="flex items-start gap-2 bg-gray-900 text-white p-3 rounded-lg max-w-[250px]"
          >
            <InfoCircleIcon class="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span
              >Refresh the reviews widget to get the latest customer reviews and
              ratings from your connected platforms.</span
            >
          </div>
        </UITooltip>
        <a
          :href="`${ensureHttps(lcOptions.white_label_url || (lcAdminSettings.baseURL as string))}/v2/location/${lcOptions.location_id}/reputation/widget`"
          target="_blank"
        >
          <UIButton id="manage-btn" type="primary">
            Manage
            <LinkExternal01Icon class="w-4 h-4 ml-1" />
          </UIButton>
        </a>
      </div>
    </div>

    <!-- Loading State - Full Width -->
    <div
      v-if="localState.loadingWidgets"
      class="flex items-center justify-center bg-white mt-5"
      style="height: 65vh"
    >
      <div class="flex flex-col items-center justify-center gap-4">
        <UISpin />
      </div>
    </div>

    <!-- No Data State - Full Width -->
    <div
      v-else-if="localState.widgets.length === 0"
      class="flex items-center justify-center bg-white mt-5"
      style="height: 65vh"
    >
      <div
        class="flex flex-col items-center justify-center gap-2 p-2 text-center"
      >
        <div class="relative">
          <img
            :src="pluginAssetUrl(lcOptions.plugin_directory_url, 'images/leadconnector-no-data-found.svg')"
            alt="No Data"
          />
        </div>
        <div>
          <h3 class="text-lg font-medium text-gray-900">No Data Here</h3>
          <p class="text-sm text-gray-600 mb-5 max-w-md">
            Add Reviews Widget on your account to see data here
          </p>
          <a
            :href="`${ensureHttps(lcOptions.white_label_url || (lcAdminSettings.baseURL as string))}/v2/location/${lcOptions.location_id}/reputation/widget`"
            target="_blank"
          >
            <UIButton
              id="manage-reviews-btn"
              type="primary"
              class="hover:text-white"
            >
              Manage Reviews
              <LinkExternal01Icon class="w-4 h-4 ml-1" />
            </UIButton>
          </a>
        </div>
      </div>
    </div>

    <!-- Normal State - Left/Right Panels -->
    <div
      v-else
      class="lc-reviews-widget-container flex items-center justify-evenly border-solid border-gray-100 rounded-lg bg-gray-50 mt-5"
    >
      <div
        class="lc-reviews-widget-left-panel relative flex flex-col bg-gray-50 px-4 py-2 overflow-y-auto"
        style="height: 65vh"
      >
        <div class="p-2 flex justify-end">
          <div class="flex gap-1.5">
            <UITooltip trigger="hover">
              <template #trigger>
                <UIButton
                  id="mobile-btn"
                  type="default"
                  size="sm"
                  class="bg-gray-100 p-2"
                  @click="toggleDevice()"
                >
                  <Phone01Icon
                    v-if="localState.deviceView === 'desktop'"
                    class="w-6 h-6 text-gray-400 font-normal"
                  />
                  <Monitor01Icon
                    v-else
                    class="w-6 h-6 text-gray-400 font-normal"
                  />
                </UIButton>
              </template>
              <span>
                {{
                  localState.deviceView === "desktop"
                    ? "Preview Reviews Widget in Mobile View"
                    : "Preview Reviews Widget in Desktop View"
                }}
              </span>
            </UITooltip>
            <UITooltip trigger="hover">
              <template #trigger>
                <UIButton
                  id="code-btn"
                  type="default"
                  size="sm"
                  class="bg-gray-100 p-2"
                  @click="toggleDevice('code')"
                >
                  <CodeSquare01Icon class="w-6 h-6 text-gray-400 font-normal" />
                </UIButton>
              </template>
              <span> Copy Reviews Widget Shortcode </span>
            </UITooltip>
          </div>
        </div>
        <div
          :class="[
            'p-4',
            localState.deviceView === 'mobile' &&
              localState.widgets.find((w) => w.id === localState.selectedWidget)
                ?.type === 'flash' &&
              'rounded-lg shadow-md relative h-full mx-auto w-full max-w-[400px]',
          ]"
        >
          <!-- Loading State for Left Panel -->
          <div
            v-if="localState.loadingLeftPanel"
            class="flex flex-col items-center justify-center min-h-[200px] gap-4"
          >
            <UISpin />
            <UITextSmMedium class="text-gray-600"
              >Loading widget preview...</UITextSmMedium
            >
          </div>
          <!-- No Widget Available State -->
          <div
            v-else-if="
              !localState.loadingWidgets && localState.widgets.length === 0
            "
            class="flex flex-col items-center justify-center min-h-[200px] gap-4"
          >
            <div
              class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center"
            >
              <InfoCircleIcon class="w-8 h-8 text-gray-400" />
            </div>
            <UITextSmMedium class="text-gray-600"
              >No widgets available</UITextSmMedium
            >
          </div>
          <!-- No Widget Selected State -->
          <div
            v-else-if="!localState.selectedWidget"
            class="flex flex-col items-center justify-center min-h-[200px] gap-4"
          >
            <div
              class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center"
            >
              <CodeSquare01Icon class="w-8 h-8 text-gray-400" />
            </div>
            <UITextSmMedium class="text-gray-600"
              >Select a widget to preview</UITextSmMedium
            >
          </div>
          <div
            v-else-if="
              localState.selectedWidget && localState.widgets.length > 0
            "
            class="w-full mx-auto text-center"
          >
            <ReviewsWidgetPreview
              :widget-id="localState.selectedWidget"
              :location-id="lcOptions?.location_id"
              :device-view="localState.deviceView as 'mobile' | 'desktop'"
              :widget-type="
                localState.widgets.find(
                  (w) => w.id === localState.selectedWidget,
                )?.type || ''
              "
              :widget-position="
                localState.widgets.find(
                  (w) => w.id === localState.selectedWidget,
                )?.widgetPosition || ''
              "
              @loaded="onWidgetLoaded"
              @error="onWidgetError"
              @retry="onWidgetRetry"
            />
          </div>
        </div>
      </div>

      <div
        class="lc-reviews-widget-right-panel relative flex flex-col justify-between divide-gray-100 lg:border-l-2 bg-white py-2 border-t lg:border-t-0"
        style="height: 65vh; border-left: 1px solid var(--gray-200)"
      >
        <div
          class="p-2 px-4 flex-1 overflow-y-auto reviews-widget-templates-container"
        >
          <div
            v-if="localState.loadingRightPanel"
            class="flex flex-col items-center justify-center min-h-[200px] gap-4"
          >
            <UISpin />
            <UITextSmMedium class="text-gray-600"
              >Loading widget options...</UITextSmMedium
            >
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              v-for="widget in localState.widgets.filter(
                (w: WidgetConfig) => w.status !== 'preview',
              )"
              :key="widget.id"
              class="flex flex-col items-center w-full"
            >
              <div
                :class="[
                  'cursor-pointer w-full border border-solid relative rounded-lg shadow-sm hover:shadow-md transition-all duration-200 reviews-widget-template-card aspect-square',
                  localState.selectedWidget === widget.id
                    ? 'bg-blue-50 border-primary-300'
                    : 'bg-white border-gray-300',
                ]"
                @click="selectWidget(widget.id)"
              >
                <!-- DEFAULT Tag -->
                <div
                  v-if="widget.status === 'live'"
                  class="absolute top-2 left-2 z-10"
                >
                  <div
                    class="flex items-center bg-blue-50 border border-blue-200 rounded-full px-2 py-1 shadow-sm"
                  >
                    <SunIcon class="h-3 w-3 text-blue-500 mr-1 font-medium" />
                    <span class="text-sm font-medium text-blue-600"
                      >Default</span
                    >
                  </div>
                </div>

                <div
                  :class="[
                    'rounded-md flex items-center justify-center overflow-hidden widget-template-card h-full',
                  ]"
                >
                  <div
                    v-if="widget.thumbnailUrl"
                    class="inline-block overflow-hidden"
                  >
                    <img
                      :src="`${widget.thumbnailUrl}?v=${Math.random()}`"
                      :alt="widget.name"
                      class="w-full h-full object-contain object-center"
                      style="
                        object-position: center center;
                        border-bottom: 1px solid var(--gray-200);
                      "
                    />
                  </div>
                  <div
                    v-else
                    class="flex items-center justify-center w-full h-full rounded-md"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="2"
                      stroke="currentColor"
                      aria-hidden="true"
                      class="aspect-[1.2] min-h-16 w-1/2 min-w-20 p-2 text-primary-500"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M21 12H9m12-6H9m12 12H9m-4-6a1 1 0 11-2 0 1 1 0 012 0zm0-6a1 1 0 11-2 0 1 1 0 012 0zm0 12a1 1 0 11-2 0 1 1 0 012 0z"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
              <!-- Widget Title Outside Card -->
              <div class="mt-2 text-center pb-2">
                <UITextMdMedium
                  :class="
                    localState.selectedWidget === widget.id
                      ? 'text-blue-600'
                      : 'text-gray-500'
                  "
                  >{{ widget.name }}</UITextMdMedium
                >
              </div>
            </div>
          </div>
        </div>
        <div
          class="border-t border-gray-200 flex justify-end pt-3 px-4 pb-2 mt-auto"
          style="border-top: 1px solid var(--gray-200)"
        >
          <UIButton
            id="copy-shortcode-btn"
            type="primary"
            :disabled="!localState.selectedWidget"
            @click="openModalAndCopy"
          >
            <Copy01Icon class="w-4 h-4 mr-1" />
            {{ localState.copyText }} Shortcode
          </UIButton>
        </div>
      </div>
    </div>

    <!-- Embed Code Modal -->
    <UIModal
      :width="500"
      v-model:show="localState.showEmbedModal"
      className=" flex justify-center"
    >
      <template #header>
        <UIModalHeader
          id="lc-reviews-modal-header"
          @close="localState.showEmbedModal = false"
          :icon="FileCheck02Icon"
          style="z-index: 999"
        />
      </template>
      <div class="relative -top-5">
        <div class="flex flex-col">
          <div class="mt-3">
            <span class="text-xl font-medium text-gray-900">
              Your reviews widget is ready
            </span>
          </div>
          <div class="mt-1">
            <span class="text-base font-light">
              Now its time to add it to your website
            </span>
          </div>
          <div class="pt-6">
            <span class="text-sm text-gray-600">
              <b
                >Paste this shortcode inside a WordPress page to start
                displaying reviews.</b
              >
              Once the widget is added to your website, any changes will be
              applied automatically.
            </span>
          </div>
        </div>
        <div class="mt-5 flex">
          <span class="text-sm"> Shortcode </span>
        </div>
        <div class="mt-1 flex flex-row items-center">
          <UIInput
            id="lc-reviews-modal-shortcode"
            type="text"
            readonly
            class="outline-none w-full"
            :value="currentShortcode"
          />
        </div>

        <!-- Widget Selector Section -->
        <div class="mt-3 flex flex-row items-center gap-3">
          <div class="flex-1">
            <UISelect
              id="widget-selector"
              placeholder="Select Widget"
              :options="widgetOptions"
              :value="localState.selectedWidget"
              @update:value="onWidgetSelectionChange"
            />
          </div>
          <UIButton
            id="copy-shortcode-modal-btn"
            type="tertiary"
            @click="copyText"
            class="flex items-center gap-2 px-6 py-3 bg-primary-50 text-primary-500"
          >
            <Copy01Icon class="w-4 h-4 mr-1" />
            {{ localState.copyText }} Shortcode
          </UIButton>
        </div>
      </div>
    </UIModal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, inject, ref, computed } from "vue";
import {
  UIButton,
  UITooltip,
  UICard,
  UITextSmMedium,
  UITextMdMedium,
  UIModal,
  UIModalHeader,
  UISpin,
  UIInput,
  UISelect,
} from "@/ui";
import {
  RefreshCcw01Icon,
  LinkExternal01Icon,
  InfoCircleIcon,
  Phone01Icon,
  Monitor01Icon,
  CodeSquare01Icon,
  Copy01Icon,
  FileCheck02Icon,
  SunIcon,
  XIcon,
} from "@/icons";
import BackendService from "../../services";
import type { SettingResponse, BasicSettings } from "../../types";
import ReviewsWidgetPreview from "../ReviewsWidgetPreview.vue";
import { ensureHttps, pluginAssetUrl } from "@/helper";

interface WidgetConfig {
  id: string;
  name: string;
  status: string;
  type: string;
  thumbnailUrl?: string;
  widgetPosition: string;
  isDefault?: boolean;
}

interface WidgetListResponse {
  widgets: WidgetConfig[];
  totalCount: number;
}

const localState = reactive({
  loading: false,
  selectedWidget: "",
  deviceView: "desktop",
  widgets: [] as WidgetConfig[],
  loadingWidgets: false,
  loadingLeftPanel: false,
  loadingRightPanel: false,
  showEmbedModal: false,
  copyText: "Copy",
});

const lcOptions = inject("lcOptions") as SettingResponse;
const lcAdminSettings = inject("lcAdminSettings") as BasicSettings;

// Computed property for widget options
const widgetOptions = computed(() => {
  return localState.widgets
    .filter((w: WidgetConfig) => w.status !== "preview")
    .map((widget: WidgetConfig) => ({
      value: widget.id,
      label: widget.name,
    }));
});

// Function to handle widget selection change
const onWidgetSelectionChange = (value: string) => {
  localState.selectedWidget = value;
};

async function fetchWidgets() {
  try {
    localState.loadingWidgets = true;
    localState.loadingRightPanel = true;

    const response = await BackendService.ReviewsWidget.getReviewsWidgets(
      1,
      20,
    );

    // Handle the response format from lc_oauth_wp_remote_v2
    let data: WidgetListResponse;
    if (response.body && !response.error) {
      // Response from lc_oauth_wp_remote_v2 format
      data = response.body;
    } else {
      // Direct response format
      data = response;
    }

    localState.widgets = data.widgets || [];

    if (localState.widgets.length > 0) {
      // Sort widgets to put live widgets first
      localState.widgets.sort((a, b) => {
        if (a.status === "live" && b.status !== "live") return -1;
        if (a.status !== "live" && b.status === "live") return 1;
        return 0;
      });

      // Select the first live widget, or first non-preview widget if no live widgets
      const liveWidget = localState.widgets.find((w) => w.status === "live");
      const firstNonPreviewWidget = localState.widgets.find(
        (w) => w.status !== "preview",
      );

      if (liveWidget) {
        localState.selectedWidget = liveWidget.id;
      } else if (firstNonPreviewWidget) {
        localState.selectedWidget = firstNonPreviewWidget.id;
      }
    }
  } catch (error) {
    // Error fetching widgets
  } finally {
    localState.loadingWidgets = false;
    localState.loadingRightPanel = false;
  }
}

function refreshWidget() {
  fetchWidgets();
}

function toggleDevice(device?: "mobile" | "desktop" | "code") {
  if (device === "code") {
    localState.showEmbedModal = true;
  } else {
    localState.deviceView =
      localState.deviceView === "mobile" ? "desktop" : "mobile";
  }
}

function selectWidget(widgetId: string) {
  localState.loadingLeftPanel = true;
  localState.selectedWidget = widgetId;

  setTimeout(() => {
    localState.loadingLeftPanel = false;
  }, 3000);
}

function onWidgetLoaded() {
  localState.loadingLeftPanel = false;
}

function onWidgetError(error: string) {
  localState.loadingLeftPanel = false;
}

function onWidgetRetry() {
  localState.loadingLeftPanel = true;
}

const currentShortcode = computed(() => {
  const selectedWidget = localState.widgets.find(
    (w) => w.id === localState.selectedWidget,
  );
  const widgetId = selectedWidget ? localState.selectedWidget : "";
  const widgetName = selectedWidget ? selectedWidget.name : "Review Widget";

  return `[lc_reviews_widget id='${widgetId}' title='${widgetName}']`;
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

const openModalAndCopy = () => {
  localState.showEmbedModal = true;
};

onMounted(() => {
  fetchWidgets();
});
</script>

<style scoped>
.header-section,
.header-section * {
  font-family: "Inter", "Segoe UI", "Arial", sans-serif !important;
}
</style>

<style>
/* LC Reviews Widget responsive width classes */
.lc-reviews-widget-container {
  display: flex;
  flex-direction: column;
}

.lc-reviews-widget-left-panel {
  width: 100%;
}

.lc-reviews-widget-right-panel {
  width: 100%;
}

/* Desktop layout */
@media (min-width: 1024px) {
  .lc-reviews-widget-container {
    flex-direction: row;
  }

  .lc-reviews-widget-left-panel {
    width: 75%;
  }

  .lc-reviews-widget-right-panel {
    width: 25%;
  }
}
</style>
