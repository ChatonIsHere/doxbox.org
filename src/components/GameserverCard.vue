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
                <div id="badges" class="mb-4 mt-1 text-capitalize">
                    <span v-if="gameserver.status === 'running'" class="badge badge-pill bg-success mx-1">{{ gameserver.status }}</span>
                    <span v-else-if="gameserver.status === 'starting'" class="badge badge-pill text-dark bg-warning mx-1">{{ gameserver.status }}</span>
                    <span v-else-if="gameserver.status === 'offline'" class="badge badge-pill bg-danger mx-1">{{ gameserver.status }}</span>
                    <span v-if="gameserver.password === 'whitelist'" class="badge badge-pill bg-success mx-1">whitelist enabled</span>
                    <span v-else-if="gameserver.password" class="badge badge-pill bg-success mx-1">password enabled</span>
                    <span v-else="!gameserver.password" class="badge badge-pill bg-danger mx-1">no security</span>
                    <span v-if="gameserver.version.primary" class="badge badge-pill bg-info text-dark mx-1">{{ gameserver.version.primary }}</span>
                    <span v-if="gameserver.version.secondary" class="badge badge-pill bg-info text-dark mx-1">{{ gameserver.version.secondary }}</span>
                </div>
                <p class="card-text">{{ gameserver.description }}</p>
                <!-- <a :href="gameserver.link" class="btn btn-primary mb-2">Random URL</a> -->
                <ul class="list-group mb-2">
                    <a v-if="gameserver.resources.primary.name" class="list-group-item bg-dark text-light" :href="gameserver.resources.primary.url">{{ gameserver.resources.primary.name }}</a>
                    <a v-if="gameserver.resources.secondary.name" class="list-group-item bg-dark text-light" :href="gameserver.resources.secondary.url">{{ gameserver.resources.secondary.name }}</a>
                </ul>
                <h5 v-if="gameserver.address" class="mt-2">Connection address</h5>
                <ClickCopy v-if="gameserver.address" :content="gameserver.address" />
                <h5 v-if="gameserver.password && gameserver.password != 'whitelist'" class="mt-2">Password</h5>
                <ClickCopy v-if="gameserver.password && gameserver.password != 'whitelist'" :content="gameserver.password" />
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
