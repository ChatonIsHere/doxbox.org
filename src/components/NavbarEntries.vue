<script setup>
  import { useDatabase, useDatabaseList } from 'vuefire';
  import { ref as dbRef, query, orderByChild } from 'firebase/database';

  const db = useDatabase();

  const navInternal = useDatabaseList(query(dbRef(db, 'navigation/internal'), orderByChild('order')));
  const navExternal = useDatabaseList(query(dbRef(db, 'navigation/external'), orderByChild('order')));
</script>

<template>
  <ul class="navbar-nav">
    <li v-for="navnode in navInternal" :key="navnode.id" class="nav-item">
      <router-link :to="navnode.route" class="nav-link">{{ navnode.name }}</router-link>
    </li>
    <li v-for="navnode in navExternal" :key="navnode.id" class="nav-item">
      <a :href="navnode.url" class="nav-link">{{ navnode.name }}</a>
    </li>
  </ul>
</template>
