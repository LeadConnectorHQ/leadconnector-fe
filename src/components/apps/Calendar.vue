<script setup lang="ts">
import { onMounted, reactive, h, inject, computed, ref, watch } from "vue";
import {
  UIButton,
  UIInput,
  UITable,
  renderIcon,
  UITooltip,
  UITextSmMedium,
  UITextSmRegular,
  UIModal,
  UIModalHeader,
} from "@/ui";

import BackendService from "../../services";
import type { SettingResponse, BasicSettings } from "../../types";
import {
  LinkExternal01Icon,
  RefreshCcw01Icon,
  InfoCircleIcon,
  FolderIcon,
  FileCheck02Icon,
  Copy01Icon,
} from "@/icons";
import { LC_PROD_BASE_URL } from "@/constants";
import { ensureHttps, formatSlotDuration } from "@/helper";
import NoDataAvailable from "./customValueComponents/NoDataAvailable.vue";

const localState = reactive({
  loading: true,
  searchQuery: "",
  pageSizes: [10, 20, 50, 100],
  currentPageSize: 10,
  currentPage: 1,
  skip: 0,
  totalCalendarsCount: 0,
  calendars: [],
  calendarGroups: [],
  groupsMap: new Map<string, string>(),
  showModal: false,
  selectedCalendar: {} as CalendarRow,
  copyText: "Copy",
});

const lcConnectionMethod = inject("lcConnectionMethod") as string;
const lcOptions = inject("lcOptions") as SettingResponse;
const lcAdminSettings = inject("lcAdminSettings") as BasicSettings;

let lcHost = lcOptions.white_label_url || lcAdminSettings.baseURL;

if (lcConnectionMethod == "api_key")
  lcHost = lcOptions.white_label_url || LC_PROD_BASE_URL;

interface CalendarRow {
  id: string;
  name: string;
  calendarType: string;
  slotDuration: number;
  slotDurationUnit: string;
  isActive: boolean;
  dateUpdated: string;
  groupId?: string;
  widgetSlug?: string;
  teamMembers?: Array<{
    userId: string;
    selected: boolean;
  }>;
}

interface CalendarGroup {
  id: string;
  name: string;
  description: string;
  slug: string;
  isActive: boolean;
  widgetType: string;
  dateAdded: string;
  dateUpdated: string;
}

const calendarTypes: Record<string, string> = {
  event: "Event",
  collective: "Collective",
  personal: "Personal",
  class_booking: "Class Booking",
  round_robin: "Round Robin",
  service_booking: "Service Booking",
};

const filteredCalendars = computed(() => {
  if (!localState.searchQuery.trim()) {
    return localState.calendars;
  }

  return localState.calendars.filter((calendar: CalendarRow) =>
    calendar.name.toLowerCase().includes(localState.searchQuery.toLowerCase()),
  );
});

const totalPageCount = computed(() => {
  const filteredCount = filteredCalendars.value.length;
  return Math.max(1, Math.ceil(filteredCount / localState.currentPageSize));
});

const paginatedCalendars = computed(() => {
  const startIndex = (localState.currentPage - 1) * localState.currentPageSize;
  const endIndex = startIndex + localState.currentPageSize;
  return filteredCalendars.value.slice(startIndex, endIndex);
});

function hasNoData() {
  return filteredCalendars.value.length === 0;
}

function getGroupName(groupId: string | undefined): string {
  if (!groupId) return "";
  return localState.groupsMap.get(groupId) || "";
}

const copyCalendarEmbed = (calendar: CalendarRow) => {
  localState.selectedCalendar = calendar;
  localState.showModal = true;
};

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
  const shortcode = buildCalendarShortcode(localState.selectedCalendar);
  copyCodeToClipboard(shortcode);
  localState.copyText = "Copied";
  setTimeout(() => {
    localState.copyText = "Copy";
  }, 3000);
};

