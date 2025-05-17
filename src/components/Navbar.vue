<script setup>
    import { storeToRefs } from 'pinia'; // Import storeToRefs
    import NavbarAuth from './NavbarAuth.vue';
    import NavbarEntries from './NavbarEntries.vue';
    import { useAuthStore } from '@/stores/authStore';

    const authStore = useAuthStore();
    const { user } = storeToRefs(authStore); // Use storeToRefs for user
</script>

<template>
    <nav class="navbar navbar-expand-md navbar-dark navbar-laravel mx-4 py-2">
        <div class="container-fluid">
            <!-- Use user from the store -->
            <router-link v-if="user" to="/" class="navbar-brand">Dox Box</router-link>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse me-auto" id="navbarNav">
                <!-- NavbarEntries and NavbarAuth components will use the store internally -->
                <NavbarEntries v-if="user" />
                <NavbarAuth></NavbarAuth>
            </div>
        </div>
    </nav>
</template>
