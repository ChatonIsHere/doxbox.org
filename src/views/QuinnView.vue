<script setup>
    import { useDatabase, useDatabaseList, useDatabaseObject } from 'vuefire';
    import { ref as dbRef } from 'firebase/database';

    const db = useDatabase();

    const usernames = useDatabaseObject(dbRef(db, 'quinn/userData/username'));
    const players = useDatabaseList(dbRef(db, 'quinn/userData/d20'));

    const discordUsername = (userID) => {
        let username = usernames.data.value[userID];
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
                <tr v-for="player in players">
                    <td class="align-middle">{{ discordUsername(player.id) }}</td>
                    <td class="align-middle">{{ (player.sum / player.count).toFixed(2) }}</td>
                    <td class="align-middle">{{ player.count }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
