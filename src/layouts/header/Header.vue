<script setup lang="ts">
import { onMounted, provide, reactive, watch, computed } from "vue";
import {
  UITabs,
  UITabPane,
  UIButton,
  UIInput,
  UIAlert,
  UIPopselect,
  UISelect,
  type SelectBaseOption,
  useNotification,
  UIModal,
  UIModalHeader,
} from "@/ui";
import Funnels from "@/components/apps/Funnels.vue";
import ChatWidget from "@/components/apps/ChatWidget.vue";
import Emails from "@/components/apps/Emails.vue";
import BackendService from "@/services";
import { LC_SUPPORT_BUTTON_TEXT, LC_SUPPORT_URL } from "@/constants";
import {
  CheckCircleIcon,
  DotsVerticalIcon,
  AlertTriangleIcon,
  ChevronDownIcon,
} from "@/icons";
import Forms from "@/components/apps/Forms.vue";
import PhoneNumbers from "@/components/apps/PhoneNumbers.vue";
import Dashboard from "@/components/apps/Dashboard.vue";
import CustomValue from "@/components/apps/CustomValue.vue";
import Calendar from "@/components/apps/Calendar.vue";
import Surveys from "@/components/apps/surveys/Survey.vue";
import Quizzes from "@/components/apps/quizzes/Quizzes.vue";
import ReviewsWidget from "@/components/apps/ReviewsWidget.vue";

const notification = useNotification();

const props = defineProps({
  lcOptions: Object,
  connectionMethod: String,
});
const localState = reactive({
  loading: false,
  testingAPIKey: "",
  selectedMenuOption: "",
  activeTab: "dashboard",
  showDisconnectModal: false,
  disconnectInProgress: false,
  selectedMoreOption: "",
});

provide("lcOptions", props.lcOptions);
provide("lcConnectionMethod", props.connectionMethod);

const menuOptions = [
  {
    label: "Disconnect",
    value: "disconnect",
  },
] as SelectBaseOption[];

const openSupportPage = () => {
  window.open(LC_SUPPORT_URL, "_blank", "noopener,noreferrer");
};

const moreOptions = computed(
  () =>
    [
      {
        label: "Surveys",
        value: "surveys",
      },
      {
        label: "Quizzes",
        value: "quizzes",
      },
      // Add more items here as needed
    ] as SelectBaseOption[],
);

const isMoreOptionActive = computed(() => {
  return moreOptions.value.some(
    (option) => option.value === localState.activeTab,
  );
});

const currentMoreValue = computed(() => {
  return isMoreOptionActive.value ? localState.activeTab : undefined;
});

const onDisconnectLC = async () => {
  localState.disconnectInProgress = true;
  await BackendService.Auth.Disconnect();
  localState.disconnectInProgress = false;
  window.location.reload();
};

const saveAPIKey = async () => {
  localState.loading = true;
  await BackendService.Auth.SaveAPIKey(localState.testingAPIKey);
  localState.loading = false;
};

const openOAuth = async () => {
  await BackendService.OpenAuthorizationWall();
};

watch(
  () => localState.selectedMenuOption,
  (val) => {
    if (val === "disconnect") {
      localState.showDisconnectModal = true;
    }
  },
);

watch(
  () => localState.selectedMoreOption,
  (val) => {
    if (val) {
      // Activate the more tab to show the content
      localState.activeTab = "more";
      // Update URL to show the specific item name
      const url = new URL(window.location.href);
      url.searchParams.set("tab", val);
      window.history.pushState({}, "", url);
    }
  },
);

watch(
  () => localState.showDisconnectModal,
  (val) => {
    if (!val) {
      localState.selectedMenuOption = "";
    }
  },
);

function switchTab(tabName: string) {
  localState.activeTab = tabName;
}

function onTabSwitch(tabName: string) {
  const url = new URL(window.location.href);
  url.searchParams.set("tab", tabName);
  window.history.pushState({}, "", url);
}

watch(
  () => localState.activeTab,
  (val) => {
    // Reset selectedMoreOption when switching away from more tab
    if (val !== "more") {
      localState.selectedMoreOption = "";
      onTabSwitch(val);
    }
    // Don't call onTabSwitch for 'more' tab since URL is handled by selectedMoreOption watch
  },
);

