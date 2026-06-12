<script setup lang="ts">
import { UIButton, UIInput } from '@/ui';
import BackendService from '../services';
import SupportLink from '@/components/SupportLink.vue';
import { ref , onMounted, reactive, onUnmounted} from 'vue';

const isAuthorizing = ref(false);
const emit = defineEmits(['init-checks'])
const localState = reactive({
    testingAPIKey : '',
    loading : false
})


const checkAuthStatus = async () => {
    emit('init-checks');
}

let checkInterval = setInterval(() => {
    if(isAuthorizing.value)
        checkAuthStatus();
}, 10000);


const connectAccount = async () => {
    isAuthorizing.value = true;
    await BackendService.OpenAuthorizationWall();

}

addEventListener("focus", (event) => {
    // if(isAuthorizing.value)
        checkAuthStatus();
});




onMounted(() => {
    document.documentElement.classList.add('lc-auth-wall-active');
});

onUnmounted(() => {
    document.documentElement.classList.remove('lc-auth-wall-active');
    window.clearInterval(checkInterval);
});

const saveAPIKey = async () => {
    isAuthorizing.value = true;
    localState.loading = true;
    await BackendService.Auth.SaveAPIKey(localState.testingAPIKey);
    localState.loading = false;
    checkAuthStatus();
}

</script>

<template>
    <div class='lc-auth-wall flex row h-full'>
        <div class='w-1/2 h-full flex flex-col bg-white'>
            <div class="flex-1 flex flex-col items-center justify-center pl-10 pr-10">
            <div class="w-1/2">
                <div>
                    <h1 class="text-3xl mb-0 font-sans font-medium" > Welcome </h1>
                    <p class='text-lg mt-2 text-gray-600'> Get started by signing into your account </p>
                </div>
                <div class='row connect-btn-wrap pt-3'>
                    <UIButton id='oauth-account-connect' class="w-full" ghost @click="connectAccount" :loading=isAuthorizing> 
                        <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="24" height="24" rx="12" transform="matrix(1 0 0 -1 0.25 24)" fill="#FF692F"/>
                            <path d="M11.972 11.3392C11.6605 11.5191 11.4686 11.8516 11.4686 12.2113V15.567L8.70022 13.9687L8.71114 9.66222C8.71114 9.39926 8.57083 9.15622 8.34309 9.02476L6.78804 8.12702L12.1199 5.04869L17.4938 8.15121L11.972 11.3392ZM11.4686 18.563L6.09469 15.4603V9.30364L7.69167 10.2257V14.2598C7.69167 14.4399 7.78782 14.6064 7.9438 14.6965L11.4686 16.7315V18.563ZM18.9886 10.8173C19.3213 10.6523 19.5319 10.313 19.5319 9.94171V8.13911C19.5319 7.75755 19.0949 7.50713 19.0417 7.49216L12.4561 3.69004C12.2482 3.56986 11.9918 3.56986 11.7837 3.69004L5.10717 7.54475C5.10363 7.54678 5.10027 7.54914 5.09678 7.55117C5.09324 7.55316 5.08971 7.55486 5.08618 7.55689C4.87825 7.67691 4.75 7.89892 4.75 8.13911V15.8486C4.75 16.0888 4.87825 16.3107 5.08618 16.4309L11.8048 20.3098C11.9088 20.3698 12.0248 20.3999 12.1409 20.3999C12.2571 20.3999 12.3731 20.3698 12.4771 20.3098L19.1957 16.4309C19.4036 16.3107 19.5319 16.0888 19.5319 15.8486V13.1974L18.6713 13.6162C18.3751 13.7605 18.1872 14.061 18.1872 14.3903V15.4603L12.8133 18.563V12.4062L18.1872 9.30364V11.2143L18.9886 10.8173Z" fill="white"/>
                            <path d="M15.5816 11.8947V13.9689L14.4409 14.6274C14.2086 14.7616 14.0654 15.0096 14.0654 15.2779V16.0088L16.3379 14.6967C16.4939 14.6066 16.5901 14.44 16.5901 14.26V11.3948L15.5816 11.8947Z" fill="#686C75"/>
                        </svg>
                        <span class="font-medium ml-2">
                            Click to sign in
                        </span>
                    </UIButton>
                </div>
                <div class="row py-3 hidden">
                    <span> Only For Dev and QA Phase This will not be present in Production </span>
                    <UIInput id="testing-api-key" v-model:modelValue="localState.testingAPIKey"  placeholder="Enter Testing API Key" />
                    <UIButton id="testing-api"  class='justify-self-center'  @click="saveAPIKey" v-bind:loading="localState.loading"  type="primary"> Save API Key </UIButton>
                </div>
            </div>
            </div>
            <div class="px-10 pb-8">
                <SupportLink />
            </div>
        </div>
        <div class='w-1/2 h-full flex justify-center items-center bg-primary-700 bg-gradient-to-tr from-primary-900 to-primary-500'>
            <div class="w-3/4">
                <div>
                    <svg width="81" height="80" viewBox="0 0 81 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M0.5 40C25.9247 40 40.5 25.4247 40.5 0C40.5 25.4247 55.0753 40 80.5 40C55.0753 40 40.5 54.5753 40.5 80C40.5 54.5753 25.9247 40 0.5 40Z" fill="white"/>
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M0.5 12C8.12742 12 12.5 7.62742 12.5 0C12.5 7.62742 16.8726 12 24.5 12C16.8726 12 12.5 16.3726 12.5 24C12.5 16.3726 8.12742 12 0.5 12Z" fill="#FEC84B"/>
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M64.5 24C69.5849 24 72.5 21.0849 72.5 16C72.5 21.0849 75.4151 24 80.5 24C75.4151 24 72.5 26.9151 72.5 32C72.5 26.9151 69.5849 24 64.5 24Z" fill="#FEC84B"/>
                    </svg>

                </div>
                <div>
                    <h1 class="text-6xl font-medium text-white" style="line-height: 5rem;">
                        Connect <br /> WordPress <br /> to your CRM
                    </h1>
                </div>
                <div class="flex gap-8 mt-8">
                    <ul class="text-2xl text-white font-medium w-1/2 list-disc list-inside">
                        <li> 
                            Funnels
                        </li>
                        <li> 
                            Forms
                        </li>
                        <li>
                            Email
                        </li>
                        <li> 
                            Phone Numbers
                        </li>
                        <li> 
                            Chat Widget
                        </li>
                    </ul>
                    <ul class="text-2xl text-white font-medium w-1/2 list-disc list-inside">
                        <li>
                            Custom Values
                        </li>
                        <li> 
                            Calendar
                        </li>
                        <li> 
                            Reviews Widget
                        </li>
                        <li> 
                            Surveys
                        </li>
                        <li> 
                            Quizzes
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
html.lc-auth-wall-active #wpbody-content,
html.lc-auth-wall-active #wpbody,
html.lc-auth-wall-active #wpcontent {
    display: block;
    height: calc(100vh - var(--wp-admin--admin-bar--height, 32px)) !important;
    overflow: hidden;
}

html.lc-auth-wall-active #wpbody-content #app {
    padding: 0 !important;
    height: 100% !important;
}

html.lc-auth-wall-active #wpcontent {
    padding-left: 0 !important;
}

html.lc-auth-wall-active #wpfooter {
    display: none;
}

html.lc-auth-wall-active .lc-auth-wall {
    height: 100%;
    overflow: hidden;
}
</style>
