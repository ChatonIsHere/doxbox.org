<script setup>
  import NavbarAuth from './NavbarAuth.vue';
  import { useDatabase, useDatabaseList, useCurrentUser } from 'vuefire';
  import { ref as dbRef, query, orderByChild } from 'firebase/database';

  const db = useDatabase();
  const user = useCurrentUser();

  const navInternal = useDatabaseList(query(dbRef(db, 'navigation/internal'), orderByChild('order')));
  const navExternal = useDatabaseList(query(dbRef(db, 'navigation/external'), orderByChild('order')));
</script>

<template>
  <nav class="navbar navbar-expand-md navbar-dark navbar-laravel">
    <div class="container-fluid">
      <router-link to="/" class="navbar-brand">Dox Box</router-link>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse me-auto" id="navbarNav">
        <ul v-if="user" class="navbar-nav">
          <div class="mx-2 vr align-middle"></div>
          <li v-for="navnode in navInternal" :key="navnode.id" class="nav-item">
            <router-link :to="navnode.route" class="nav-link">{{ navnode.name }}</router-link>
          </li>
          <div class="mx-2 vr align-middle"></div>
          <li v-for="navnode in navExternal" :key="navnode.id" class="nav-item">
            <a :href="navnode.url" class="nav-link">{{ navnode.name }}</a>
          </li>
        </ul>
        <NavbarAuth class="ms-auto"></NavbarAuth>
      </div>
    </div>
  </nav>
</template>
