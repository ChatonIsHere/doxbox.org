<script setup>
    import { ref, onUnmounted } from 'vue';
    import GameserverCard from '@/components/GameserverCard.vue';
    import { useAuthStore } from '@/stores/authStore';
    import { storeToRefs } from 'pinia';
    import { useGameserverStore } from '@/stores/gameserverStore';

    const authStore = useAuthStore();
    const { user } = storeToRefs(authStore);

    // Use the new store
    const gameserverStore = useGameserverStore();
    const { gameservers } = storeToRefs(gameserverStore);
</script>

<template>
    <div class="px-4 py-5 text-center">
        <h1 class="display-6 fw-bold text-white" v-if="user">Gameservers</h1>
    </div>
    <div class="container-fluid mb-4">
        <div class="row justify-content-center row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5">
            <GameserverCard v-for="gameserver in gameservers" :gameserver="gameserver" />
        </div>
    </div>
</template>
