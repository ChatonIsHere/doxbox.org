<script setup>
    import GameserverCard from '../components/GameserverCard.vue';
    import { useDatabase, useDatabaseList, useCurrentUser } from 'vuefire';
    import { ref as dbRef } from 'firebase/database';

    const db = useDatabase();
    const user = useCurrentUser();

    const gameservers = useDatabaseList(dbRef(db, 'gameservers'));
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
