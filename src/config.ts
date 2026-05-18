declare global {
    interface Window {
        leadconnector_config: {
            LEAD_CONNECTOR_VERSION: string;
            LEAD_CONNECTOR_PLUGIN_NAME: string;
            LEAD_CONNECTOR_SERVICES_BASE_URL: string;
            LEAD_CONNECTOR_OPTION_NAME: string;
            LEAD_CONNECTOR_CDN_BASE_URL: string;
            LEAD_CONNECTOR_OAUTH_CLIENT_ID: string;
            LEAD_CONNECTOR_BASE_URL: string;
            LEAD_CONNECTOR_DISPLAY_NAME: string;
            LEAD_CONNECTOR_ROOT_DOMAIN: string;
            LEAD_CONNECTOR_APP_BASE_URL: string;
            LEAD_CONNECTOR_SURVEY_WIDGET_BASE_URL: string;
            LEAD_CONNECTOR_QUIZ_WIDGET_BASE_URL: string;
            LEAD_CONNECTOR_FORM_EMBED_SCRIPT_URL: string;
            LEAD_CONNECTOR_REPUTATION_WIDGET_SCRIPT_URL: string;
            LEAD_CONNECTOR_REPUTATION_WIDGET_BASE_URL: string;
        };
    }
}

// Export a config object for use in your TypeScript code
export const config = {
    LEAD_CONNECTOR_VERSION: window.leadconnector_config.LEAD_CONNECTOR_VERSION,
    LEAD_CONNECTOR_PLUGIN_NAME: window.leadconnector_config.LEAD_CONNECTOR_PLUGIN_NAME,
    LEAD_CONNECTOR_SERVICES_BASE_URL: window.leadconnector_config.LEAD_CONNECTOR_SERVICES_BASE_URL,
    LEAD_CONNECTOR_OPTION_NAME: window.leadconnector_config.LEAD_CONNECTOR_OPTION_NAME,
    LEAD_CONNECTOR_CDN_BASE_URL: window.leadconnector_config.LEAD_CONNECTOR_CDN_BASE_URL,
    LEAD_CONNECTOR_OAUTH_CLIENT_ID: window.leadconnector_config.LEAD_CONNECTOR_OAUTH_CLIENT_ID,
    LEAD_CONNECTOR_BASE_URL: window.leadconnector_config.LEAD_CONNECTOR_BASE_URL,
    LEAD_CONNECTOR_DISPLAY_NAME: window.leadconnector_config.LEAD_CONNECTOR_DISPLAY_NAME,
    LEAD_CONNECTOR_ROOT_DOMAIN: window.leadconnector_config.LEAD_CONNECTOR_ROOT_DOMAIN,
    LEAD_CONNECTOR_APP_BASE_URL: window.leadconnector_config.LEAD_CONNECTOR_APP_BASE_URL,
    LEAD_CONNECTOR_SURVEY_WIDGET_BASE_URL: window.leadconnector_config.LEAD_CONNECTOR_SURVEY_WIDGET_BASE_URL,
    LEAD_CONNECTOR_QUIZ_WIDGET_BASE_URL: window.leadconnector_config.LEAD_CONNECTOR_QUIZ_WIDGET_BASE_URL,
    LEAD_CONNECTOR_FORM_EMBED_SCRIPT_URL: window.leadconnector_config.LEAD_CONNECTOR_FORM_EMBED_SCRIPT_URL,
    LEAD_CONNECTOR_REPUTATION_WIDGET_SCRIPT_URL: window.leadconnector_config.LEAD_CONNECTOR_REPUTATION_WIDGET_SCRIPT_URL,
    LEAD_CONNECTOR_REPUTATION_WIDGET_BASE_URL: window.leadconnector_config.LEAD_CONNECTOR_REPUTATION_WIDGET_BASE_URL
};