import { getApiURL , LEAD_CONNECTOR_OAUTH_URL} from './constants';

/**
 * Read the WordPress REST nonce that the PHP layer injects via
 * wp_localize_script() into window.leadconnector_admin_settings.nonce.
 *
 * The nonce is required by leadconnector_rest_mutating_permission() (in
 * trunk/admin/class-leadconnector-admin.php) for every state-changing REST
 * call. We always send it as the X-WP-Nonce header rather than relying on
 * the _wpnonce URL parameter so cookie auth + nonce verification both pass
 * regardless of whether the request goes through the proxy route or a
 * sub-route, and so there is no ambiguity for any future stricter middleware.
 */
const getWpRestNonce = (): string => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const settings = (window as any).leadconnector_admin_settings;
    return settings && typeof settings.nonce === "string" ? settings.nonce : "";
};

/**
 * fetch() wrapper that always attaches the X-WP-Nonce header expected by the
 * plugin's REST permission callbacks, sets the JSON Content-Type when a body
 * is present, and explicitly opts into same-origin cookie credentials so
 * is_user_logged_in() resolves correctly server-side.
 */
const wpFetch = (input: string, init: RequestInit = {}): Promise<Response> => {
    const headers = new Headers(init.headers || {});
    if (!headers.has("X-WP-Nonce")) {
        headers.set("X-WP-Nonce", getWpRestNonce());
    }
    if (init.body !== undefined && init.body !== null && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }
    if (!headers.has("Accept")) {
        headers.set("Accept", "application/json");
    }
    return fetch(input, {
        credentials: "same-origin",
        ...init,
        headers,
    });
};

