<script setup>
    import { ref, onUnmounted } from 'vue';
    import { storeToRefs } from 'pinia';
    import { getDatabase, ref as dbRef, query, orderByChild, onValue } from 'firebase/database';
    import { useAuthStore } from '@/stores/authStore';

    const db = getDatabase();

    const navInternal = ref([]);
    const navInternalRef = query(dbRef(db, 'navigation/internal'), orderByChild('order'));
    const unsubscribeNavInternal = onValue(navInternalRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            navInternal.value = Object.entries(data).map(([id, value]) => ({ id, ...value }));
        } else {
            navInternal.value = [];
        }
    });

    const navExternal = ref([]);
    const navExternalRef = query(dbRef(db, 'navigation/external'), orderByChild('order'));
    const unsubscribeNavExternal = onValue(navExternalRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            navExternal.value = Object.entries(data).map(([id, value]) => ({ id, ...value }));
        } else {
            navExternal.value = [];
        }
    });

    onUnmounted(() => {
        unsubscribeNavInternal();
        unsubscribeNavExternal();
    });

    const authStore = useAuthStore();
    const { user, claims } = storeToRefs(authStore);
</script>

<template>
    <ul class="navbar-nav">
        <li class="nav-item">
            <router-link to="/" class="nav-link">Home</router-link>
        </li>
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
