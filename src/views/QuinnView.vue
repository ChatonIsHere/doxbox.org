<script setup>
    import { useQuinnStore } from '@/stores/quinnStore';
    import { storeToRefs } from 'pinia';

    const quinnStore = useQuinnStore();
    const { usernames, players } = storeToRefs(quinnStore);

    const discordUsername = (userID) => {
        let username = usernames.value ? usernames.value[userID] : undefined;
        if (!username) username = userID;
        return username;
    };
</script>

<template>
    <div class="px-4 py-5 text-center col-lg-4 mx-auto">
        <h1 class="display-6 fw-bold text-white pb-4">Dice rolling statistics from Quinn</h1>
        <table class="table table-dark">
            <thead>
                <tr>
                    <th scope="col" class="align-middle">User ID</th>
                    <th scope="col" class="align-middle">Average d20 Roll</th>
                    <th scope="col" class="align-middle">d20 Sample Size</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="player in players || []">
                    <td class="align-middle">{{ discordUsername(player.id) }}</td>
                    <td class="align-middle">{{ player.sum !== undefined && player.count > 0 ? (player.sum / player.count).toFixed(2) : 'N/A' }}</td>
                    <td class="align-middle">{{ player.count !== undefined ? player.count : 'N/A' }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
