<template>
  <div class="lc-reviews-widget-preview-container">
    <div :class="containerClasses" :style="containerStyles">
      <div :class="contentClasses">
        <iframe
          v-if="iframeSrc"
          ref="iframeRef"
          :key="iframeKey"
          :src="iframeSrc"
          class="lc_reviews_widget"
          :style="iframeStyles"
          frameborder="0"
          scrolling="no"
          title="Review Widget Preview"
          @load="onIframeLoad"
          @error="onIframeError"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";

interface Props {
  widgetId?: string;
  locationId?: string;
  deviceView?: "mobile" | "desktop";
  scriptUrl?: string;
  baseUrl?: string;
  widgetType?: string;
  widgetPosition?: string;
}

interface Emits {
  loaded: [];
  error: [error: string];
  retry: [];
}

import { config } from "../config";

const props = withDefaults(defineProps<Props>(), {
  widgetId: "",
  locationId: "",
  deviceView: "desktop",
  scriptUrl: config.LEAD_CONNECTOR_REPUTATION_WIDGET_SCRIPT_URL,
  baseUrl: config.LEAD_CONNECTOR_REPUTATION_WIDGET_BASE_URL,
  widgetType: "",
  widgetPosition: "",
});

const emit = defineEmits<Emits>();

const iframeLoaded = ref(false);
const iframeKey = ref(0);
const iframeRef = ref<HTMLIFrameElement | null>(null);
let scriptLoaded = false;
const iframeHeight = ref(0);

const iframeSrc = computed(() => {
  if (!props.widgetId) return "";
  return `${props.baseUrl}/${props.locationId}?widgetId=${props.widgetId}&source=lcwordpress&isPreview=true`;
});

const containerClasses = computed(() =>
  ["w-full", props.deviceView === "mobile" && "max-w-[400px] mx-auto"].filter(
    Boolean,
  ),
);

const contentClasses = computed(() =>
  [
    "lc-reviews-widget-content",
    props?.widgetType,
    props?.widgetPosition,
    props.deviceView === "mobile" ? "mobile" : "desktop",
  ].filter(Boolean),
);

const containerStyles = computed(() => ({
  height: "100%",
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const iframeStyles = computed(() => {
  const baseStyles: Record<string, string> = {
    border: "none",
    display: "block",
    height:
      iframeHeight.value > 0
        ? `${iframeHeight.value + (props.widgetType === "flash" ? 0 : 100)}px`
        : "auto",
  };

  // Only add width-related styles for non-flash widgets
  if (props.widgetType !== "flash") {
    baseStyles["min-width"] = "100%";
    baseStyles["width"] = "100%";
  }

  // Only apply mobile width overrides for non-flash widgets
  if (props.deviceView === "mobile" && props.widgetType !== "flash") {
    return {
      ...baseStyles,
      width: "400px",
      "max-width": "400px",
      margin: "0 auto",
    };
  }

  return baseStyles;
});
// Helper function to check if widget position is bottom-related
const isBottomPosition = (position: string): boolean => {
  return (
    position === "bottom" ||
    position === "bottom-right" ||
    position === "bottom-left"
  );
};

// Function to ensure bottom position stays at 2% for flash widgets (only on height change)
const ensureBottomPositionOnHeightChange = () => {
  if (
    props.widgetType === "flash" &&
    isBottomPosition(props.widgetPosition) &&
    iframeRef.value
  ) {
    // Only set bottom to 2% when height changes
    iframeRef.value.style.setProperty("bottom", "2%", "important");
    return true;
  }
  return false;
};

const loadReviewWidgetScript = (): void => {
  if (scriptLoaded) return;

  const existingScript = document.querySelector(
    'script[src*="review-widget.js"]',
  );
  if (existingScript) {
    scriptLoaded = true;
    return;
  }

  const script = document.createElement("script");
  script.type = "text/javascript";
  script.src = props.scriptUrl;
  script.async = true;
  script.onload = () => {
    scriptLoaded = true;
  };
  document.head.appendChild(script);
};

const handleIframeMessage = (event: MessageEvent): void => {
  if (event.data && Array.isArray(event.data)) {
    const [eventName, data] = event.data;

    if (
      (eventName === "lc.setHeight" || eventName === "lc.setFlashHeight") &&
      data?.id === "lc_reviews_widget" &&
      data?.height
    ) {
      // Only update if height actually changed
      if (iframeHeight.value !== data.height) {
        iframeHeight.value = data.height;

        // For flash widgets, ensure bottom position when height changes
        if (props.widgetType === "flash") {
          ensureBottomPositionOnHeightChange();
        }
      }
    }
  } else if (event.data && typeof event.data === "object") {
    // Handle direct height messages
    if (event.data.height && props.widgetType === "flash") {
      // Only update if height actually changed
      if (iframeHeight.value !== event.data.height) {
        iframeHeight.value = event.data.height;

        ensureBottomPositionOnHeightChange();
      }
    }
  }
};

const onIframeLoad = (): void => {
  iframeLoaded.value = true;
  emit("loaded");
  loadReviewWidgetScript();
  window.addEventListener("message", handleIframeMessage);

  // Set initial bottom position for flash widgets with bottom positions
  if (
    props.widgetType === "flash" &&
    isBottomPosition(props.widgetPosition) &&
    iframeRef.value
  ) {
    iframeRef.value.style.setProperty("bottom", "2%", "important");
  }
};

const onIframeError = (): void => {
  const errorMsg = "Failed to load widget iframe";
  emit("error", errorMsg);
};

watch(iframeHeight, (newHeight) => {
  if (
    props.widgetType === "flash" &&
    isBottomPosition(props.widgetPosition) &&
    newHeight > 0
  ) {
    ensureBottomPositionOnHeightChange();
  }
});

watch(
  () => props.widgetId,
  (newWidgetId) => {
    if (newWidgetId) {
      iframeLoaded.value = false;
    }
  },
);

watch(
  () => props.deviceView,
  () => {
    iframeLoaded.value = false;
    iframeKey.value += 1;
  },
);

onMounted(() => {
  loadReviewWidgetScript();
});

onUnmounted(() => {
  window.removeEventListener("message", handleIframeMessage);
});
</script>

<style scoped>
.lc-reviews-widget-preview-container,
.lc-reviews-widget-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
