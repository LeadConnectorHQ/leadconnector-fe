<script setup lang="ts">
import { onMounted, reactive, h, inject, computed } from "vue";
import {
  UIButton,
  UITable,
  UITextSmMedium,
  renderIcon,
  UIModal,
  UIModalHeader,
  UIInput,
  UITooltip,
} from "@/ui";
import {
  LinkExternal01Icon,
  RefreshCcw01Icon,
  FolderIcon,
  Copy01Icon,
  FileCheck02Icon,
} from "@/icons";

import BackendService from "../../../services";
import type { SettingResponse, BasicSettings } from "../../../types";
import { LC_PROD_BASE_URL } from "@/constants";
import { ensureHttps, copyLCEmbedCode } from "@/helper";
import NoDataAvailable from "../customValueComponents/NoDataAvailable.vue";

// Types
interface QuizRow {
  id: string;
  name: string;
  dateUpdated: string;
  updatedBy: string;
  parentId?: string;
  folderName?: string;
  versionHistory?: any[];
}

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

// State
const localState = reactive({
  loading: true,
  searchQuery: "",
  foldersMap: new Map<string, string>(),
  pageSizes: [10, 20, 50, 100],
  currentPageSize: 10,
  currentPage: 1,
  totalPageCount: 1,
  totalQuizzesCount: 0,
  quizzes: [] as QuizRow[],
  allQuizzes: [] as QuizRow[],
  showModal: false,
  selectedQuiz: {} as QuizRow,
  copyText: "Copy",
  hasFolders: false,
  skip: 0,
});

// Injections
const lcConnectionMethod = inject("lcConnectionMethod") as string;
const lcOptions = inject("lcOptions") as SettingResponse;
const lcAdminSettings = inject("lcAdminSettings") as BasicSettings;

// Host configuration
let lcHost = lcOptions.white_label_url || lcAdminSettings.baseURL;
if (lcConnectionMethod === "api_key") {
  lcHost = lcOptions.white_label_url || LC_PROD_BASE_URL;
}

// Modal functions
function openQuizEmbedModal(quiz: QuizRow) {
  localState.selectedQuiz = quiz;
  localState.showModal = true;
}

function getEmbedCode() {
  return `[leadconnector_quiz id="${localState.selectedQuiz.id}" title="${localState.selectedQuiz.name}"]`;
}

function copyQuizEmbedCode() {
  const embedCode = getEmbedCode();

  copyLCEmbedCode(embedCode)
    .then(() => {
      localState.copyText = "Copied";
      setTimeout(() => {
        localState.copyText = "Copy";
      }, 3000);
    })
    .catch((error) => {
      console.error("Failed to copy embed code:", error);
      localState.copyText = "Copy Failed";
      setTimeout(() => {
        localState.copyText = "Copy";
      }, 3000);
    });
}

// Utility functions
function formatDate(date: string) {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
}

function hasNoData() {
  return localState.quizzes.length === 0;
}

// Table columns configuration
const baseColumns = [
  {
    title: "Name",
    key: "name",
  },
  {
    title: "Last Updated",
    key: "lastUpdated",
    render(row: QuizRow) {
      if (row.dateUpdated) {
        return h(
          "div",
          {
            class:
              "w-auto min-w-[200px] flex py-0.5 items-center whitespace-nowrap cursor-pointer",
          },
          [
            h(
              "span",
              {
                class:
                  "pr-2 whitespace-nowrap font-medium truncate max-w-[80%]",
              },
              formatDate(row.dateUpdated),
            ),
          ],
        );
      }
    },
  },
  {
    title: "Updated By",
    key: "updatedBy",
    render(row: QuizRow) {
      return h(
        "div",
        {
          class:
            "w-auto min-w-[200px] flex py-0.5 items-center whitespace-nowrap cursor-pointer",
        },
        [
          h(
            "span",
            {
              class: "pr-2 font-medium whitespace-nowrap truncate max-w-[80%]",
            },
            row.updatedBy,
          ),
        ],
      );
    },
  },
  {
    title: "Shortcode",
    align: "center" as const,
    key: "embed",
    render(row: QuizRow) {
      return h(
        UIButton,
        {
          id: `${row.id}`,
          type: "default",
          text: true,
          size: "medium",
          onClick: () => openQuizEmbedModal(row),
          class: "font-medium !text-primary-700",
        },
        () => "Embed",
      );
    },
  },
];

const folderColumn = {
  title: "Folder",
  key: "parentId",
  render(row: QuizRow) {
    if (row.parentId) {
      return h(
        "div",
        {
          class:
            "w-fit flex w-max-full border border-solid border-gray-300 max py-0.5 px-2 items-center rounded-md",
        },
        [
          h(renderIcon(FolderIcon), { style: "width:20px" }),
          h(
            "span",
            {
              class: "pl-2 py-0.5 font-medium whitespace-nowrap truncate",
              style: "max-width:250px",
              id: `${row.id}`,
            },
            localState.foldersMap.get(row.parentId) || row.folderName || "",
          ),
        ],
      );
    }
    return h("div", { style: "min-width:100px" });
  },
};

