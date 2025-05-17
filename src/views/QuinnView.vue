<script setup>
    import { ref, onUnmounted } from 'vue';
    import { getDatabase, ref as dbRef, onValue } from 'firebase/database';

    const db = getDatabase();

    const usernames = ref(null);
    const usernamesRef = dbRef(db, 'quinn/userData/username');
    const unsubscribeUsernames = onValue(usernamesRef, (snapshot) => {
        usernames.value = snapshot.val();
    });

    const players = ref([]);
    const playersRef = dbRef(db, 'quinn/userData/d20');
    const unsubscribePlayers = onValue(playersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            players.value = Object.entries(data).map(([id, value]) => ({ id, ...value }));
        } else {
            players.value = [];
        }
    });

    onUnmounted(() => {
        unsubscribeUsernames();
        unsubscribePlayers();
    });

    const discordUsername = (userID) => {
        // Ensure usernames.value exists before accessing properties
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
                <!-- Ensure players is loaded before iterating -->
                <tr v-for="player in players || []">
                    <td class="align-middle">{{ discordUsername(player.id) }}</td>
                    <!-- Ensure player.sum and player.count exist and count is not zero -->
                    <td class="align-middle">{{ player.sum !== undefined && player.count > 0 ? (player.sum / player.count).toFixed(2) : 'N/A' }}</td>
                    <td class="align-middle">{{ player.count !== undefined ? player.count : 'N/A' }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
