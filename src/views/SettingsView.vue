<script setup>
    import { computed, ref } from 'vue';
    import { useDatabase } from 'vuefire';
    import { ref as dbRef, update, getDatabase, get } from 'firebase/database';
    import { useCurrentExtendedUser } from '@/composables/useCurrentExtendedUser';
    import NoLinkedDiscord from '../components/NoLinkedDiscord.vue';
    import { getAuth } from 'firebase/auth';
    import { useToastStore } from '@/stores/toastStore';

    const appVersion = __APP_VERSION__;

    const db = useDatabase();
    const { user, userExtended } = useCurrentExtendedUser();
    const toastStore = useToastStore();

    function generateSecureRandomString(length) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01256789';
        const charactersLength = characters.length;
        let result = '';

        const randomValues = new Uint8Array(length);
        crypto.getRandomValues(randomValues);

        for (let i = 0; i < length; i++) {
            result += characters.charAt(randomValues[i] % charactersLength);
        }

        return result;
    }

    const generatedApiKey = ref('');
    const isGenerating = ref(false);
    const isRevoking = ref(false);

    const setMessageWithTimeout = (type, message, duration = 5000) => {
        if (type === 'error') {
            toastStore.addToast({ message, backgroundClass: 'bg-danger', duration });
        } else if (type === 'success') {
            toastStore.addToast({ message, backgroundClass: 'bg-success', duration });
        }
    };

    const hasApiKey = computed(() => {
        return userExtended.value && userExtended.value.apiKey;
    });

    const generateApiKey = async () => {
        const alreadyHadKey = !!hasApiKey.value;

        // Added confirmation, but only for regeneration
        if (alreadyHadKey && !confirm('Are you sure you want to regenerate your API key?')) {
            return;
        }

        if (!user.value || !userExtended.value) {
            setMessageWithTimeout('error', 'User not logged in or user data not loaded.');
            return;
        }

        isGenerating.value = true;
        // clearMessages(); // No longer needed with toast store
        generatedApiKey.value = '';

        try {
            const randomString = generateSecureRandomString(32);
            const newApiKey = `doxbox_${randomString}`;

            const userRef = dbRef(db, `users/${user.value.uid}`);
            await update(userRef, { apiKey: newApiKey });

            // Refresh user data after update
            const auth = getAuth();
            const currentUser = auth.currentUser;

            if (currentUser) {
                const database = getDatabase();
                const updatedUserRef = dbRef(database, `users/${currentUser.uid}`);
                const updatedUserSnapshot = await get(updatedUserRef);

                if (updatedUserSnapshot.exists()) {
                    userExtended.value = updatedUserSnapshot.val();
                } else {
                    console.log('No such document after update!');
                    userExtended.value = null;
                }
            }

            generatedApiKey.value = newApiKey;
            setMessageWithTimeout('success', hasApiKey.value ? `API Key ${alreadyHadKey ? 're' : ''}generated successfully!` : 'API Key generated successfully!');
        } catch (error) {
            console.error('Error generating API key:', error);
            setMessageWithTimeout('error', 'Failed to generate API key. Please try again.');
        } finally {
            isGenerating.value = false;
        }
    };

    // Added revoke function
    const revokeApiKey = async () => {
        // Added confirmation
        if (!confirm('Are you sure you want to revoke your API key? This action cannot be undone.')) {
            return;
        }

        if (!user.value || !userExtended.value) {
            setMessageWithTimeout('error', 'User not logged in or user data not loaded.');
            return;
        }

        isRevoking.value = true;
        // clearMessages(); // No longer needed with toast store

        try {
            const userRef = dbRef(db, `users/${user.value.uid}`);
            await update(userRef, { apiKey: null }); // Set apiKey to null

            // Refresh user data after update
            const auth = getAuth();
            const currentUser = auth.currentUser;

            if (currentUser) {
                const database = getDatabase();
                const updatedUserRef = dbRef(database, `users/${currentUser.uid}`);
                const updatedUserSnapshot = await get(updatedUserRef);

                if (updatedUserSnapshot.exists()) {
                    userExtended.value = updatedUserSnapshot.val();
                } else {
                    console.log('No such document after update!');
                    userExtended.value = null;
                }
            }

            setMessageWithTimeout('success', 'API Key revoked successfully.');
        } catch (error) {
            console.error('Error revoking API key:', error);
            setMessageWithTimeout('error', 'Failed to revoke API key. Please try again.');
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
            <NoLinkedDiscord class="pt-4" />

            <div>
                <h3 class="fw-bold text-white pb-4">Dox Box API Key</h3>
                <p>This API key is currently only used for the Quinn Shmeppy Extension.</p>
                <p>Please do not share this with anyone, as it grants access to limited Quinn features remotely.</p>
                <div class="input-group my-3">
                    <input type="text" class="form-control" placeholder="Please generate an API key" readonly aria-label="API Key" aria-describedby="generate-apikey-button" :value="userExtended?.apiKey || ''" />
                    <!-- Modified buttons and added revoke button -->
                    <button v-if="!hasApiKey" class="btn btn-success" type="button" id="generate-apikey-button" @click="generateApiKey" :disabled="isGenerating || isRevoking">Generate API Key</button>
                    <button v-if="hasApiKey" class="btn btn-warning" type="button" id="generate-apikey-button" @click="generateApiKey" :disabled="isGenerating || isRevoking">Regenerate API Key</button>
                    <button v-if="hasApiKey" class="btn btn-danger" type="button" id="revoke-apikey-button" @click="revokeApiKey" :disabled="isRevoking || isGenerating">Revoke API Key</button>
                </div>
                <!-- Messages will disappear due to timeout logic -->
                <!-- Remove the message display paragraphs -->
                <!-- <p v-if="errorMessage" class="text-danger mt-3">{{ errorMessage }}</p> -->
                <!-- <p v-if="successMessage" class="text-success mt-3">{{ successMessage }}</p> -->
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
