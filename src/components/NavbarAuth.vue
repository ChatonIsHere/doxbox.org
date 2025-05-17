<script setup>
    import { storeToRefs } from 'pinia';
    import { useAuthStore } from '@/stores/authStore';
    import { useRouter } from 'vue-router';

    const router = useRouter();
    const authStore = useAuthStore();
    const { user } = storeToRefs(authStore);
    const { signInWithGoogle, signOutUser } = authStore;

    const signinPopup = async () => {
        try {
            await signInWithGoogle();
            router.push('/');
        } catch (error) {
            console.error('Component caught error during signin:', error);
        }
    };

    const signOutButton = async () => {
        try {
            await signOutUser();
            router.push('/');
        } catch (error) {
            console.error('Component caught error during signout:', error);
        }
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
