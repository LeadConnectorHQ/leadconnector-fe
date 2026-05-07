import { getApiURL , LEAD_CONNECTOR_OAUTH_URL} from './constants';
const BackendService = {
    ValidateAuthToken : async () => {
        const response = await fetch(getApiURL('wp_validate_auth_state'));
        return response.json();
    },
    OpenAuthorizationWall : async () => {
        window.open(LEAD_CONNECTOR_OAUTH_URL, '_blank');
    },
    ValidateAuthCode : async (code : string ) => {
        return await fetch(
            getApiURL("wp_validate_oauth", {
                code
            })
        );
    },
    Cron : {
        getCronJobs : async () => {
            const response = await fetch(getApiURL('wp_get_cron_count'));
            return response.json();
        },
        clearCronJobs : async () => {
            const response = await fetch(getApiURL('wp_clear_cron'));
            return response.json();
        }
    },
    Emails : {
        emailEligibilityCheck : async () => {
            const response = await fetch(getApiURL('wp_email_eligibility_check'));
            return response.json();
        },
        enableEmails : async ( domain : string , emailPrefix : string  ) => {
            const response = await fetch(getApiURL('wp_enable_email', { domain , emailPrefix}));
            return response.json();
        },
        disableEmails : async ( email : string ) => {
            const response = await fetch(getApiURL('wp_disable_email',  { email }));
            return response.json();
        },
        couldHaveConflictingPlugins : async () => {
            const response = await fetch(getApiURL('check_smtp_plugin_conflict'));
            return response.json();
        }
    },
    ChatWidget : {
        EnableWidget : async () => {
            return await fetch(
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
            return await fetch(
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
            const response = await fetch(getApiURL('get_chat_widgets'));
            return response.json();
        },
        SetSelectedChatWidget : async (widgetId : string) => {
            const response = await fetch(getApiURL('wp_save_options'), {
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
            return await fetch(
                getApiURL("wp_disconnect")
            );
        },
        SaveAPIKey : async (apiKey : string) => {
            return await fetch(
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
            const lcOptions = await fetch(
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
            const response = await fetch(
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
            const funnelsPost = await fetch(getApiURL("wp_get_all_posts" , { page , per_page  }));
            if (funnelsPost.ok) {
                return await funnelsPost.json();
            } else {
                throw new Error("Failed to fetch the funnels from you account");
                console.error(await funnelsPost.text());
                // this.showToast(MESSAGES.POSTS_API_FAIL, false);
            }
        },
        getFunnelsList : async () => {
            const funnels = await fetch(getApiURL("funnels_get_list"));
            if (funnels.ok) {
                return await funnels.json();
            } else {
                throw new Error("Failed to fetch the funnels from you account");
                console.error(await funnels.text());
                // this.showToast(MESSAGES.FUNNELS_API_FAIL, false);
            }
        },
        ImportNewFunnel : async (data : Object) => {
            const response = await fetch(getApiURL("wp_insert_post"), {
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
            const funnel = await fetch(getApiURL("funnels_get_details", {funnelId}));
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
            const allForms = await fetch(getApiURL("forms_get_list", { page, per_page }));
            if (allForms.ok) {
                return await allForms.json();
            } else {
                throw new Error("Failed to fetch the forms from you account");
            }
        },
    }, 
    Phone : {
        getAllNumberPools : async () => {
            const allNumberPools = await fetch(getApiURL("phone_numbers_get_list"));
            if (allNumberPools.ok) {
                return (await allNumberPools.json())?.pools
            } else {
                throw new Error("Failed to fetch the number pools from you account");
            }
        }
    },
    CustomValues : {
        syncCustomValues : async () => {
            const response = await fetch(getApiURL("get_custom_values"));
            return response.json();
        },
        getFolders : async(skip: number, limit: number) =>{
            const response = await fetch(getApiURL("get_custom_value_folders", {skip, limit}));
            return response.json();
        },
        getCustomValues : async(query: string = "", skip: number = 0, limit: number = 100) => {
            const response = await fetch(getApiURL("get_custom_values", {skip, limit, query}));
            return response.json();
        },
        clearCachedCustomValues : async () => {
            const response = await fetch(getApiURL("clear_cached_custom_values"));
            return response.json();
        }
    },
    Calendar : {
        getCalendars : async () => {
            const response = await fetch(getApiURL("get_calendars"));
            return response.json();
        },
        getCalendarGroups : async () => {
            const response = await fetch(getApiURL("get_calendar_groups"));
            return response.json();
        }
    },
    Surveys : {
        getSurveys : async (skip: number = 0, limit: number = 10, query: string = "") => {
            const response = await fetch(getApiURL("get_surveys", {skip, limit, query}));
            return response.json();
        }
    },
    Quizzes : {
        getQuizzes : async (skip: number = 0, limit: number = 10, query: string = "") => {
            const response = await fetch(getApiURL("get_quizzes", {skip, limit, query}));
            return response.json();
        }
    },
    ReviewsWidget : {
        getReviewsWidgets : async (pageNumber: number = 1, pageSize: number = 10) => {
            const response = await fetch(getApiURL("get_reviews_widgets", {pageNumber, pageSize}));
            if (response.ok) {
                return await response.json();
            } else {
                throw new Error("Failed to fetch reviews widgets");
            }
        }
    }
}

export default BackendService;