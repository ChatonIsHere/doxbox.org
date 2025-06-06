<script setup>
    import { ref } from 'vue';
    import { useAuthStore } from '@/stores/authStore';
    import NoLinkedDiscord from '@/components/NoLinkedDiscord.vue';
    import { storeToRefs } from 'pinia';
    import { useBreakpointStore } from '@/stores/breakpointStore'; // Import the breakpoint store

    const appVersion = __APP_VERSION__;

    const authStore = useAuthStore();
    const breakpointStore = useBreakpointStore(); // Instantiate the breakpoint store

    const { userExtended } = storeToRefs(authStore);
    const { generateApiKey: storeGenerateApiKey, revokeApiKey: storeRevokeApiKey } = authStore;
    const { breakpointSm } = storeToRefs(breakpointStore); // Extract breakpointSm ref

    const generatedApiKey = ref('');
    const isGenerating = ref(false);
    const isRevoking = ref(false);

    const generateApiKey = async () => {
        isGenerating.value = true;
        generatedApiKey.value = '';

        try {
            const newKey = await storeGenerateApiKey();
            if (newKey) {
                generatedApiKey.value = newKey;
            }
        } catch (error) {
            console.error('Component caught error during API key generation:', error);
        } finally {
            isGenerating.value = false;
        }
    };

    const revokeApiKey = async () => {
        isRevoking.value = true;
        try {
            await storeRevokeApiKey();
        } catch (error) {
            console.error('Component caught error during API key revocation:', error);
        } finally {
            isRevoking.value = false;
        }
    };
</script>

<template>
    <div class="px-4 py-5 text-center">
        <div class="col-lg-6 mx-auto">
            <div>
                <NoLinkedDiscord />
            </div>
            <div>
                <h3 class="fw-bold text-white pb-4">Dox Box Website Version</h3>
                <p>Version: {{ appVersion }}</p>
            </div>
            <hr class="my-5" />
            <div>
                <h3 class="fw-bold text-white pb-4">Dox Box API Key</h3>
                <p>This API key is currently only used for the Quinn Shmeppy Extension.</p>
                <p>Please do not share this with anyone, as it grants access to limited Quinn features remotely.</p>
                <div v-if="breakpointSm" class="input-group my-3 flex-column flex-md-row">
                    <input type="text" class="form-control mb-2 mb-md-0 text-center" placeholder="Please generate an API key" readonly aria-label="API Key" aria-describedby="generate-apikey-button" :value="userExtended?.apiKey || ''" />
                    <template v-if="userExtended?.apiKey">
                        <button class="btn btn-warning mb-2 mb-md-0" type="button" id="generate-apikey-button" @click="generateApiKey" :disabled="isGenerating || isRevoking">Regenerate API Key</button>
                        <button class="btn btn-danger mb-2 mb-md-0" type="button" id="revoke-apikey-button" @click="revokeApiKey" :disabled="isRevoking || isGenerating">Revoke API Key</button>
                    </template>
                    <button v-else class="btn btn-success mb-2 mb-md-0" type="button" id="generate-apikey-button" @click="generateApiKey" :disabled="isGenerating || isRevoking">Generate API Key</button>
                </div>
                <div v-else class="my-3 flex-column flex-md-row">
                    <input type="text" class="form-control mb-2 mb-md-0 text-center" placeholder="Please generate an API key" readonly aria-label="API Key" aria-describedby="generate-apikey-button" :value="userExtended?.apiKey || ''" />
                    <div v-if="userExtended?.apiKey" class="btn-group w-100">
                        <button class="btn btn-block btn-warning mb-2 mb-md-0" type="button" id="generate-apikey-button" @click="generateApiKey" :disabled="isGenerating || isRevoking">Regenerate API Key</button>
                        <button class="btn btn-block btn-danger mb-2 mb-md-0" type="button" id="revoke-apikey-button" @click="revokeApiKey" :disabled="isRevoking || isGenerating">Revoke API Key</button>
                    </div>
                    <button v-else class="btn w-100 btn-success mb-2 mb-md-0" type="button" id="generate-apikey-button" @click="generateApiKey" :disabled="isGenerating || isRevoking">Generate API Key</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
    hr.thin {
        margin-top: 0.5em;
        margin-bottom: 0.5em;
        border-color: rgba(255, 255, 255, 0.1);
    }

    .card {
        border-color: rgba(255, 255, 255, 0.1);
    }

    .form-control.bg-secondary {
        background-color: #6c757d !important;
    }

    .form-control.bg-secondary::placeholder {
        color: rgba(255, 255, 255, 0.7);
    }

    .form-control.bg-secondary:focus {
        background-color: #6c757d !important;
        color: white !important;
        border-color: #86b7fe;
        box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
    }

    --bs-table-bg {
        background-color: transparent !important;
    }
</style>
