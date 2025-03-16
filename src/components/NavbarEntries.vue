<script setup>
    import { ref, onMounted } from 'vue';
    import { useDatabase, useDatabaseList, useCurrentUser } from 'vuefire';
    import { ref as dbRef, query, orderByChild } from 'firebase/database';

    const db = useDatabase();

    const navInternal = useDatabaseList(query(dbRef(db, 'navigation/internal'), orderByChild('order')));
    const navExternal = useDatabaseList(query(dbRef(db, 'navigation/external'), orderByChild('order')));

    const user = useCurrentUser();
    const customClaims = ref({});

    onMounted(async () => {
        if (user.value) {
            const tokenResult = await user.value.getIdTokenResult();
            customClaims.value = tokenResult.claims;
        }
    });
</script>

<template>
    <ul class="navbar-nav">
        <li class="nav-item">
            <router-link to="/" class="nav-link">Home</router-link>
        </li>
        <template v-if="customClaims.discordID">
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
