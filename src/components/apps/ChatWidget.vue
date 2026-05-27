<script setup lang="ts">
import { reactive, inject, onMounted, computed } from "vue";
import { MessageChatSquareIcon, LinkExternal01Icon, CheckIcon } from "@/icons";
import BackendService from "@/services";
import {
  UIButton,
  UICheckbox,
  UISwitch,
  useNotification,
  UISelect,
  UIAlert,
} from "@/ui";
import type { SettingResponse, BasicSettings } from "@/types";
import { ensureHttps } from "@/helper";

interface ChatWidget {
  value: string;
  label: string;
}

interface ChatWidgetState {
  loading: boolean;
  isTextWidgetEnabled: boolean;
  chatWidgets: ChatWidget[];
  selectedChatWidget: ChatWidget | null;
  chatWidgetChange: boolean;
  showMissingWidgetAlert: boolean;
  newChatWidgetSelected: boolean;
  currentChatWidget: ChatWidget | null;
}

const lcOptions = inject("lcOptions") as SettingResponse;
const lcAdminSettings = inject("lcAdminSettings") as BasicSettings;
const notification = useNotification();

const localState = reactive<ChatWidgetState>({
  loading: false,
  isTextWidgetEnabled: lcOptions?.enable_text_widget === "1",
  chatWidgets: [],
  selectedChatWidget: null,
  chatWidgetChange: false,
  showMissingWidgetAlert: false,
  newChatWidgetSelected: false,
  currentChatWidget: null,
});

const manageUrl = computed(
  () =>
    `${ensureHttps(
      lcOptions.white_label_url || (lcAdminSettings.baseURL as string),
    )}/v2/location/${lcOptions.location_id}/funnels-websites/chat-widget`,
);

const showNotification = (
  title: string,
  type: "success" | "warning" = "success",
) => {
  notification[type]({ title: "Chat Widget", meta: title, duration: 3000 });
};

const updateChatWidget = async () => {
  if (!localState.selectedChatWidget?.value) return;
  localState.chatWidgetChange = true;
  try {
    await BackendService.ChatWidget.SetSelectedChatWidget(
      localState.selectedChatWidget.value,
    );
    if (localState.showMissingWidgetAlert) {
      localState.showMissingWidgetAlert = false;
    }
  } finally {
    localState.chatWidgetChange = false;
  }
};

const pullAndSave = async () => {
  try {
    localState.loading = true;
    if (localState.isTextWidgetEnabled) {
      await BackendService.ChatWidget.EnableWidget();
      await getChatWidgets();
      showNotification("Chat Widget Enabled", "success");
    } else {
      await BackendService.ChatWidget.DisableWidget();
      showNotification("Chat Widget Disabled", "warning");
    }
    await updateChatWidget();
  } finally {
    localState.loading = false;
  }
};

const getChatWidgets = async () => {
  localState.chatWidgetChange = true;
  try {
    const { chatWidgets } = await BackendService.ChatWidget.GetChatWidgets();
    localState.chatWidgets = chatWidgets.map(({ _id, name }: any) => ({
      value: _id,
      label: name,
    }));
  } catch (error) {
    showNotification("Failed to fetch chat widgets", "warning");
  } finally {
    localState.chatWidgetChange = false;
  }
};

const setSelectedChatWidget = () => {
  if (!localState.isTextWidgetEnabled) return;

  const selectedWidgetId = localState.selectedChatWidget?.value || "";
  const currentWidget =
    localState.chatWidgets.find(
      (widget) => widget.value === selectedWidgetId,
    ) || null;
  localState.currentChatWidget = currentWidget;

  if (!selectedWidgetId) {
    localState.selectedChatWidget = null;
    return;
  }

  const widgetExists = localState.chatWidgets.some(
    (widget) => widget.value === selectedWidgetId,
  );
  if (!widgetExists) {
    localState.showMissingWidgetAlert = true;
    localState.selectedChatWidget = null;
  } else {
    localState.selectedChatWidget = currentWidget;
  }
  localState.chatWidgetChange = false;
};

const onChatToggle = async (toggle: boolean) => {
  if (localState.isTextWidgetEnabled === toggle) return; // Prevent duplicate calls
  localState.isTextWidgetEnabled = toggle;
  if (toggle) {
    setSelectedChatWidget();
  }
  await pullAndSave();
};

const fetchLcOptions = async () => {
  try {
    const { enable_text_widget, selected_chat_widget_id } =
      await BackendService.Common.GetLCOptions();
    localState.isTextWidgetEnabled = enable_text_widget == "1";
    localState.selectedChatWidget = selected_chat_widget_id
      ? { value: selected_chat_widget_id, label: "" }
      : null;
  } catch (error) {
    console.error("Failed to fetch LC options:", error);
    showNotification("Failed to fetch settings", "warning");
  }
};

