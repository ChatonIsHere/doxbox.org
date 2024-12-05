<script setup>
    import NavbarAuth from './NavbarAuth.vue';
    import NavbarEntries from './NavbarEntries.vue';
    import { useCurrentUser } from 'vuefire';

    const user = useCurrentUser();
</script>

<template>
    <nav class="navbar navbar-expand-md navbar-dark navbar-laravel">
        <div class="container-fluid">
            <router-link to="/" class="navbar-brand">Dox Box</router-link>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse me-auto" id="navbarNav">
                <NavbarEntries v-if="user" />
                <NavbarAuth class="ms-auto"></NavbarAuth>
            </div>
        </div>
    </nav>
</template>
