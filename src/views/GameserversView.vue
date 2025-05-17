<script setup>
    import { ref, onUnmounted } from 'vue';
    import GameserverCard from '../components/GameserverCard.vue';
    import { getDatabase, ref as dbRef, onValue } from 'firebase/database';
    import { useAuthStore } from '@/stores/authStore'; // Import auth store
    import { storeToRefs } from 'pinia'; // Import storeToRefs

    const db = getDatabase();

    const gameservers = ref([]);
    const gameserversRef = dbRef(db, 'gameservers');
    const unsubscribeGameservers = onValue(gameserversRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            gameservers.value = Object.entries(data).map(([id, value]) => ({ id, ...value }));
        } else {
            gameservers.value = [];
        }
    });

    onUnmounted(() => {
        unsubscribeGameservers();
    });

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
