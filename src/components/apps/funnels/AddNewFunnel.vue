<script setup lang="ts">
import { onMounted, reactive, watch, inject, computed } from "vue";
import {
  UIModal,
  UIAlert,
  UIButton,
  UIModalFooter,
  UIModalHeader,
  UISelect,
  UICheckbox,
  UIInput,
  UITooltip,
} from "@/ui";
import type { SelectBaseOption } from "@/ui";
import BackendService from "@/services";
import type {
  Funnel,
  BasicSettings,
  SettingResponse,
  FunnelStep,
  LeadConnectorPost,
} from "@/types";
import { LC_PROD_BASE_URL } from "@/constants";
import { LinkExternal01Icon, PlusIcon, PlusSquareIcon } from "@/icons";
import { ensureHttps } from "@/helper";

const emit = defineEmits(["fetch-funnels", "modal-close"]);
const lcConnectionMethod = inject("lcConnectionMethod") as string;

const props = defineProps<{
  editPost?: LeadConnectorPost;
  mode?: string;
}>();

function getDefaultFormFields() {
  return {
    templateId: -1,
    selectedFunnelId: "",
    selectedStepId: "",
    selectedPageDisplayMethod: "",
    shouldIncludeTrackingCode: true,
    shouldIncludeFavicon: true,
    customSlug: "",
    previewURL: "",
    errorMessage: "",
    disableDefaultLayoutCheckbox: true,
    shouldIncludeDefaultWordPressLayout: false,
    swtichFlipedUsingDefaultLayout: false,
    importLoading: false,
  };
}

const localState = reactive({
  loading: true,
  showModal: false,
  funnelsList: [] as Funnel[],
  funnelOptions: [] as SelectBaseOption[],
  stepOptions: [] as SelectBaseOption[],
  selectedFunnel: {} as Funnel,
  selectedStep: {} as FunnelStep,
  ...getDefaultFormFields(),
});

function resetFormFields() {
  Object.assign(localState, getDefaultFormFields());
  localState.stepOptions = [];
}
/**
 * Function to get the website host url (origin)
 */
const websiteUrl = computed(() => {
  return window.location.origin; // this will be the website url
});

const importSelectedFunnel = async () => {
  localState.importLoading = true;
  const selectedFunnel = localState.funnelsList.find(
    (funnel) => (funnel._id || funnel.id) == localState.selectedFunnelId,
  );
  let selectedStep = null;

  if (lcConnectionMethod == "api_key")
    selectedStep = selectedFunnel?.pages.find(
      (step) => step.id == localState.selectedStepId,
    );
  else
    selectedStep = selectedFunnel?.steps.find(
      (step) => step.id == localState.selectedStepId,
    );

  const dataObj = {
    leadconnector_funnel_name: selectedFunnel?.name,
    leadconnector_step_url: localState.previewURL,
    leadconnector_slug: localState.customSlug,
    leadconnector_step_id: localState.selectedStepId,
    leadconnector_funnel_id: localState.selectedFunnelId,
    leadconnector_step_name: selectedStep?.name,
    leadconnector_step_page_id: Array.isArray(selectedStep?.pages)
      ? selectedStep.pages[0]
      : null,
    template_id: localState.templateId, // -1, Currently Unavailable
    leadconnector_display_method: localState.selectedPageDisplayMethod,
    leadconnector_step_meta: null, //  selectedStep?.meta,  Currently Unavailable
    leadconnector_step_page_download_url: null, // selectedStep?.pageDataDownloadURL,
    leadconnector_include_tracking_code: localState.shouldIncludeTrackingCode,
    leadconnector_use_site_favicon: localState.shouldIncludeFavicon,
    leadconnector_funnel_tracking_code: {
      headerCode: btoa(selectedFunnel?.trackingCodeHead || ""),
      footerCode: btoa(selectedFunnel?.trackingCodeBody || ""),
    },
    leadconnector_include_wp_headers_and_footers:
      localState.shouldIncludeDefaultWordPressLayout,
  };

  const response = await BackendService.Funnels.ImportNewFunnel(dataObj);

  localState.importLoading = false;

  if (response.error) {
    localState.errorMessage = response.message;
    return false;
  }

  resetFormFields();
  emit("fetch-funnels");
  return true;
};

