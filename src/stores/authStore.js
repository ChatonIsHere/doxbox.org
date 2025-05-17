import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getAuth, onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase, ref as dbRef, get, update } from 'firebase/database';
import { useToastStore } from '@/stores/toastStore';

const googleAuthProvider = new GoogleAuthProvider();

export const useAuthStore = defineStore(
    'auth',
    () => {
        const user = ref(null);
        const claims = ref(null);
        const userExtended = ref(null);
        const authInitialized = ref(false);

        const toastStore = useToastStore();

        const initAuthListener = () => {
            const auth = getAuth();
            onAuthStateChanged(auth, async (currentUser) => {
                if (currentUser && (!user.value || currentUser.uid !== user.value.uid)) {
                    user.value = JSON.parse(JSON.stringify(currentUser));
                    claims.value = null;
                    userExtended.value = null;

                    try {
                        const tokenResult = await currentUser.getIdTokenResult();
                        claims.value = JSON.parse(JSON.stringify(tokenResult.claims));

                        const db = getDatabase();
                        const userRef = dbRef(db, `users/${currentUser.uid}`);
                        const userSnapshot = await get(userRef);

                        if (userSnapshot.exists()) {
                            userExtended.value = JSON.parse(JSON.stringify(userSnapshot.val()));
                        } else {
                            console.log('No extended user data found in RTDB.');
                        }
                    } catch (error) {
                        console.error('Error fetching user claims or extended data:', error);
                        toastStore.addToast({ message: 'Failed to load user data.', backgroundClass: 'bg-danger' });
                    }
                } else if (!currentUser) {
                    user.value = null;
                    claims.value = null;
                    userExtended.value = null;
                }
                authInitialized.value = true;
            });
        };

        const signInWithGoogle = async () => {
            const auth = getAuth();
            const db = getDatabase();
            try {
                const result = await signInWithPopup(auth, googleAuthProvider);
                const currentUser = result.user;

                user.value = JSON.parse(JSON.stringify(currentUser));

                const tokenResult = await currentUser.getIdTokenResult();
                claims.value = JSON.parse(JSON.stringify(tokenResult.claims));

                const userRef = dbRef(db, `users/${currentUser.uid}`);

                await update(userRef, {
                    displayName: currentUser.displayName,
                    email: currentUser.email,
                    photoURL: currentUser.photoURL,
                    lastLogon: new Date().toISOString(),
                });

                const userSnapshot = await get(userRef);

                if (userSnapshot.exists()) {
                    userExtended.value = JSON.parse(JSON.stringify(userSnapshot.val()));
                } else {
                    console.log('No extended user data found in RTDB after update.');
                    userExtended.value = { uid: currentUser.uid, displayName: currentUser.displayName, email: currentUser.email, photoURL: currentUser.photoURL };
                }

                toastStore.addToast({ message: 'Signed in successfully!', backgroundClass: 'bg-success' });
                return user.value;
            } catch (error) {
                console.error('Error signing in with Google:', error);
                if (error.code === 'auth/admin-restricted-operation') {
                    toastStore.addToast({ message: `${error.customData.email} is not authorised.`, backgroundClass: 'bg-danger' });
                } else {
                    toastStore.addToast({ message: 'Failed to sign in. Please try again.', backgroundClass: 'bg-danger' });
                }
                user.value = null;
                claims.value = null;
                userExtended.value = null;
                throw error;
            } finally {
                authInitialized.value = true;
            }
        };

        const signOutUser = async () => {
            const auth = getAuth();
            try {
                await signOut(auth);
                const store = useAuthStore();
                store.$reset();

                toastStore.addToast({ message: 'Signed out successfully.', backgroundClass: 'bg-success' });
            } catch (error) {
                console.error('Error signing out:', error);
                toastStore.addToast({ message: 'Failed to sign out. Please try again.', backgroundClass: 'bg-danger' });
                throw error;
            }
        };

        const generateApiKey = async (length = 32) => {
            if (!user.value || !userExtended.value) {
                toastStore.addToast({ message: 'User not logged in or user data not loaded.', backgroundClass: 'bg-danger' });
                return null;
            }

            const alreadyHadKey = !!userExtended.value.apiKey;

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

                if (userExtended.value) {
                    userExtended.value = { ...userExtended.value, apiKey: newApiKey };
                } else {
                    const userSnapshot = await get(userRef);
                    if (userSnapshot.exists()) {
                        userExtended.value = JSON.parse(JSON.stringify(userSnapshot.val()));
                    }
                }

                toastStore.addToast({ message: `API Key ${alreadyHadKey ? 're' : ''}generated successfully!`, backgroundClass: 'bg-success' });
                return newApiKey;
            } catch (error) {
                console.error('Error generating API key:', error);
                toastStore.addToast({ message: 'Failed to generate API key. Please try again.', backgroundClass: 'bg-danger' });
                throw error;
            }
        };

        const revokeApiKey = async () => {
            if (!user.value || !userExtended.value) {
                toastStore.addToast({ message: 'User not logged in or user data not loaded.', backgroundClass: 'bg-danger' });
                return;
            }

            if (!confirm('Are you sure you want to revoke your API key? This action cannot be undone.')) {
                return;
            }

            try {
                const db = getDatabase();
                const userRef = dbRef(db, `users/${user.value.uid}`);
                await update(userRef, { apiKey: null });

                if (userExtended.value) {
                    userExtended.value = { ...userExtended.value, apiKey: null };
                }

                toastStore.addToast({ message: 'API Key revoked successfully.', backgroundClass: 'bg-success' });
            } catch (error) {
                console.error('Error revoking API key:', error);
                toastStore.addToast({ message: 'Failed to revoke API key. Please try again.', backgroundClass: 'bg-danger' });
                throw error;
            }
        };

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
            $reset,
        };
    },
    {
        persist: {
            storage: localStorage,
            paths: ['user', 'claims', 'userExtended'],
        },
    }
);
