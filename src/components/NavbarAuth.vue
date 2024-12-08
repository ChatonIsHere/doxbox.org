<script>
    import { GoogleAuthProvider } from 'firebase/auth';
    export const googleAuthProvider = new GoogleAuthProvider();
</script>

<script setup>
    import { signInWithPopup, signOut } from 'firebase/auth';
    import { ref as dbRef, update } from 'firebase/database';
    import { useCurrentUser, useFirebaseAuth, useDatabase } from 'vuefire';
    import { useRouter } from 'vue-router';

    const auth = useFirebaseAuth();
    const user = useCurrentUser();
    const db = useDatabase();
    const router = useRouter();

    const signinPopup = () => {
        signInWithPopup(auth, googleAuthProvider)
            .then((result) => {
                router.push('/');
                update(dbRef(db, `users/${result.user.uid}/`), {
                    displayName: result.user.displayName,
                    email: result.user.email,
                    lastLogon: Date(),
                });
            })
            .catch((error) => {
                if (error.code === 'auth/admin-restricted-operation') console.log(`${error.customData.email} is not authorised`);
                else console.error(error);
            });
    };

    const signOutButton = () => {
        signOut(auth)
            .then(() => {
                router.push('/');
            })
            .catch((error) => {
                console.error(error);
                router.push('/');
            });
    };
</script>

<template>
    <button v-if="user" @click.prevent="signOutButton()" class="btn btn-secondary">Log Out</button>
    <button v-else @click.prevent="signinPopup()" class="btn btn-secondary">Sign in with google</button>
</template>
