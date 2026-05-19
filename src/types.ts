import { DISPLAY_METHOD } from "./constants";

export interface BasicSettings {
  api_key?: string;
  enable_text_widget?: boolean | string;
  baseURL?: string;
}

export interface TableColumn {
  key: string;
  label?: string;
  sortable?: boolean;
}

export interface WP_APIResponse {
  error?: string | boolean;
  success?: string | boolean;
  message?: string;
  warning_msg?: string;
  code?: number;
}

export interface FunnelStep {
  id: string;
  name: string;
  url: string;
  status: string;
  display_method: string;
  pages : Array<any>;
}

export interface Funnel {
  _id : string;
  id: string;
  locationId: string;
  name: string;
  steps : FunnelStep[];
  pages: { id : string,  name: string; url: string, pages : string[] }[];
  domainId?: string;
  domainURL?: string;
  tracking_code_head?: string;
  tracking_code_body?: string;
  trackingCodeHead?: string;
  trackingCodeBody?: string;
}

export interface FunnelMeta {
  author: string;
  customMeta: Array<{ string: string }>;
  description: string;
  imageUrl: string;
  keywords: string;
  title: string;
}

export interface FunnelPage {
  id: string;
  locationId: string;
  name: string;
  url: string;
  meta: FunnelMeta;
  pageDataDownloadURL?: string;
}

export interface LeadConnectorPost {
  author?: string;
  date?: number;
  funnel_step_url?: string;
  human_date?: string;
  human_modified_date?: string;
  leadconnector_display_method: typeof DISPLAY_METHOD[number];
  leadconnector_funnel_id?: string;
  leadconnector_funnel_name?: string;
  leadconnector_step_id?: string;
  leadconnector_step_name?: string;
  location_id?: string;
  slug?: string;
  status?: string;
  template_id?: number;
  title?: string;
  url?: string;
  leadconnector_include_tracking_code?: string;
  leadconnector_use_site_favicon?: string;
  leadconnector_include_wp_headers_and_footers?: string;
}

export interface FunnelsResponse extends WP_APIResponse {
  funnels: Funnel[];
}

export interface SettingResponse extends WP_APIResponse {
  api_key?: string;
  oauth_access_token?: string;
  enable_text_widget?: string;
  text_widget_error?: boolean;
  error_details?: string;
  white_label_url?: string;
  home_url?: string;
  location_id?: string;
  plugin_directory_url ?: string;
  selected_chat_widget_id?: string;
}