const onChatWidgetChange = (value: string) => {
  const selectedWidget =
    localState.chatWidgets.find((widget) => widget.value === value) || null;
  localState.selectedChatWidget = selectedWidget;
  localState.newChatWidgetSelected = Boolean(
    selectedWidget &&
    selectedWidget.value !== (localState.currentChatWidget?.value || ""),
  );
};

const saveNewWidget = async () => {
  localState.chatWidgetChange = true;
  try {
    await updateChatWidget();
    localState.currentChatWidget = localState.selectedChatWidget;
    localState.newChatWidgetSelected = false;
    showNotification("Chat widget updated successfully");
  } catch (error) {
    console.error("Failed to save chat widget:", error);
    showNotification("Failed to save chat widget", "warning");
  } finally {
    localState.chatWidgetChange = false;
  }
};

onMounted(async () => {
  localState.loading = true;
  try {
    await Promise.all([getChatWidgets(), fetchLcOptions()]);
    setSelectedChatWidget();
  } finally {
    localState.loading = false;
  }
});
</script>

<template>
  <UIAlert
    id="widgetMissingAlert"
    type="error"
    :closable="false"
    v-if="localState.showMissingWidgetAlert"
  >
    <template #title>
      <b>Chat Widget Not Found</b>: The selected chat widget has been deleted
      from your account. Please select a new widget to continue.
    </template>
  </UIAlert>

  <div class="chat-widget">
    <div class="flex justify-between items-center">
      <div class="flex flex-col justify-center">
        <h2 class="text-xl font-sans font-medium mb-1">Chat Widget</h2>
        <span class="text"
          >Engage visitors instantly and capture leads in real time</span
        >
      </div>

      <div>
        <a :href="manageUrl" target="_blank">
          <UIButton id="manage-service" type="primary">
            Manage
            <LinkExternal01Icon class="w-4 h-4 ml-3" />
          </UIButton>
        </a>
      </div>
    </div>

    <div class="row pt-5 flex flex-row justify-between">
      <div class="w-1/2">
        <div class="flex flex-col w-full rounded-md lc-card-border bg-white">
          <div
            class="flex flex-row items-center w-full border-b p-4 border-gray-200 justify-between"
          >
            <div class="flex items-center justify-between w-full">
              <div class="flex items-center">
                <MessageChatSquareIcon class="h-6 w-6 pr-3" />
                <span class="block text-base">Chat Widget</span>
              </div>
              <div class="pr-9">
                <UISwitch
                  :loading="localState.loading"
                  :value="localState.isTextWidgetEnabled"
                  @update:value="onChatToggle"
                />
              </div>
            </div>
          </div>

          <div class="px-5 pt-5" v-if="localState.isTextWidgetEnabled">
            <UISelect
              id="select-widget-location"
              placeholder="Select Chat Widget"
              :options="localState.chatWidgets"
              :value="
                !localState.loading
                  ? localState.selectedChatWidget?.value || undefined
                  : undefined
              "
              @update:value="onChatWidgetChange"
              :loading="localState.chatWidgetChange"
            />
          </div>

          <div
            class="flex justify-end px-5 pb-5 pt-8"
            v-if="localState.isTextWidgetEnabled"
          >
            <UIButton
              id="save-widget"
              :disabled="!localState.newChatWidgetSelected"
              class="pl-3 pr-3"
              type="primary"
              @click="saveNewWidget"
              :loading="localState.chatWidgetChange"
            >
              <span class="ml-6 mr-6">Save</span>
            </UIButton>
          </div>
        </div>
      </div>

      <div class="w-1/2 pl-20">
        <div class="flex flex-col">
          <span class="text-xl font-medium">Key Features</span>

          <div
            class="flex flex-col p-5 py-10 mt-5 border-1 border-solid border-gray-200 rounded-lg"
          >
            <span class="flex flex-row items-center text-base">
              <CheckIcon
                class="w-5 h-5 p-1 font-bold rounded-full bg-primary-100 text-primary-500"
              />
              <span class="ml-3"
                >Customize chat prompts, colors, and branding</span
              >
            </span>
            <span class="mt-5 flex flex-row items-center text-base">
              <CheckIcon
                class="w-5 h-5 p-1 font-bold rounded-full bg-primary-100 text-primary-500"
              />
              <span class="ml-3">View and respond to messages</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
