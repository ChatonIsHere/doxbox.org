<script setup>
    import { useCurrentUser } from 'vuefire';
    import ClickCopy from '../components/ClickCopy.vue';

    const user = useCurrentUser();
</script>

<template>
    <div class="px-4 py-5 text-center">
        <h1 class="display-4 fw-bold text-white" v-if="user">Welcome, {{ user.displayName }}</h1>
        <h1 class="display-4 fw-bold text-white" v-else>Welcome to Dox Box</h1>

        <img id="userAvatar" v-if="user" :src="user.photoURL" class="rounded-circle mb-4 mt-2" />

        <div class="col-lg-6 mx-auto">
            <p class="fs-5 mb-4">A small clan dedicated to shenanigans</p>
            <div class="d-grid gap-2 d-sm-flex justify-content-sm-center btn-block">
                <a v-if="!user" type="button" class="btn btn-outline-light btn-lg px-4" href="https://discord.gg/doxbox">Join the Discord</a>
                <ClickCopy v-else :content="'https://discord.gg/doxbox'" />
            </div>
        </div>
    </div>
</template>
