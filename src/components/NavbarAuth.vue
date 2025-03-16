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
    <ul class="navbar-nav ms-auto">
        <li v-if="user" class="nav-item dropdown">
            <a class="nav-link dropdown-toggle text-white" href="#" id="navbarScrollingDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">{{ user.displayName }}</a>
            <ul class="dropdown-menu" aria-labelledby="navbarScrollingDropdown">
                <li class="nav-item">
                    <router-link class="dropdown-item" to="/settings">Settings</router-link>
                </li>
                <li class="nav-item">
                    <a class="text-danger dropdown-item" href="" @click.prevent="signOutButton()">Sign Out</a>
                </li>
            </ul>
        </li>
        <li v-else class="nav-item">
            <a class="nav-link text-white" @click.prevent="signinPopup()" href="">Sign in with google</a>
        </li>
    </ul>
</template>
