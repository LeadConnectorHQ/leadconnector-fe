<script setup lang="ts">
import { inject, onMounted, reactive } from "vue";
import BackendService from "@/services";
import {
  UISwitch,
  UIInput,
  UISelect,
  type SelectBaseOption,
  UIButton,
  useNotification,
  UIAlert,
} from "@/ui";
import EmailsLoader from "./EmailsLoader.vue";
import type { BasicSettings, SettingResponse } from "@/types";
import { LinkExternal01Icon, CheckCircleIcon, CheckIcon } from "@/icons";
import EmailsIneligible from "./emails/EmailsIneligible.vue";
import { ensureHttps, pluginAssetUrl } from "@/helper";

const lcOptions = inject("lcOptions") as SettingResponse;
const lcAdminSettings = inject("lcAdminSettings") as BasicSettings;
const notification = useNotification();

const localState = reactive({
  loading: true,
  emails: [],
  selectedDomain: "",
  emailPrefix: "wp",
  activeDomains: [] as any[],
  activeDomainOptions: [] as SelectBaseOption[],
  isEnabled: false,
  isEligible: false,
  isLoading: false,
  showConflictWarning: false,
  conflictWarningMessage: "",
  hasMadeChanges: false,
});

onMounted(async () => {
  localState.loading = true;

  const emailEligibilityCheck =
    await BackendService.Emails.emailEligibilityCheck();

  if (emailEligibilityCheck.emailEnabled) {
    localState.isEligible = true;
    localState.isEnabled = true;

    if (emailEligibilityCheck.enabledEmailId) {
      const currentEmail = emailEligibilityCheck.enabledEmailId.split("@");
      localState.emailPrefix = currentEmail[0];
      localState.selectedDomain = currentEmail[1];
    } else {
      localState.hasMadeChanges = true;
    }
  } else {
    localState.hasMadeChanges = true;
    localState.isEligible = emailEligibilityCheck?.response.isEligible;
  }
  localState.activeDomains =
    emailEligibilityCheck?.response.availableActiveDomains;

  if (localState.activeDomains?.length >= 1) {
    if (!localState.selectedDomain)
      localState.selectedDomain = localState?.activeDomains[0]?.domain;

    let options: SelectBaseOption[] = [];

    localState.activeDomains?.forEach((domain: { domain: string }) => {
      options.push({
        value: domain.domain,
        label: domain.domain,
      });
    });
    localState.activeDomainOptions = options;
  }

  localState.loading = false;

  if (localState.isEligible) {
    const couldHaveConflictingPlugins =
      await BackendService.Emails.couldHaveConflictingPlugins();

    if (couldHaveConflictingPlugins.could_have_conflict) {
      localState.showConflictWarning = true;
      localState.conflictWarningMessage = `We detected that you have active plugin(s) ${couldHaveConflictingPlugins.plugins} that could conflict with our SMTP service. Please consider disabling the plugin(s) for a seamless experience.`;
    }
  }
});