const lcOptions = inject("lcOptions") as SettingResponse;
const lcAdminSettings = inject("lcAdminSettings") as BasicSettings;

const showModal = () => {
  resetFormFields();
  localState.showModal = true;
};
const cancelCallback = () => {
  localState.showModal = false;
  resetFormFields();
  emit("modal-close");
};

const submitCallback = async () => {
  const hasImported = await importSelectedFunnel();

  if (hasImported) {
    localState.showModal = false;
    localState.errorMessage = "";
    emit("modal-close");
  }
};

const pageDisplayOptions = [
  {
    value: "iframe",
    label: "Embed Full Page Iframe",
  },
  {
    value: "redirect",
    label: "Redirect to Funnel URL",
  },
  {
    value: "native",
    label: "Native HTML Embed",
  },
] as SelectBaseOption[];

onMounted(async () => {
  localState.loading = true;
  const funnelsList = (await BackendService.Funnels.getFunnelsList()).funnels;
  let options: SelectBaseOption[] = [];

  funnelsList?.forEach((funnel: Funnel) => {
    options.push({
      value: funnel.id || funnel._id,
      label: funnel.name,
    });
  });

  localState.funnelOptions = options;
  if (props.mode == "edit" && props.editPost) {
    localState.selectedFunnelId = props.editPost.leadconnector_funnel_id as string;
  }
  localState.funnelsList = funnelsList;

  if (props.mode == "edit" && props.editPost) {
    localState.templateId = props.editPost.template_id as number;
    localState.selectedStepId = props.editPost.leadconnector_step_id as string;

    localState.selectedPageDisplayMethod = props.editPost
      .leadconnector_display_method as string;
    localState.shouldIncludeTrackingCode =
      props.editPost.leadconnector_include_tracking_code == "1" ? true : false;
    localState.shouldIncludeFavicon =
      props.editPost.leadconnector_use_site_favicon == "1" ? true : false;
    // localState.shouldIncludeFavicon = props.editPost.;
    localState.customSlug = props.editPost.slug as string;
    localState.showModal = true;

    let lcHost = lcOptions.white_label_url || lcAdminSettings.baseURL;
    if (lcConnectionMethod == "api_key")
      lcHost = lcOptions.white_label_url || LC_PROD_BASE_URL;

    localState.previewURL = props.editPost.funnel_step_url as string;
    localState.shouldIncludeDefaultWordPressLayout =
      props.editPost.leadconnector_include_wp_headers_and_footers == "1" ? true : false;
  }

  localState.loading = false;
});
watch(
  () => localState.selectedFunnelId,
  async (newVal: string) => {
    const selectedFunnel = localState.funnelsList.find(
      (funnel) => (funnel._id || funnel.id) == newVal,
    );
    const stepOptions: SelectBaseOption[] = [];

    const availableSteps: string[] = [];
    const getStepIdByPageId: { [key: string]: string } = {};

    if (lcConnectionMethod == "api_key") {
      // const stepsResponse = await BackendService.Funnels.getV1FunnelDetails(newVal);

      selectedFunnel?.pages?.forEach((step) => {
        stepOptions.push({
          value: step.id,
          label: step.name,
        });
        availableSteps.push(step.id);
      });
    } else {
      selectedFunnel?.steps.forEach((step) => {
        stepOptions.push({
          value: step.id,
          label: step.name,
        });
        availableSteps.push(step.id);
        getStepIdByPageId[step.pages?.[0]] = step.id;
      });
    }

    if (props.mode == "edit" && props.editPost) {
      if (getStepIdByPageId[localState.selectedStepId]) {
        localState.selectedStepId =
          getStepIdByPageId[localState.selectedStepId];
      }
    }
    const stepIdStillValid = availableSteps.some(
      (id) => id == localState.selectedStepId,
    );
    if (!stepIdStillValid && stepOptions.length > 0) {
      localState.selectedStepId = stepOptions[0]?.value as string;
    }
    localState.stepOptions = stepOptions;
  },
);

/**
 * Function to disable the default layout checkbox based on the selected page display method
 */
