declare global {
    interface Window {
        leadConnectorConfig: {
            LEAD_CONNECTOR_VERSION: string;
            LEAD_CONNECTOR_PLUGIN_NAME: string;
            LEAD_CONNECTOR_SERVICES_BASE_URL: string;
            LEAD_CONNECTOR_OPTION_NAME: string;
            LEAD_CONNECTOR_CDN_BASE_URL: string;
            LEAD_CONNECTOR_OAUTH_CLIENT_ID: string;
            LEAD_CONNECTOR_BASE_URL: string;
            LEAD_CONNECTOR_DISPLAY_NAME: string;
            LC_ROOT_DOMAIN: string;
            LC_BASE_URL: string;
            LC_SURVEY_WIDGET_BASE_URL: string;
            LC_QUIZ_WIDGET_BASE_URL: string;
            LC_FORM_EMBED_SCRIPT_URL: string;
            LC_REPUTATION_WIDGET_SCRIPT_URL: string;
            LC_REPUTATION_WIDGET_BASE_URL: string;
        };
    }
}

// Export a config object for use in your TypeScript code
export const config = {
    LEAD_CONNECTOR_VERSION: window.leadConnectorConfig.LEAD_CONNECTOR_VERSION,
    LEAD_CONNECTOR_PLUGIN_NAME: window.leadConnectorConfig.LEAD_CONNECTOR_PLUGIN_NAME,
    LEAD_CONNECTOR_SERVICES_BASE_URL: window.leadConnectorConfig.LEAD_CONNECTOR_SERVICES_BASE_URL,
    LEAD_CONNECTOR_OPTION_NAME: window.leadConnectorConfig.LEAD_CONNECTOR_OPTION_NAME,
    LEAD_CONNECTOR_CDN_BASE_URL: window.leadConnectorConfig.LEAD_CONNECTOR_CDN_BASE_URL,
    LEAD_CONNECTOR_OAUTH_CLIENT_ID: window.leadConnectorConfig.LEAD_CONNECTOR_OAUTH_CLIENT_ID,
    LEAD_CONNECTOR_BASE_URL: window.leadConnectorConfig.LEAD_CONNECTOR_BASE_URL,
    LEAD_CONNECTOR_DISPLAY_NAME: window.leadConnectorConfig.LEAD_CONNECTOR_DISPLAY_NAME,
    LC_ROOT_DOMAIN: window.leadConnectorConfig.LC_ROOT_DOMAIN,
    LC_BASE_URL: window.leadConnectorConfig.LC_BASE_URL,
    LC_SURVEY_WIDGET_BASE_URL: window.leadConnectorConfig.LC_SURVEY_WIDGET_BASE_URL,
    LC_QUIZ_WIDGET_BASE_URL: window.leadConnectorConfig.LC_QUIZ_WIDGET_BASE_URL,
    LC_FORM_EMBED_SCRIPT_URL: window.leadConnectorConfig.LC_FORM_EMBED_SCRIPT_URL,
    LC_REPUTATION_WIDGET_SCRIPT_URL: window.leadConnectorConfig.LC_REPUTATION_WIDGET_SCRIPT_URL,
    LC_REPUTATION_WIDGET_BASE_URL: window.leadConnectorConfig.LC_REPUTATION_WIDGET_BASE_URL
};