const BackendService = {
    ValidateAuthToken : async () => {
        const response = await wpFetch(getApiURL('wp_validate_auth_state'));
        return response.json();
    },
    OpenAuthorizationWall : async () => {
        window.open(LEAD_CONNECTOR_OAUTH_URL, '_blank');
    },
    ValidateAuthCode : async (code : string ) => {
        return await wpFetch(
            getApiURL("wp_validate_oauth", {
                code
            })
        );
    },
    Cron : {
        getCronJobs : async () => {
            const response = await wpFetch(getApiURL('wp_get_cron_count'));
            return response.json();
        },
        clearCronJobs : async () => {
            const response = await wpFetch(getApiURL('wp_clear_cron'));
            return response.json();
        }
    },
    Emails : {
        emailEligibilityCheck : async () => {
            const response = await wpFetch(getApiURL('wp_email_eligibility_check'));
            return response.json();
        },
        enableEmails : async ( domain : string , emailPrefix : string  ) => {
            const response = await wpFetch(getApiURL('wp_enable_email', { domain , emailPrefix}));
            return response.json();
        },
        disableEmails : async ( email : string ) => {
            const response = await wpFetch(getApiURL('wp_disable_email',  { email }));
            return response.json();
        },
        couldHaveConflictingPlugins : async () => {
            const response = await wpFetch(getApiURL('check_smtp_plugin_conflict'));
            return response.json();
        }
    },
    ChatWidget : {
        EnableWidget : async () => {
            return await wpFetch(
                getApiURL("wp_save_options"),
                {
                    method : 'POST',
                    body : JSON.stringify({
                        enable_text_widget : "1"
                    }),
                }
            );
        },
        DisableWidget : async () => {
            return await wpFetch(
                getApiURL("wp_save_options"),
                {
                    method : 'POST',
                    body : JSON.stringify({
                        enable_text_widget : "0"
                    }),
                }
            );
        },
        GetChatWidgets : async () => {
            const response = await wpFetch(getApiURL('get_chat_widgets'));
            return response.json();
        },
        SetSelectedChatWidget : async (widgetId : string) => {
            const response = await wpFetch(getApiURL('wp_save_options'), {
                method : 'POST',
                body : JSON.stringify({
                    selected_chat_widget : widgetId
                })
            });
            return response.json();
        }
    },
    Auth: {
        Disconnect : async () => {
            return await wpFetch(
                getApiURL("wp_disconnect")
            );
        },
        SaveAPIKey : async (apiKey : string) => {
            return await wpFetch(
                getApiURL("wp_save_options"),
                {
                    method : 'POST',
                    body : JSON.stringify({
                        api_key : apiKey
                    }),
                }
            );
        }
    },
    Common : {
        GetLCOptions : async () => {
            const lcOptions = await wpFetch(
                getApiURL("wp_get_lc_options")
            );
            if (lcOptions.ok) {
                return await lcOptions.json();
            } else {
                throw new Error("Failed to fetch the LC options");
                console.error(await lcOptions.text());
                // this.showToast(MESSAGES.POSTS_API_FAIL, false);
            }
        },

    },
    Funnels : {
        DeleteFunnelPostId : async (postId : number) => {
            const response = await wpFetch(
                getApiURL("wp_delete_post", {post_id : postId, force_delete : true}),
            );
            if (response.ok) {
                return await response.json();
            } else {
                throw new Error("Failed to delete the funnel");
                console.error(await response.text());
                // this.showToast(MESSAGES.POSTS_API_FAIL, false);
            }
        },
        GetImportedFunnels : async ( page : number = 1, per_page : number = 10 ) => {
            const funnelsPost = await wpFetch(getApiURL("wp_get_all_posts" , { page , per_page  }));
            if (funnelsPost.ok) {
                return await funnelsPost.json();
            } else {
                throw new Error("Failed to fetch the funnels from you account");
                console.error(await funnelsPost.text());
                // this.showToast(MESSAGES.POSTS_API_FAIL, false);
            }
        },
        getFunnelsList : async () => {
            const funnels = await wpFetch(getApiURL("funnels_get_list"));
            if (funnels.ok) {
                return await funnels.json();
            } else {
                throw new Error("Failed to fetch the funnels from you account");
                console.error(await funnels.text());
                // this.showToast(MESSAGES.FUNNELS_API_FAIL, false);
            }
        },
        ImportNewFunnel : async (data : Object) => {
            const response = await wpFetch(getApiURL("wp_insert_post"), {
                method: "POST",
                body: JSON.stringify(data)
            });

            if (response.ok) {
                return await response.json();
            } else {
                throw new Error("Failed to import the funnel");
                console.error(await response.text());
                // this.showToast(MESSAGES.POSTS_API_FAIL, false);
            }
        },
        getV1FunnelDetails : async (funnelId : string) => {
            const funnel = await wpFetch(getApiURL("funnels_get_details", {funnelId}));
            if (funnel.ok) {
                return await funnel.json();
            } else {
                throw new Error("Failed to fetch the funnel details");
                console.error(await funnel.text());
                // this.showToast(MESSAGES.POSTS_API_FAIL, false);
            }
        }
    },
    Forms : {
        getAllForms : async ( page : number = 1, per_page : number = 10 ) => {
            const allForms = await wpFetch(getApiURL("forms_get_list", { page, per_page }));
            if (allForms.ok) {
                return await allForms.json();
            } else {
                throw new Error("Failed to fetch the forms from you account");
            }
        },
    },
    Phone : {
        getAllNumberPools : async () => {
            const allNumberPools = await wpFetch(getApiURL("phone_numbers_get_list"));
            if (allNumberPools.ok) {
                return (await allNumberPools.json())?.pools
            } else {
                throw new Error("Failed to fetch the number pools from you account");
            }
        }
    },
    CustomValues : {
        syncCustomValues : async () => {
            const response = await wpFetch(getApiURL("get_custom_values"));
            return response.json();
        },
        getFolders : async(skip: number, limit: number) =>{
            const response = await wpFetch(getApiURL("get_custom_value_folders", {skip, limit}));
            return response.json();
        },
        getCustomValues : async(query: string = "", skip: number = 0, limit: number = 100) => {
            const response = await wpFetch(getApiURL("get_custom_values", {skip, limit, query}));
            return response.json();
        },
        clearCachedCustomValues : async () => {
            const response = await wpFetch(getApiURL("clear_cached_custom_values"));
            return response.json();
        }
    },
    Calendar : {
        getCalendars : async () => {
            const response = await wpFetch(getApiURL("get_calendars"));
            return response.json();
        },
        getCalendarGroups : async () => {
            const response = await wpFetch(getApiURL("get_calendar_groups"));
            return response.json();
        }
    },
    Surveys : {
        getSurveys : async (skip: number = 0, limit: number = 10, query: string = "") => {
            const response = await wpFetch(getApiURL("get_surveys", {skip, limit, query}));
            return response.json();
        }
    },
    Quizzes : {
        getQuizzes : async (skip: number = 0, limit: number = 10, query: string = "") => {
            const response = await wpFetch(getApiURL("get_quizzes", {skip, limit, query}));
            return response.json();
        }
    },
    ReviewsWidget : {
        getReviewsWidgets : async (pageNumber: number = 1, pageSize: number = 10) => {
            const response = await wpFetch(getApiURL("get_reviews_widgets", {pageNumber, pageSize}));
            if (response.ok) {
                return await response.json();
            } else {
                throw new Error("Failed to fetch reviews widgets");
            }
        }
    }
}

export default BackendService;