watch(
  () => localState.selectedPageDisplayMethod,
  (newVal: string) => {
    if (newVal == "native") {
      localState.disableDefaultLayoutCheckbox = false;
    } else {
      localState.shouldIncludeDefaultWordPressLayout = false;
      localState.disableDefaultLayoutCheckbox = true;
    }
  },
);

/**
 * Function to enable the favicon checkbox if the default layout checkbox is enabled
 * and disable the favicon checkbox if the default layout checkbox is disabled
 * and also flip the favicon checkbox if the default layout checkbox is enabled and disabled
 * and also flip the default layout checkbox if the favicon checkbox is enabled and disabled
 */
watch(
  () => localState.shouldIncludeDefaultWordPressLayout,
  (newVal: boolean) => {
    if (newVal && !localState.shouldIncludeFavicon) {
      localState.shouldIncludeFavicon = true;
      localState.swtichFlipedUsingDefaultLayout = true;
    } else if (!newVal && localState.swtichFlipedUsingDefaultLayout) {
      localState.shouldIncludeFavicon = false;
      localState.swtichFlipedUsingDefaultLayout = false;
    }
  },
);

watch(
  () => localState.selectedStepId,
  (selectedStepId: string) => {
    if (!selectedStepId) return;

    let stepPage = "";
    let lcHost = lcOptions.white_label_url || lcAdminSettings.baseURL;

    if (lcConnectionMethod == "api_key") {
      stepPage = selectedStepId;
      lcHost = lcOptions.white_label_url || LC_PROD_BASE_URL;
    } else {
      const selectedFunnel = localState.funnelsList.find(
        (funnel) => funnel._id == localState.selectedFunnelId,
      );
      stepPage = selectedFunnel?.steps.find((step) => step.id == selectedStepId)
        ?.pages?.[0];
    }
    if (stepPage) {
      localState.previewURL = `${ensureHttps(lcHost as string)}/v2/preview/${stepPage}`;
    } else {
      localState.previewURL = "";
    }
  },
);

const areSettingsValid = computed(
  () =>
    localState.selectedFunnelId &&
    localState.selectedStepId &&
    localState.selectedPageDisplayMethod &&
    localState.customSlug,
);
</script>