const columnsHeadings = computed(() => {
  const columns = [...baseColumns];

  // Insert folder column after Name column if there are folders
  if (localState.hasFolders) {
    columns.splice(1, 0, folderColumn);
  }

  return columns;
});

// Data fetching
async function getQuizzes(searchQuery: string = "") {
  localState.loading = true;

  let skip = 0;
  const limit = 10;
  let hasMore = true;
  const parentIds = new Set<string>();
  const allRawQuizzes: any[] = [];
  const allFolders: any[] = [];

  if (skip === 0) {
    localState.quizzes = [];
  }

  try {
    // Fetch all data in batches
    while (hasMore) {
      const res = await BackendService.Quizzes.getQuizzes(
        skip,
        limit,
        searchQuery,
      );

      if (res && res.error) {
        console.error("Quiz API error:", res);
        hasMore = false;
        break;
      }

      if (res && Array.isArray(res.body.forms)) {
        allRawQuizzes.push(
          ...res.body.forms.filter((item: any) => item.type !== "folder"),
        );
        allFolders.push(
          ...res.body.forms.filter((item: any) => item.type === "folder"),
        );

        if (res.body.forms.length < limit) {
          hasMore = false;
        } else {
          skip += limit;
        }
      } else {
        hasMore = false;
      }
    }

    // Build mappings from complete dataset
    const folderMap = allFolders.reduce((map, folder: any) => {
      map.set(folder._id, folder.name);
      return map;
    }, new Map<string, string>());

    const updatedByUserMap = allRawQuizzes
      .filter(
        (quiz: any) =>
          quiz.versionHistory?.[0]?.updatedByUser && quiz.updatedBy,
      )
      .reduce((map, quiz: any) => {
        map.set(quiz.updatedBy, quiz.versionHistory[0].updatedByUser);
        return map;
      }, new Map<string, string>());

    // Process quizzes with user name resolution
    const quizData: QuizRow[] = allRawQuizzes.map((quiz: any) => ({
      id: quiz._id,
      name: quiz.name,
      dateUpdated: quiz.dateUpdated,
      updatedBy:
        quiz.versionHistory?.[0]?.updatedByUser ||
        (quiz.updatedBy && updatedByUserMap.get(quiz.updatedBy)) ||
        quiz.updatedByUser ||
        quiz.updatedBy,
      parentId: quiz.parentId,
      folderName: quiz.parentId ? folderMap.get(quiz.parentId) : undefined,
    }));

    // Collect parent IDs
    quizData
      .filter((quiz) => quiz.parentId)
      .reduce((set, quiz) => set.add(quiz.parentId!), parentIds);

    // Update state
    localState.allQuizzes = quizData;
    localState.foldersMap = folderMap;
    localState.hasFolders = parentIds.size > 0;

    processData(searchQuery);
  } catch (error) {
    console.error("Error fetching quizzes:", error);
  } finally {
    localState.loading = false;
  }
}

// Data processing and pagination
function processData(searchQuery: string = "") {
  let filteredQuizzes = localState.allQuizzes;

  // Apply search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredQuizzes = localState.allQuizzes.filter(
      (quiz) =>
        quiz.name.toLowerCase().includes(query) ||
        quiz.updatedBy?.toLowerCase().includes(query) ||
        quiz.folderName?.toLowerCase().includes(query),
    );
  }

  // Calculate pagination
  const totalCount = filteredQuizzes.length;
  const totalPages = Math.ceil(totalCount / localState.currentPageSize);
  const startIndex = localState.skip;
  const endIndex = startIndex + localState.currentPageSize;

  // Get current page data
  const currentPageData = filteredQuizzes.slice(startIndex, endIndex);

  // Update state
  localState.quizzes = currentPageData;
  localState.totalQuizzesCount = totalCount;
  localState.totalPageCount = totalPages;
}

// Search handling
const handleSearchTextChange = (searchQuery: string) => {
  localState.searchQuery = searchQuery;
  localState.currentPage = 1;
  localState.skip = 0;
  processData(searchQuery);
};

// Pagination functions
function getPageDetails() {
  const from = (localState.currentPage - 1) * localState.currentPageSize + 1;
  const to =
    localState.currentPage * localState.currentPageSize >
    localState.totalQuizzesCount
      ? localState.totalQuizzesCount
      : localState.currentPage * localState.currentPageSize;
  const total = localState.totalQuizzesCount;

  return `Showing ${from} to ${to} of ${total} results`;
}