const onEmailToggle = async () => {
  localState.isLoading = true;
  let toggle = localState.isEnabled;
  if (toggle) {
    try {
      const response = await BackendService.Emails.enableEmails(
        localState.selectedDomain,
        localState.emailPrefix,
      );

      if (response.success) {
        notification.success({
          title: "SMTP Service Enabled",
          description:
            "All your emails will be now be sent from the selected domain",
          duration: 5000,
        });
      } else {
        if (response.message) {
          notification.error({
            title: "Error",
            description: response.message,
            duration: 5000,
          });
        } else {
          notification.error({
            title: "Error",
            description: "Something went wrong. Please try contacting support",
            duration: 5000,
          });
        }
      }

      if (response.success) {
        localState.hasMadeChanges = false;
      }
    } catch (e) {
      notification.error({
        title: "Error",
        description: "Something went wrong. Please try again later",
        duration: 5000,
      });
    }
  } else {
    try {
      await BackendService.Emails.disableEmails(
        `${localState.emailPrefix}@${localState.selectedDomain}`,
      );

      notification.warning({
        title: "SMTP Service Disabled",
        description:
          "Your WordPress will no longer use LeadConnector to send emails",
        duration: 5000,
      });
    } catch (e) {
      notification.error({
        title: "Error",
        description: "Something went wrong. Please try again later",
        duration: 5000,
      });
    }
  }
  localState.isLoading = false;
};
</script>
<template>
  <div class="flex justify-between items-center mb-5">
    <div class="flex flex-col justify-center">
      <h2 class="text-xl font-sans font-medium mb-1">Email SMTP Service</h2>
      <span class="text">
        Effortless Email Delivery with Seamless SMTP Integration
      </span>
    </div>

    <div>
      <a
        :href="`${ensureHttps(lcOptions.white_label_url || (lcAdminSettings.baseURL as string))}/v2/location/${lcOptions.location_id}/settings/smtp_service`"
        target="_blank"
      >
        <UIButton id="manage-service" type="primary">
          Manage
          <LinkExternal01Icon class="w-4 h-4 ml-3" />
        </UIButton>
      </a>
    </div>
  </div>

  <EmailsLoader v-if="localState.loading" />
  <div v-if="localState.isEligible && !localState.loading">
    <div v-if="localState.showConflictWarning" class="mb-5">
      <UIAlert id="lc-conflict-warning" type="warning">
        <template #content>
          {{ localState.conflictWarningMessage }}
        </template>
      </UIAlert>
    </div>

    <div class="flex flex-row">
      <div class="w-1/2 flex flex-col">
        <div class="inline-flex flex-row justify-between lc-email-box">
          <div class="flex items-center">
            <img
              :src="
                pluginAssetUrl(
                  lcOptions.plugin_directory_url,
                  'images/lc-icon.png',
                )
              "
              alt="SMTP Service"
              class="circle rounded-full w-8 h-8"
            />
            <span class="text-base m-0 pl-3"> LeadConnector </span>
          </div>
          <div class="inline-flex pl-10">
            <UISwitch
              v-model:value="localState.isEnabled"
              @update:value="
                (toggle) => {
                  if (!toggle) onEmailToggle();
                }
              "
            />
          </div>
        </div>

        <div class="mt-5" v-if="localState.isEnabled">
          <span class="text-base"> Select Domain </span>

          <div class="pt-3">
            <UISelect
              id="lcSelectDomainForSMTP"
              :options="localState.activeDomainOptions"
              v-model:value="localState.selectedDomain"
              class="border border-gray-300 rounded-md outline-none"
              @update:value="localState.hasMadeChanges = true"
            >
            </UISelect>
          </div>

          <div class="mt-5">
            <span class="text-base"> Select Username </span>

            <div class="flex items-center pt-3">
              <div>
                <UIInput
                  id="lcEmailPrefix"
                  v-model:value="localState.emailPrefix"
                  class="border border-gray-300 rounded-md"
                  style="min-width: 20px"
                  @update:value="localState.hasMadeChanges = true"
                />
              </div>
              <div>
                <span class="px-1">@</span>
              </div>
              <UISelect
                disabled
                id="lcSelectDomainForSMTP"
                :options="localState.activeDomainOptions"
                v-model:value="localState.selectedDomain"
                class="border border-gray-300 rounded-md"
                @update:value="localState.hasMadeChanges = true"
              >
              </UISelect>
            </div>
          </div>
        </div>

        <div class="mt-5 flex justify-end" v-if="localState.isEnabled">
          <UIButton
            id="lcSaveEmailSettings"
            type="primary"
            @click="onEmailToggle"
            :disabled="!localState.hasMadeChanges"
            :loading="localState.isLoading"
          >
            Save
          </UIButton>
        </div>
      </div>

      <div class="w-1/2 pl-20">
        <div class="flex flex-col">
          <span class="text-xl font-medium"> Key Features </span>

          <div
            class="flex flex-col p-5 py-10 mt-5 border-1 border-solid border-gray-200 rounded-lg"
          >
            <span class="flex flex-row items-center text-base">
              <CheckIcon
                class="w-5 h-5 p-1 font-bold rounded-full bg-primary-100 text-primary-500"
              />
              <span class="ml-3">
                Integrate with your SMTP settings for seamless email delivery
              </span>
            </span>
            <span class="mt-5 flex flex-row items-center text-base">
              <CheckIcon
                class="w-5 h-5 p-1 font-bold rounded-full bg-primary-100 text-primary-500"
              />
              <span class="ml-3"> Create and manage email campaigns </span>
            </span>
            <span class="mt-5 flex flex-row items-center text-base">
              <CheckIcon
                class="w-5 h-5 p-1 font-bold rounded-full bg-primary-100 text-primary-500"
              />
              <span class="ml-3">
                Track email opens, clicks, and other engagement metrics
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-if="!localState.isEligible && !localState.loading">
    <EmailsIneligible />
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