onMounted(() => {
  const url = new URL(window.location.href);
  const tab = url.searchParams.get("tab");
  if (tab) {
    // If the tab is surveys or quizzes, set it as selectedMoreOption and activate more tab
    if (tab === "surveys" || tab === "quizzes") {
      localState.selectedMoreOption = tab;
      localState.activeTab = "more";
    } else {
      localState.activeTab = tab;
    }
  }
});
</script>

<template>
  <div class="header-section w-full">
    <div v-if="props.connectionMethod == 'api_key'" class="pb-4">
      <UIAlert id="upgrade-warning" type="warning" showIcon>
        <template #content>
          Connect your account to ensure you don't miss out on the latest
          features and updates
        </template>
        <template #actions>
          <div class="flex gap-2">
            <UIButton ghost :size="'small'" id="connect-btn" @click="openOAuth">
              Connect Now
            </UIButton>
          </div>
        </template>
      </UIAlert>
    </div>
    <div>
      <UIModal v-model:show="localState.showDisconnectModal">
        <template #header>
          <UIModalHeader
            :type="'warning'"
            title="Are you sure you want to disconnect LeadConnector ?"
            id="modal-header"
            :icon="AlertTriangleIcon"
            @close="localState.showDisconnectModal = false"
          />
        </template>
        <template #footer>
          <div class="flex justify-end pt-3">
            <UIButton
              id="disconnect-btn"
              ghost
              @click="() => (localState.showDisconnectModal = false)"
              class="mr-2"
            >
              Cancel
            </UIButton>

            <UIButton
              id="disconnect-btn"
              type="primary"
              @click="onDisconnectLC"
              v-bind:loading="localState.disconnectInProgress"
            >
              Disconnect
            </UIButton>
          </div>
        </template>
      </UIModal>
    </div>
    <div
      class="row title py-5 pt-0 flex-row flex align-middle justify-items-center justify-between"
    >
      <span class="text-3xl font-semibold flex m-0"> LeadConnector </span>

      <div class="flex items-center gap-2">
        <UIButton
          id="send-feedback-btn"
          ghost
          :size="'small'"
          class="lc-send-feedback-btn"
          @click="openSupportPage"
        >
          <span class="inline-flex items-center gap-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M14 7.667C14 11.244 11.244 14 7.667 14C6.978 14 6.311 13.878 5.689 13.656L2 14.667L3.011 11.022C2.756 10.378 2.556 9.689 2.511 8.956C2.5 8.856 2.5 8.756 2.5 8.667C2.5 5.089 5.089 2.5 8.667 2.5C12.244 2.5 14 5.089 14 7.667Z"
                stroke="currentColor"
                stroke-width="1.25"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span class="font-medium">{{ LC_SUPPORT_BUTTON_TEXT }}</span>
          </span>
        </UIButton>

        <div class="inline-flex items-center gap-2">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="shrink-0"
            >
              <rect
                width="24"
                height="24"
                rx="12"
                transform="matrix(1 0 0 -1 0 24)"
                fill="#FF692F"
              />
              <path
                d="M11.722 11.3392C11.4105 11.5191 11.2186 11.8516 11.2186 12.2113V15.567L8.45022 13.9687L8.46114 9.66222C8.46114 9.39926 8.32083 9.15622 8.09309 9.02476L6.53804 8.12702L11.8699 5.04869L17.2438 8.15121L11.722 11.3392ZM11.2186 18.563L5.84469 15.4603V9.30364L7.44167 10.2257V14.2598C7.44167 14.4399 7.53782 14.6064 7.6938 14.6965L11.2186 16.7315V18.563ZM18.7386 10.8173C19.0713 10.6523 19.2819 10.313 19.2819 9.94171V8.13911C19.2819 7.75755 18.8449 7.50713 18.7917 7.49216L12.2061 3.69004C11.9982 3.56986 11.7418 3.56986 11.5337 3.69004L4.85717 7.54475C4.85363 7.54678 4.85027 7.54914 4.84678 7.55117C4.84324 7.55316 4.83971 7.55486 4.83618 7.55689C4.62825 7.67691 4.5 7.89892 4.5 8.13911V15.8486C4.5 16.0888 4.62825 16.3107 4.83618 16.4309L11.5548 20.3098C11.6588 20.3698 11.7748 20.3999 11.8909 20.3999C12.0071 20.3999 12.1231 20.3698 12.2271 20.3098L18.9457 16.4309C19.1536 16.3107 19.2819 16.0888 19.2819 15.8486V13.1974L18.4213 13.6162C18.1251 13.7605 17.9372 14.061 17.9372 14.3903V15.4603L12.5633 18.563V12.4062L17.9372 9.30364V11.2143L18.7386 10.8173Z"
                fill="white"
              />
              <path
                d="M15.3316 11.8944V13.9686L14.1909 14.6272C13.9586 14.7614 13.8154 15.0093 13.8154 15.2777V16.0085L16.0879 14.6964C16.2439 14.6063 16.3401 14.4398 16.3401 14.2598V11.3946L15.3316 11.8944Z"
                fill="#686C75"
              />
            </svg>

            <span
              class="inline-flex items-center h-8 px-3 bg-success-50 border border-success-200 rounded-full text-sm text-success-700"
            >
              <span class="font-medium whitespace-nowrap">
                Connected to LeadConnector
              </span>
              <CheckCircleIcon class="w-4 h-4 ml-2 shrink-0 text-green-600" />
            </span>
        </div>

        <div class="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-gray-100">
          <UIPopselect
            id="more-options"
            trigger="click"
            placement="bottom-end"
            :options="menuOptions"
            v-model:value="localState.selectedMenuOption"
          >
            <DotsVerticalIcon class="w-4 h-4 cursor-pointer text-gray-600" />
          </UIPopselect>
        </div>
      </div>
    </div>
    <div class="row nav-bar">
      <UITabs
        :type="'line'"
        :animated="true"
        placement="top"
        primaryColor="#FF692F"
        v-model:value="localState.activeTab"
      >
        <UITabPane name="dashboard" tab="Dashboard">
          <Dashboard @switch-tab="switchTab" />
        </UITabPane>

        <UITabPane name="funnels" tab="Funnels">
          <Funnels />
        </UITabPane>

        <UITabPane
          name="forms"
          tab="Forms"
          v-if="props.connectionMethod === 'oauth'"
        >
          <Forms />
        </UITabPane>

        <UITabPane
          name="emails"
          tab="Email"
          v-if="props.connectionMethod === 'oauth'"
        >
          <Emails />
        </UITabPane>

        <UITabPane
          name="phone"
          tab="Phone Numbers"
          v-if="props.connectionMethod === 'oauth'"
        >
          <PhoneNumbers />
        </UITabPane>

        <UITabPane name="chat_widget" tab="Chat Widget">
          <ChatWidget :lc-options="props.lcOptions" />
        </UITabPane>

        <UITabPane name="custom_values" tab="Custom Values">
          <CustomValue />
        </UITabPane>
        <UITabPane name="calendar" tab="Calendar">
          <Calendar />
        </UITabPane>
        <UITabPane name="reviews_widget" tab="Reviews Widget">
          <ReviewsWidget />
        </UITabPane>

        <!-- More Dropdown Tab -->
        <UITabPane name="more" tab="">
          <template #tab>
            <UIPopselect
              id="more-dropdown"
              trigger="hover"
              placement="bottom-start"
              :options="moreOptions"
              @update:value="
                (val) => {
                  localState.selectedMoreOption = val;
                }
              "
            >
              <span
                class="flex items-center gap-1 cursor-pointer border-solid border-gray-300 rounded px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                @click.stop
              >
                More
                <ChevronDownIcon class="w-4 h-4" />
              </span>
            </UIPopselect>
          </template>

          <!-- Conditional content rendering based on selectedMoreOption -->
          <div v-if="localState.selectedMoreOption === 'surveys'">
            <Surveys />
          </div>
          <div v-else-if="localState.selectedMoreOption === 'quizzes'">
            <Quizzes />
          </div>
          <div v-else class="p-6 text-center text-gray-500">
            Select an option from the More dropdown
          </div>
        </UITabPane>
      </UITabs>
    </div>
  </div>
</template>

<style scoped>
.lc-send-feedback-btn {
  height: 32px;
  padding-left: 12px;
  padding-right: 12px;
}
</style>
