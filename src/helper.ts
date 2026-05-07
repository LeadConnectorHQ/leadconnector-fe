export const pluginAssetUrl = (
  baseUrl: string | undefined,
  path: string,
): string => {
  if (!baseUrl) return path;
  const base = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const relativePath = path.startsWith("/") ? path.slice(1) : path;
  return `${base}${relativePath}`;
};

export const ensureHttps = (domain: string): string => {
  if (!domain) return "";

  // Remove any existing protocol
  let cleanDomain = domain.replace(/^(https?:\/\/)/, "");

  // Add https:// prefix
  return `https://${cleanDomain}`;
};

/**
 * Converts a slot duration in minutes into a human-readable string.
 * Examples: 30 → "30 mins", 60 → "1 hr", 90 → "1 hr 30 mins", 1440 → "1 day", 1500 → "1 day 1 hr"
 */
export const formatSlotDuration = (minutes: number): string => {
  if (!minutes || minutes <= 0) return "0 mins";

  const MINS_PER_DAY = 1440;
  const MINS_PER_HOUR = 60;

  const days = Math.floor(minutes / MINS_PER_DAY);
  const remainingAfterDays = minutes % MINS_PER_DAY;
  const hours = Math.floor(remainingAfterDays / MINS_PER_HOUR);
  const mins = remainingAfterDays % MINS_PER_HOUR;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} ${days === 1 ? "day" : "days"}`);
  if (hours > 0) parts.push(`${hours} ${hours === 1 ? "hour" : "hours"}`);
  if (mins > 0) parts.push(`${mins} ${mins === 1 ? "min" : "mins"}`);

  return parts.join(" ");
};

export const copyLCEmbedCode = (embedCode: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Create a temporary textarea element
      const textElem = document.createElement("textarea");
      textElem.innerHTML = embedCode;
      document.body.appendChild(textElem);
      textElem.select();

      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(textElem.value)
          .then(() => {
            document.body.removeChild(textElem);
            resolve();
          })
          .catch(() => {
            // Fallback to execCommand if clipboard API fails
            document.execCommand("copy");
            document.body.removeChild(textElem);
            resolve();
          });
      } else {
        // Fallback to execCommand for older browsers
        document.execCommand("copy");
        document.body.removeChild(textElem);
        resolve();
      }
    } catch (error) {
      reject(error);
    }
  });
};
