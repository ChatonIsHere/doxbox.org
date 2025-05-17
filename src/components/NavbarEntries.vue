<script setup>
    import { storeToRefs } from 'pinia';
    import { useAuthStore } from '@/stores/authStore';
    import { useNavigationStore } from '@/stores/navigationStore';

    const authStore = useAuthStore();
    const { user, claims } = storeToRefs(authStore);

    const navigationStore = useNavigationStore();
    const { internalNav, externalNav } = storeToRefs(navigationStore);
</script>

<template>
    <ul class="navbar-nav">
        <li class="nav-item">
            <router-link to="/" class="nav-link">Home</router-link>
        </li>
        <template v-if="claims && claims.discordID">
            <li v-for="navnode in internalNav" :key="navnode.id" class="nav-item">
                <router-link :to="navnode.route" class="nav-link">{{ navnode.name }}</router-link>
            </li>
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="navbarScrollingDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">External Links</a>
                <ul class="dropdown-menu" aria-labelledby="navbarScrollingDropdown">
                    <li v-for="navnode in externalNav" :key="navnode.id" class="nav-item">
                        <a class="dropdown-item" :href="navnode.url">{{ navnode.name }}</a>
                    </li>
                </ul>
            </li>
        </template>
    </ul>
</template>
