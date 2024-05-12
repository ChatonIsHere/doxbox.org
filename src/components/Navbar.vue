<template>
    <nav class="navbar navbar-expand-md navbar-dark navbar-laravel">
        <div class="container-fluid">
            <router-link to="/" class="navbar-brand">Dox Box</router-link>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse me-auto" id="navbarNav">
                <ul v-if="user.loggedIn" class="navbar-nav">
                    <li class="nav-item">
                        <router-link to="/" class="nav-link">Home</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link to="/resources" class="nav-link">Resources</router-link>
                    </li>
                    <li class="nav-item">
                        <a href="https://foundry.doxbox.org/" class="nav-link">Foundry VTT</a>
                    </li>
                    <li class="nav-item">
                        <a href="https://dbvps1.doxbox.org/" class="nav-link">Pterodactyl Panel</a>
                    </li>
                </ul>
                <navbarauth class="ms-auto"></navbarauth>
            </div>
        </div>
    </nav>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';

import navbarauth from './NavbarAuth.vue';

export default {
    name: 'NavBar',
    components: {
        navbarauth,
    },
    setup() {
        const store = useStore();

        const user = computed(() => {
            return store.getters.user;
        });

        return { user };
    },
};
</script>
