<script setup>
    import { storeToRefs } from 'pinia'; // Import storeToRefs
    import { signInWithPopup, signOut } from 'firebase/auth';
    import { useAuthStore } from '@/stores/authStore';
    import { useRouter } from 'vue-router';

    const router = useRouter();
    const authStore = useAuthStore();
    const { user } = storeToRefs(authStore); // Use storeToRefs for user
    const { signInWithGoogle, signOutUser } = authStore; // Actions don't need storeToRefs

    const signinPopup = async () => {
        try {
            await signInWithGoogle(); // Call the store action
            router.push('/');
        } catch (error) {
            // Error handling is done in the store, but router push might need adjustment
            console.error('Component caught error during signin:', error);
        }
    };

    const signOutButton = async () => {
        try {
            await signOutUser(); // Call the store action
            router.push('/');
        } catch (error) {
            // Error handling is done in the store
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
