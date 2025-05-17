<script setup>
    import { storeToRefs } from 'pinia'; // Import storeToRefs
    import { useDatabase, useDatabaseList } from 'vuefire';
    import { ref as dbRef, query, orderByChild } from 'firebase/database';
    import { useAuthStore } from '@/stores/authStore';

    const db = useDatabase();

    const navInternal = useDatabaseList(query(dbRef(db, 'navigation/internal'), orderByChild('order')));
    const navExternal = useDatabaseList(query(dbRef(db, 'navigation/external'), orderByChild('order')));

    const authStore = useAuthStore();
    const { user, claims } = storeToRefs(authStore); // Use storeToRefs for user and claims

    // customClaims ref and onMounted logic are no longer needed, use store.claims directly
    // const customClaims = ref({});
    // onMounted(async () => {
    //     if (user.value) {
    //         const tokenResult = await user.value.getIdTokenResult();
    //         customClaims.value = tokenResult.claims;
    //     }
    // });
</script>

<template>
    <ul class="navbar-nav">
        <li class="nav-item">
            <router-link to="/" class="nav-link">Home</router-link>
        </li>
        <!-- Use claims from the store -->
        <template v-if="claims && claims.discordID">
            <li v-for="navnode in navInternal" :key="navnode.id" class="nav-item">
                <router-link :to="navnode.route" class="nav-link">{{ navnode.name }}</router-link>
            </li>
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="navbarScrollingDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">External Links</a>
                <ul class="dropdown-menu" aria-labelledby="navbarScrollingDropdown">
                    <li v-for="navnode in navExternal" :key="navnode.id" class="nav-item">
                        <a class="dropdown-item" :href="navnode.url">{{ navnode.name }}</a>
                    </li>
                </ul>
            </li>
        </template>
    </ul>
</template>
