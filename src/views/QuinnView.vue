<script setup>
  import { computed } from 'vue';
  import { useDatabase, useDatabaseList, useDatabaseObject, useCurrentUser } from 'vuefire';
  import { ref as dbRef } from 'firebase/database';

  const user = useCurrentUser();
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
    <h1 class="display-5 fw-bold text-white pb-4">Average d20 Rolls for Quinn users</h1>
    <table class="table table-dark">
      <thead>
        <tr>
          <th scope="col">User ID</th>
          <th scope="col">Average d20 Roll</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="player in players">
          <td>{{ discordUsername(player.id) }}</td>
          <td>{{ (player.sum / player.count).toFixed(2) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