function buildCalendarShortcode(calendar: CalendarRow): string {
  if (!calendar.id) return "";
  return `[leadconnector_calendar id="${calendar.id}"]`;
}

watch(
  () => localState.selectedCalendar,
  (val) => {
    if (
      localState.selectedCalendar &&
      Object.keys(localState.selectedCalendar).length > 0
    )
      localState.showModal = true;
  },
);

watch(
  () => localState.showModal,
  (val) => {
    if (!val) {
      localState.selectedCalendar = {} as CalendarRow;
    }
  },
);

const currentShortcode = computed(() => {
  return buildCalendarShortcode(localState.selectedCalendar);
});

const columnsHeadings = [
  {
    title: "Calendar Name",
    key: "name",
    render(row: CalendarRow) {
      return h(UITextSmRegular, row.name);
    },
  },
  {
    title: "Group",
    key: "group",
    render(row: CalendarRow) {
      const groupName = getGroupName(row.groupId);
      if (!groupName) {
        return h("div", { class: "text-sm text-gray-400" }, "");
      }

      return h(
        "div",
        {
          class:
            "inline-flex items-center border border-solid border-gray-200 rounded-md px-3 py-1.5 bg-white cursor-default",
        },
        [
          h(renderIcon(FolderIcon), {
            class: "w-5 h-5 text-gray-600",
            style: "width: 20px; height: 20px;",
          }),
          h(
            "span",
            {
              class: "ml-2 text-sm font-medium",
              style: "color: #344054;",
            },
            groupName,
          ),
        ],
      );
    },
  },
  {
    title: "Duration",
    key: "duration",
    render(row: CalendarRow) {
      return h(UITextSmRegular, formatSlotDuration(row.slotDuration));
    },
  },
  {
    title: "Type",
    key: "calendarType",
    render(row: CalendarRow) {
      return h(
        UITextSmRegular,
        calendarTypes[row.calendarType as keyof typeof calendarTypes],
      );
    },
  },
  {
    title: "Status",
    key: "status",
    render(row: CalendarRow) {
      return h(
        "div",
        {
          class: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            row.isActive
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`,
        },
        row.isActive ? "Active" : "Inactive",
      );
    },
  },
  {
    title: "Last Updated",
    key: "dateUpdated",
    render(row: CalendarRow) {
      const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      };

      const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
      };

      return h(
        "div",
        {
          class: "flex flex-col",
        },
        [
          h(
            UITextSmMedium,
            {
              style: "color: #475467;",
            },
            formatDate(row.dateUpdated),
          ),
          h(
            UITextSmRegular,
            {
              style: "color: #475467;",
            },
            formatTime(row.dateUpdated),
          ),
        ],
      );
    },
  },
  {
    title: "Shortcode",
    key: "shortCode",
    render(row: CalendarRow) {
      return h(
        UIButton,
        {
          id: `${row.id}`,
          type: "default",
          size: "medium",
          disabled: !row.isActive || (!row.widgetSlug && !row.id),
          text: true,
          onClick: () => copyCalendarEmbed(row),
        },
        { default: () => "Embed" },
      );
    },
  },
];

function redirectToCalendarSettings() {
  window.open(
    `${ensureHttps(lcHost as string)}/v2/location/${
      lcOptions.location_id
    }/settings/calendars`,
    "_blank",
  );
}

const getCalendars = async () => {
  try {
    const res = await BackendService.Calendar.getCalendars();
    if (res && res.body && Array.isArray(res.body.calendars)) {
      localState.calendars = res.body.calendars;
      localState.totalCalendarsCount = res.body.calendars.length;
    }
  } catch (error) {
  } finally {
    localState.loading = false;
  }
};
const getCalendarGroups = async () => {
  try {
    const res = await BackendService.Calendar.getCalendarGroups();
    if (res && res.body && Array.isArray(res.body.groups)) {
      localState.calendarGroups = res.body.groups;
      localState.groupsMap.clear();
      res.body.groups.forEach((group: CalendarGroup) => {
        localState.groupsMap.set(group.id, group.name);
      });
    }
  } catch {}
};

onMounted(async () => {
  await Promise.all([getCalendarGroups(), getCalendars()]);
});

function getPageDetails() {
  const filteredCount = filteredCalendars.value.length;
  const from = (localState.currentPage - 1) * localState.currentPageSize + 1;
  const to =
    localState.currentPage * localState.currentPageSize > filteredCount
      ? filteredCount
      : localState.currentPage * localState.currentPageSize;
  const total = filteredCount;

  return `Showing ${from} to ${to} of ${total} results`;
}

function pageChange(pageNumber: number) {
  localState.currentPage = pageNumber;
  localState.skip = (pageNumber - 1) * localState.currentPageSize;
}

function pageSizeChange(selectedSize: number) {
  localState.currentPage = 1;
  localState.skip = 0;
  localState.currentPageSize = selectedSize;
}

async function refreshCalendars() {
  localState.loading = true;
  await Promise.all([getCalendarGroups(), getCalendars()]);
  localState.currentPage = 1;
  localState.loading = false;
}

function handleSearchTextChange(searchQuery: string) {
  localState.searchQuery = searchQuery;
  localState.currentPage = 1;
  localState.skip = 0;
}
</script>

<template>
  <div class="header-section w-full pr-5">
    <div class="row title flex justify-between flex-row items-center">
      <div class="flex flex-col justify-center">
        <h2 class="text-xl font-sans font-medium mb-1">Calendar</h2>
        <span class="text max-w-[720px]">
          Give your customers an option to book your offerings
        </span>
      </div>
      <div class="flex flex-row gap-2">
        <UITooltip v-if="!hasNoData()" :placement="'bottom'" trigger="hover">
          <template #trigger>
            <UIButton id="refresh-btn" type="default" @click="refreshCalendars">
              <RefreshCcw01Icon class="w-4 h-4" /> &nbsp; Refresh
            </UIButton>
          </template>
          <div
            class="flex items-start gap-2 bg-gray-900 text-white p-3 rounded-lg max-w-[250px]"
          >
            <InfoCircleIcon class="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span
              >Calendar data is refreshed automatically. You can click the
              refresh button for an instant update.</span
            >
          </div>
        </UITooltip>
        <UIButton
          v-if="!hasNoData()"
          id="manage-btn"
          type="primary"
          @click="redirectToCalendarSettings"
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
        :data="paginatedCalendars"
        :loading="localState.loading"
        :enableTextSearch="true"
        :searchInputPlaceholder="'Calendar Name'"
        :pageCount="totalPageCount"
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
              @open-page-function="redirectToCalendarSettings"
              button-text="Add Calendar"
              heading="No Data Here"
              sub-title="Add calendar(s) on your account to see data here"
            />
          </div>
        </template>
      </UITable>
    </div>
  </div>

  <!-- Modal for Calendar Shortcode -->
  <UIModal
    :width="450"
    v-model:show="localState.showModal"
    className=" flex justify-center"
  >
    <template #header>
      <UIModalHeader
        id="lc-calendar-modal-header"
        @close="localState.showModal = false"
        :icon="FileCheck02Icon"
        style="z-index: 999"
      />
    </template>
    <div class="relative -top-5">
      <div class="flex flex-col">
        <div class="mt-3">
          <span class="text-xl font-medium"> Your calendar is ready </span>
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
              bookings.</b
            >
            Once the calendar is added to your website, any changes will be
            applied automatically.
          </span>
        </div>
      </div>
      <div class="mt-5 flex">
        <span class="text-sm"> Shortcode </span>
      </div>
      <div class="mt-3 flex flex-row items-center">
        <UIInput
          id="lc-calendar-modal-shortcode"
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
</template>

<style scoped>
.header-section,
.header-section * {
  font-family: "Inter", "Segoe UI", "Arial", sans-serif !important;
}
</style>

<style></style>
