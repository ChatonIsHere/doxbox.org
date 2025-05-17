<script setup>
    import { computed, ref } from 'vue';
    // import { useDatabase } from 'vuefire'; // No longer needed here
    // import { ref as dbRef, update, getDatabase, get } from 'firebase/database'; // No longer needed here
    // import { useCurrentExtendedUser } from '@/composables/useCurrentExtendedUser'; // Remove this import
    import { useAuthStore } from '@/stores/authStore'; // Import the auth store
    import NoLinkedDiscord from '../components/NoLinkedDiscord.vue';
    // import { getAuth } from 'firebase/auth'; // No longer needed here
    import { useToastStore } from '@/stores/toastStore';
    import { storeToRefs } from 'pinia'; // Import storeToRefs

    const appVersion = __APP_VERSION__;

    // const db = useDatabase(); // No longer needed here
    const authStore = useAuthStore(); // Get store instance

    // Use storeToRefs for reactive state properties
    const { user, userExtended } = storeToRefs(authStore);
    // Destructure actions directly (they are not refs)
    const { generateApiKey: storeGenerateApiKey, revokeApiKey: storeRevokeApiKey } = authStore;

    const toastStore = useToastStore();

    // generateSecureRandomString is now in the store, but can be kept here if only used here
    // function generateSecureRandomString(length) {
    //     const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01256789';
    //     const charactersLength = characters.length;
    //     let result = '';

    //     const randomValues = new Uint8Array(length);
    //     crypto.getRandomValues(randomValues);

    //     for (let i = 0; i < length; i++) {
    //         result += characters.charAt(randomValues[i] % charactersLength);
    //     }

    //     return result;
    // }

    const generatedApiKey = ref(''); // Still useful to display the newly generated key temporarily
    const isGenerating = ref(false);
    const isRevoking = ref(false);

    // setMessageWithTimeout is now handled by the toastStore directly in the authStore actions
    // const setMessageWithTimeout = (type, message, duration = 5000) => {
    //     if (type === 'error') {
    //         toastStore.addToast({ message, backgroundClass: 'bg-danger', duration });
    //     } else if (type === 'success') {
    //         toastStore.addToast({ message, backgroundClass: 'bg-success', duration });
    //     }
    // };

    // Use the action from the store
    const generateApiKey = async () => {
        isGenerating.value = true;
        generatedApiKey.value = ''; // Clear previous generated key display

        try {
            const newKey = await storeGenerateApiKey(); // Call the store action
            if (newKey) {
                generatedApiKey.value = newKey; // Display the new key if generated
            }
        } catch (error) {
            // Error handling is done in the store, but we can log here if needed
            console.error('Component caught error during API key generation:', error);
        } finally {
            isGenerating.value = false;
        }
    };

    // Use the action from the store
    const revokeApiKey = async () => {
        isRevoking.value = true;
        try {
            await storeRevokeApiKey(); // Call the store action
        } catch (error) {
            // Error handling is done in the store
            console.error('Component caught error during API key revocation:', error);
        } finally {
            isRevoking.value = false;
        }
    };

    const getUserID = computed(() => {
        return user.value ? user.value.uid : null;
    });
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
                <div class="input-group my-3">
                    <!-- Display the key from userExtended in the store -->
                    <input type="text" class="form-control" placeholder="Please generate an API key" readonly aria-label="API Key" aria-describedby="generate-apikey-button" :value="userExtended?.apiKey || ''" />
                    <!-- Modified buttons and added revoke button -->
                    <template v-if="userExtended?.apiKey">
                        <button class="btn btn-warning" type="button" id="generate-apikey-button" @click="generateApiKey" :disabled="isGenerating || isRevoking">Regenerate API Key</button>
                        <button class="btn btn-danger" type="button" id="revoke-apikey-button" @click="revokeApiKey" :disabled="isRevoking || isGenerating">Revoke API Key</button>
                    </template>
                    <button v-else class="btn btn-success" type="button" id="generate-apikey-button" @click="generateApiKey" :disabled="isGenerating || isRevoking">Generate API Key</button>
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
        background-color: #6c757d !important; /* Ensure secondary background color */
    }

    .form-control.bg-secondary::placeholder {
        color: rgba(255, 255, 255, 0.7); /* Lighter placeholder text */
    }

    .form-control.bg-secondary:focus {
        background-color: #6c757d !important; /* Keep background on focus */
        color: white !important;
        border-color: #86b7fe; /* Bootstrap focus color */
        box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25); /* Bootstrap focus shadow */
    }

    --bs-table-bg {
        background-color: transparent !important;
    }
</style>
