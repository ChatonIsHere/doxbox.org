import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getAuth, onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase, ref as dbRef, get, update } from 'firebase/database';
import { useToastStore } from '@/stores/toastStore'; // Assuming toastStore is needed for feedback

const googleAuthProvider = new GoogleAuthProvider();

export const useAuthStore = defineStore(
    'auth',
    () => {
        const user = ref(null);
        const claims = ref(null);
        const userExtended = ref(null);
        const authInitialized = ref(false); // To track if the initial auth state has been processed

        const toastStore = useToastStore();

        // Function to set up the Firebase Auth state listener
        const initAuthListener = () => {
            const auth = getAuth();
            onAuthStateChanged(auth, async (currentUser) => {
                // Only update state and fetch data if the user object is different
                // or if it's the initial load and user is present.
                // This helps avoid redundant fetches if signInWithGoogle already updated the state.
                if (currentUser && (!user.value || currentUser.uid !== user.value.uid)) {
                    // Serialize and parse currentUser to avoid cross-origin issues
                    user.value = JSON.parse(JSON.stringify(currentUser));
                    claims.value = null; // Clear claims and extended user on auth state change
                    userExtended.value = null;

                    try {
                        // Fetch claims
                        const tokenResult = await currentUser.getIdTokenResult();
                        // Serialize and parse claims
                        claims.value = JSON.parse(JSON.stringify(tokenResult.claims));

                        // Fetch extended user data from RTDB
                        const db = getDatabase();
                        const userRef = dbRef(db, `users/${currentUser.uid}`);
                        const userSnapshot = await get(userRef);

                        if (userSnapshot.exists()) {
                            // Serialize and parse extended user data
                            userExtended.value = JSON.parse(JSON.stringify(userSnapshot.val()));
                        } else {
                            console.log('No extended user data found in RTDB.');
                            // Optionally create a basic user entry if it doesn't exist
                            // await update(userRef, { uid: currentUser.uid, displayName: currentUser.displayName, email: currentUser.email });
                            // userExtended.value = { uid: currentUser.uid, displayName: currentUser.displayName, email: currentUser.email };
                        }
                    } catch (error) {
                        console.error('Error fetching user claims or extended data:', error);
                        toastStore.addToast({ message: 'Failed to load user data.', backgroundClass: 'bg-danger' });
                    }
                } else if (!currentUser) {
                    // Clear state on sign out
                    user.value = null;
                    claims.value = null;
                    userExtended.value = null;
                }
                authInitialized.value = true; // Mark as initialized after processing
            });
        };

        // Sign in with Google popup
        const signInWithGoogle = async () => {
            const auth = getAuth();
            const db = getDatabase();
            try {
                const result = await signInWithPopup(auth, googleAuthProvider);
                const currentUser = result.user; // Get user from popup result

                // Serialize and parse currentUser immediately
                user.value = JSON.parse(JSON.stringify(currentUser));

                // Fetch claims
                const tokenResult = await currentUser.getIdTokenResult();
                // Serialize and parse claims
                claims.value = JSON.parse(JSON.stringify(tokenResult.claims));

                const userRef = dbRef(db, `users/${currentUser.uid}`);

                // Update last logon timestamp and include photoURL
                await update(userRef, {
                    displayName: currentUser.displayName,
                    email: currentUser.email,
                    photoURL: currentUser.photoURL, // Add photoURL here
                    lastLogon: new Date().toISOString(), // Use ISO string for consistent date format
                });

                // Fetch extended user data *after* the update
                const userSnapshot = await get(userRef);

                if (userSnapshot.exists()) {
                    // Serialize and parse extended user data
                    userExtended.value = JSON.parse(JSON.stringify(userSnapshot.val()));
                } else {
                    console.log('No extended user data found in RTDB after update.');
                    // This case should be less likely now, but handle defensively
                    userExtended.value = { uid: currentUser.uid, displayName: currentUser.displayName, email: currentUser.email, photoURL: currentUser.photoURL };
                }

                toastStore.addToast({ message: 'Signed in successfully!', backgroundClass: 'bg-success' });
                // Return the serialized user object
                return user.value;
            } catch (error) {
                console.error('Error signing in with Google:', error);
                if (error.code === 'auth/admin-restricted-operation') {
                    toastStore.addToast({ message: `${error.customData.email} is not authorised.`, backgroundClass: 'bg-danger' });
                } else {
                    toastStore.addToast({ message: 'Failed to sign in. Please try again.', backgroundClass: 'bg-danger' });
                }
                // Clear state on sign-in error
                user.value = null;
                claims.value = null;
                userExtended.value = null;
                throw error; // Re-throw to allow components to handle
            } finally {
                authInitialized.value = true; // Mark as initialized after processing
            }
        };

        // Sign out user
        const signOutUser = async () => {
            const auth = getAuth();
            try {
                await signOut(auth);
                // User state will be cleared by the onAuthStateChanged listener
                // Clear persisted state as well
                const store = useAuthStore(); // Get the store instance
                store.$reset(); // Reset the store state

                toastStore.addToast({ message: 'Signed out successfully.', backgroundClass: 'bg-success' });
            } catch (error) {
                console.error('Error signing out:', error);
                toastStore.addToast({ message: 'Failed to sign out. Please try again.', backgroundClass: 'bg-danger' });
                throw error; // Re-throw to allow components to handle
            }
        };

        // Generate API Key
        const generateApiKey = async (length = 32) => {
            if (!user.value || !userExtended.value) {
                toastStore.addToast({ message: 'User not logged in or user data not loaded.', backgroundClass: 'bg-danger' });
                return null;
            }

            const alreadyHadKey = !!userExtended.value.apiKey;

            // Added confirmation, but only for regeneration
            if (alreadyHadKey && !confirm('Are you sure you want to regenerate your API key?')) {
                return null;
            }

            try {
                const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01256789';
                const charactersLength = characters.length;
                let result = '';

                const randomValues = new Uint8Array(length);
                crypto.getRandomValues(randomValues);

                for (let i = 0; i < length; i++) {
                    result += characters.charAt(randomValues[i] % charactersLength);
                }

                const newApiKey = `doxbox_${result}`;
                const db = getDatabase();
                const userRef = dbRef(db, `users/${user.value.uid}`);
                await update(userRef, { apiKey: newApiKey });

                // Manually update the userExtended state in the store
                if (userExtended.value) {
                    // Create a new object to ensure reactivity updates
                    userExtended.value = { ...userExtended.value, apiKey: newApiKey };
                } else {
                    // Handle case where userExtended was null (shouldn't happen if user.value exists, but defensive)
                    const userSnapshot = await get(userRef);
                    if (userSnapshot.exists()) {
                        userExtended.value = JSON.parse(JSON.stringify(userSnapshot.val()));
                    }
                }

                toastStore.addToast({ message: `API Key ${alreadyHadKey ? 're' : ''}generated successfully!`, backgroundClass: 'bg-success' });
                return newApiKey; // Return the new key immediately
            } catch (error) {
                console.error('Error generating API key:', error);
                toastStore.addToast({ message: 'Failed to generate API key. Please try again.', backgroundClass: 'bg-danger' });
                throw error;
            }
        };

        // Revoke API Key
        const revokeApiKey = async () => {
            if (!user.value || !userExtended.value) {
                toastStore.addToast({ message: 'User not logged in or user data not loaded.', backgroundClass: 'bg-danger' });
                return;
            }

            // Added confirmation
            if (!confirm('Are you sure you want to revoke your API key? This action cannot be undone.')) {
                return;
            }

            try {
                const db = getDatabase();
                const userRef = dbRef(db, `users/${user.value.uid}`);
                await update(userRef, { apiKey: null }); // Set apiKey to null

                // Manually update the userExtended state in the store
                if (userExtended.value) {
                    // Create a new object to ensure reactivity updates
                    userExtended.value = { ...userExtended.value, apiKey: null };
                }

                // The onAuthStateChanged listener will pick up the change and update userExtended
                toastStore.addToast({ message: 'API Key revoked successfully.', backgroundClass: 'bg-success' });
            } catch (error) {
                console.error('Error revoking API key:', error);
                toastStore.addToast({ message: 'Failed to revoke API key. Please try again.', backgroundClass: 'bg-danger' });
                throw error;
            }
        };

        // Manually implement $reset for setup stores
        const $reset = () => {
            user.value = null;
            claims.value = null;
            userExtended.value = null;
            authInitialized.value = false;
        };

        return {
            user,
            claims,
            userExtended,
            authInitialized,
            initAuthListener,
            signInWithGoogle,
            signOutUser,
            generateApiKey,
            revokeApiKey,
            $reset, // Expose the reset function
        };
    },
    {
        // Configure pinia-plugin-persistedstate
        persist: {
            storage: localStorage,
            paths: ['user', 'claims', 'userExtended'], // Specify which state properties to persist
        },
    }
);
