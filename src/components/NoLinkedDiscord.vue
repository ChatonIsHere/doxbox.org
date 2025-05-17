<script setup>
    import { computed } from 'vue';
    import { useAuthStore } from '@/stores/authStore';

    import ClickCopy from '../components/ClickCopy.vue';

    const authStore = useAuthStore();
    const { user, claims } = authStore;

    const userID = computed(() => (user.value ? user.value.uid : null));
</script>

<template>
    <div class="container" v-if="claims ? !claims.discordID : false">
        <p>Please link your Discord account using the Dox command /link</p>
        <div class="d-grid gap-2 d-sm-flex justify-content-sm-center btn-block">
            <p v-if="userID"><ClickCopy :content="'/link userid:' + userID" /></p>
            <p v-else>Loading user information...</p>
        </div>
    </div>
</template>