function pageChange(pageNumber: number) {
  localState.currentPage = pageNumber;
  localState.skip = (pageNumber - 1) * localState.currentPageSize;
  processData(localState.searchQuery);
}

function pageSizeChange(selectedSize: number) {
  localState.currentPage = 1;
  localState.skip = 0;
  localState.currentPageSize = selectedSize;
  processData(localState.searchQuery);
}

// Navigation functions
function redirectToManagerQuizzes() {
  window.open(
    `${ensureHttps(lcHost as string)}/v2/location/${lcOptions.location_id}/quiz-builder/main`,
    "_blank",
  );
}

function refreshQuizzes() {
  localState.allQuizzes = [];
  localState.currentPage = 1;
  localState.skip = 0;
  getQuizzes("").then(() => {
    // Apply current search filter after fetching all data
    if (localState.searchQuery.trim()) {
      processData(localState.searchQuery);
    }
  });
}

// Lifecycle
onMounted(async () => {
  await getQuizzes("");
});
</script>

<template>
  <div class="header-section w-full pr-5">
    <!-- Header Section -->
    <div class="row title flex justify-between flex-row items-center">
      <div class="flex flex-col justify-center">
        <h2 class="text-xl font-sans font-medium mb-1">Quizzes</h2>
        <span class="text max-w-[720px]">
          Create interactive quizzes to engage users, assess knowledge, and
          provide real-time results.
        </span>
      </div>
      <div v-if="!hasNoData()" class="flex flex-row gap-2">
        <UIButton id="refresh-btn" type="default" @click="refreshQuizzes">
          <RefreshCcw01Icon class="w-4 h-4" /> &nbsp; Refresh
        </UIButton>
        <UIButton
          id="manage-btn"
          type="primary"
          @click="redirectToManagerQuizzes"
        >
          Manage &nbsp;
          <LinkExternal01Icon class="w-4 h-4" />
        </UIButton>
      </div>
    </div>

    <!-- Content Section -->
    <div class="mt-5">
      <UITable
        :columns="columnsHeadings"
        :data="localState.quizzes"
        :loading="localState.loading"
        :enableTextSearch="true"
        :searchInputPlaceholder="'Search Quizzes'"
        :pageCount="localState.totalPageCount"
        :page="localState.currentPage"
        :pageSize="localState.currentPageSize"
        :pageSizes="localState.pageSizes"
        :search-text="localState.searchQuery"
        :showSizePicker="true"
        @update:searchText="handleSearchTextChange"
        @update:page="pageChange"
        @update:page-size="pageSizeChange"
        id="quizzes-table"
      >
        <template #footer-left>
          <UITextSmMedium class="text-gray-700">
            {{ getPageDetails() }}
          </UITextSmMedium>
        </template>
        <template #empty>
          <div class="text-center">
            <NoDataAvailable
              @open-page-function="redirectToManagerQuizzes"
              button-text="Manage Quizzes"
              heading="No Data Here"
              sub-title="Add Quizzes on your account to see data here"
            />
          </div>
        </template>
      </UITable>
    </div>

    <!-- Quiz Embed Modal -->
    <UIModal
      :width="450"
      v-model:show="localState.showModal"
      className="flex justify-center"
    >
      <template #header>
        <UIModalHeader
          id="lc-quizzes-modal-header"
          @close="localState.showModal = false"
          :icon="FileCheck02Icon"
          style="z-index: 999"
        />
      </template>
      <div class="relative -top-5">
        <div class="flex flex-col">
          <div class="mt-3">
            <span class="text-xl font-medium"> Your quiz is ready </span>
          </div>
          <div class="mt-1">
            <span class="text-base font-light">
              Now it's time to add it to your website
            </span>
          </div>
          <div class="pt-6">
            <span class="text-sm">
              <b
                >Paste this shortcode inside a WordPress page to start
                collecting responses.</b
              >
              Once the quiz is added to your website, any changes will be
              applied automatically.
            </span>
          </div>
        </div>

        <div class="mt-6">
          <span class="text-sm">Shortcode</span>
        </div>
        <div class="mt-3 flex flex-row items-center">
          <UIInput
            id="lc-quizzes-modal-shortcode"
            type="text"
            readonly
            class="outline-none w-full"
            :value="getEmbedCode()"
          />
          <div class="flex items-center w-auto">
            <UITooltip :placement="'top'" :trigger="'hover'">
              <template #trigger>
                <Copy01Icon
                  class="w-6 bg-white cursor-pointer ml-3"
                  @click="copyQuizEmbedCode"
                />
              </template>
              {{ localState.copyText }}
            </UITooltip>
          </div>
        </div>
      </div>
    </UIModal>
  </div>
</template>

<style scoped>
.header-section,
.header-section * {
  font-family: "Inter", "Segoe UI", "Arial", sans-serif !important;
}
</style>
