<script setup>
    import GameserverCard from '../components/GameserverCard.vue';
    import { useDatabase, useDatabaseList } from 'vuefire'; // Keep useDatabase, useDatabaseList
    import { ref as dbRef } from 'firebase/database'; // Keep ref as dbRef
    import { useAuthStore } from '@/stores/authStore'; // Import auth store
    import { storeToRefs } from 'pinia'; // Import storeToRefs

    const db = useDatabase();

    const gameservers = useDatabaseList(dbRef(db, 'gameservers'));

    const authStore = useAuthStore(); // Get store instance
    const { user } = storeToRefs(authStore); // Use storeToRefs for user
</script>

<template>
    <div class="px-4 py-5 text-center">
        <!-- Use user from the store -->
        <h1 class="display-6 fw-bold text-white" v-if="user">Gameservers</h1>
    </div>
    <div class="container-fluid mb-4">
        <div class="row justify-content-center row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5">
            <GameserverCard v-for="gameserver in gameservers" :gameserver="gameserver" />
        </div>
    </div>
</template>
