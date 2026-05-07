import { config } from './config';

export const PERMAS_LINKS_ERROR_STR = `It seems like your account's Permalink Settings set to 'plain', please change it in order to use this plugin, more info <a href='https://wordpress.org/support/article/settings-permalinks-screen/' target='_blank'>here.</a>`;
export const getApiURL = function(
  endpoint: string,
  data?: object,
  directEndpoint = false
): string {
  // eslint-disable-next-line
  const lc_admin_settings = (window as any).lc_admin_settings;
  
  // Check if proxy_url already contains query parameters
  const separator = lc_admin_settings.proxy_url.includes('?') ? '&' : '?'; // Only this is needed as we already moved to route register api of wordpress
  let apiURL = `${lc_admin_settings.proxy_url}${separator}endpoint=${encodeURIComponent(
    endpoint
  )}&_wpnonce=${lc_admin_settings.nonce}&direct_endpoint=${String(
    directEndpoint
  )}`;
  if (data) {
    apiURL = apiURL + `&data=${JSON.stringify(data)}`;
  }

  return apiURL;
};

export const COLUMNS_KEYS = {
  STEP_NAME: "lc_step_name",
  FUNNEL_NAME: "lc_funnel_name",
  PAGE_URL: "url",
  EDIT_URL: "edit_url",
  MODIFIED_DATE: "human_modified_date",
  CONTEXT: "context",
  SLUG: "slug"
};

export const POSTS_TABLE_COLUMNS = [
  { key: COLUMNS_KEYS.STEP_NAME, label: "Page", sortable: true },
  {
    key: COLUMNS_KEYS.FUNNEL_NAME,
    label: "Funnel Name",
    sortable: true
  },
  { key: COLUMNS_KEYS.SLUG, label: "Slug", sortable: true },
  { key: COLUMNS_KEYS.PAGE_URL, label: "View", sortable: true },

  { key: COLUMNS_KEYS.EDIT_URL, label: "Edit", sortable: false },
  {
    key: COLUMNS_KEYS.MODIFIED_DATE,
    label: "Last Modified",
    sortable: true
  },
  { key: COLUMNS_KEYS.CONTEXT, label: "", sortable: false }
];

export const DISPLAY_METHOD = ["iframe", "redirect", "native"];

export const DISPLAY_METHOD_OPTIONS = [
  { value: DISPLAY_METHOD[0], text: "Embed Full Page iFrame" },
  { value: DISPLAY_METHOD[1], text: "Redirect to Funnel URL" },
  { value: DISPLAY_METHOD[2], text: "Native Embed" }
];

export const MESSAGES = {
  INVALID_API_KEY: "API key is invalid",
  FUNNELS_API_FAIL: "Failed to fetch the funnels from you account",
  NO_FUNNELS: "You don't have any funnels in your account",
  POSTS_API_FAIL: "Failed to fetch the Pages",
  DELETE_POST_API_FAIL: "Failed to delete the post",
  POST_DELETED_SUCCESS: "Post deleted successfully",
  POST_CREATED_SUCCESS: "Post created successfully",
  POST_UPDATED_SUCCESS: "Post updated successfully"
};

const LEAD_CONNECTOR_OAUTH_CALLBACK_URL =
  `${config.LEAD_CONNECTOR_SERVICES_BASE_URL}wordpress/lc-plugin/callback`;
const currentURL = window.location.origin;

export const LEAD_CONNECTOR_OAUTH_URL =
  config.LC_ROOT_DOMAIN + "/oauth/chooselocation?response_type=code&redirect_uri=" +
  LEAD_CONNECTOR_OAUTH_CALLBACK_URL +
  "&client_id=" +
  config.LEAD_CONNECTOR_OAUTH_CLIENT_ID +
  "&scope=funnels/funnel.readonly%20funnels/page.readonly%20wordpress.site.readonly&state=" +
  currentURL;

export const LC_PROD_BASE_URL = config.LC_BASE_URL;
export const LC_BASE_URL = config.LC_BASE_URL;