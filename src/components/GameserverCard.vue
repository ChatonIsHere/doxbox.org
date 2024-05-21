<script setup>
  import ClickCopy from './ClickCopy.vue';

  defineProps(['gameserver']);
</script>

<template>
  <div class="col mt-4">
    <div class="card bg-dark text-light">
      <img class="card-img-top" :src="gameserver.preview" alt="Card image cap" />
      <div class="card-body d-grid">
        <h3 class="card-title">{{ gameserver.name }}</h3>
        <div id="badges" class="mb-4 mt-1">
          <span v-if="gameserver.status === 'running'" class="badge badge-pill bg-success">{{ gameserver.status }}</span>
          <span v-else-if="gameserver.status === 'starting'" class="badge badge-pill text-dark bg-warning">{{ gameserver.status }}</span>
          <span v-else-if="gameserver.status === 'offline'" class="badge badge-pill bg-danger">{{ gameserver.status }}</span>
          <span class="px-1"></span>
          <span v-if="gameserver.password === 'whitelist'" class="badge badge-pill bg-success">whitelist enabled</span>
          <span v-else-if="gameserver.password" class="badge badge-pill bg-success">password enabled</span>
          <span v-else="!gameserver.password" class="badge badge-pill bg-danger">no security</span>
        </div>
        <p class="card-text">{{ gameserver.description }}</p>
        <!-- <a :href="gameserver.link" class="btn btn-primary mb-2">Random URL</a> -->
        <h5 class="mt-2">Connection address</h5>
        <ClickCopy :content="gameserver.address" />
        <h5 class="mt-2" v-if="gameserver.password != 'whitelist'">Password</h5>
        <ClickCopy v-if="gameserver.password != 'whitelist'" :content="gameserver.password" />
      </div>
    </div>
  </div>
</template>

<style scoped>
  img {
    width: 100%;
    object-fit: cover;
  }
</style>