<template>
  <div>
    <UIButton
      id="add-funnel-btn"
      type="primary"
      @click="showModal"
      v-if="props.mode != 'edit'"
    >
      <PlusIcon class="w-4 h-4 mr-3" />
      Add New Page
    </UIButton>
    <UIModal
      :width="600"
      :zIndex="undefined"
      :to="undefined"
      :autoFocus="false"
      :maskClosable="true"
      :closeOnEsc="undefined"
      @onMaskClick="cancelCallback"
      @onEsc="cancelCallback"
      v-model:show="localState.showModal"
      className="fixed top-10 left-0 right-0 flex justify-center"
    >
      <template #header>
        <UIModalHeader
          :type="'success'"
          :title="props?.mode == 'edit' ? 'Edit Page' : 'Add New Page'"
          @close="cancelCallback"
          id="modal-header"
        />
      </template>

      <div
        v-if="
          !localState.loading &&
          localState.selectedFunnelId &&
          !localState.funnelOptions.find(
            (opt) => opt.value === localState.selectedFunnelId,
          )
        "
        class="mb-5"
      >
        <UIAlert
          type="warning"
          :closable="false"
          showIcon
          id="funnel-not-found-alert"
        >
          <template #content>
            <div class="flex flex-col">
              <span class="text-sm"
                >Selected funnel is no longer available in your account</span
              >
            </div>
          </template>
        </UIAlert>
      </div>

      <div
        class="flex flex-col overflow-y-auto max-h-[75vh] pr-3 custom-scrollbar px-2"
      >
        <div class="flex flex-col pb-5">
          <label for="funnel-select" class="text-sm font-sans font-medium pb-3">
            Select Funnel
          </label>
          <UISelect
            id="funnel-select"
            :options="localState.funnelOptions"
            v-model:value="localState.selectedFunnelId"
          />
        </div>
        <div class="flex flex-col pb-5">
          <label for="funnel-select" class="text-sm font-sans font-medium pb-3">
            Select Step
          </label>
          <UISelect
            id="funnel-select"
            :options="localState.stepOptions"
            :disabled="!localState.stepOptions?.length"
            v-model:value="localState.selectedStepId"
          />
        </div>

        <div class="flex flex-col pb-5">
          <label for="funnel-select" class="text-sm font-sans font-medium pb-3">
            Page Display Method</label
          >
          <UISelect
            id="funnel-select"
            :options="pageDisplayOptions"
            :disabled="!localState.selectedStepId"
            v-model:value="localState.selectedPageDisplayMethod"
          />
        </div>

        <div class="flex flex-col pb-5">
          <label for="funnel-select" class="text-sm font-sans font-medium pb-3">
            Tracking Code
          </label>
          <UICheckbox
            v-model:checked="localState.shouldIncludeTrackingCode"
            id="tracking-code-checkbox"
            :disabled="undefined"
          >
            Include Tracking Code
          </UICheckbox>
          <span class="text-xs text-gray-500">
            If enabled, the tracking code in funnel will track wordpress as well
          </span>
        </div>

        <div class="flex flex-col pb-5">
          <label for="funnel-select" class="text-sm font-sans font-medium pb-3">
            Favicon
          </label>
          <UICheckbox
            v-model:checked="localState.shouldIncludeFavicon"
            id="favicon-code-checkbox"
            :disabled="undefined"
          >
            Use site favicon
          </UICheckbox>
          <span class="text-xs text-gray-500">
            If enabled, funnel will use wordpress site favicon
          </span>
        </div>

        <div class="flex flex-col pb-5">
          <label for="funnel-select" class="text-sm font-sans font-medium pb-3">
            Default Layout
          </label>
          <UITooltip
            :placement="'top-start'"
            :show="localState.disableDefaultLayoutCheckbox ? undefined : false"
            :trigger="'hover'"
          >
            <template #trigger>
              <UICheckbox
                v-model:checked="localState.shouldIncludeDefaultWordPressLayout"
                id="default-layout-checkbox"
                :disabled="localState.disableDefaultLayoutCheckbox"
              >
                Keep my WordPress header and footer intact
              </UICheckbox>
            </template>
            This feature functions properly only when your "Page Display Method"
            <br />
            is configured to Native HTML Embed.
          </UITooltip>
          <span class="text-xs text-gray-500">
            If enabled, funnel will use wordpress site header and footer
          </span>
        </div>

        <div class="flex flex-col pb-5">
          <label
            for="custom-slug-input"
            class="text-sm font-sans font-medium pb-3"
          >
            Custom Slug
          </label>
          <UIInput
            id="custom-slug-input"
            :disabled="!localState.selectedStepId"
            v-model:value="localState.customSlug"
          />
          <span class="text-xs text-gray-500 pt-2">
            {{ websiteUrl }}/{{ localState.customSlug }}</span
          >
        </div>

        <div class="flex flex-col pb-5">
          <label
            for="preview-url-field"
            class="text-sm font-sans font-medium pb-3"
          >
            Preview URL
          </label>
          <UIInput
            id="preview-url-field"
            :disabled="true"
            :readonly="true"
            v-bind:value="localState.previewURL"
          />
          <span class="text-xs text-gray-500 pt-2"> For reference only* </span>
        </div>
      </div>

      <div>
        <UIAlert
          :id="'alert'"
          :type="'error'"
          :closable="false"
          v-if="localState.errorMessage != ''"
        >
          <template #content> {{ localState.errorMessage }}</template>
        </UIAlert>
      </div>
      <template #footer>
        <UIModalFooter
          :positiveText="'Save Page'"
          :loading="localState.importLoading"
          @positive-click="submitCallback"
          v-bind:disabled="localState.loading || !areSettingsValid"
          id="modal-footer"
          :type="'primary'"
          :disableNegativeBtn="false"
        >
        </UIModalFooter>
      </template>
    </UIModal>
  </div>
</template>

<style>
#custom-slug-input input:focus {
  outline: none !important;
  border: none !important;
  box-shadow: none !important;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

/* Firefox */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f1f1f1;
}
</style>
