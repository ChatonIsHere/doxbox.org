<script setup>
    import { useDatabase, useDatabaseList, useDatabaseObject } from 'vuefire'; // Keep for database interaction
    import { ref as dbRef } from 'firebase/database'; // Keep for dbRef

    const db = useDatabase();

    const usernames = useDatabaseObject(dbRef(db, 'quinn/userData/username'));
    const players = useDatabaseList(dbRef(db, 'quinn/userData/d20'));

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
