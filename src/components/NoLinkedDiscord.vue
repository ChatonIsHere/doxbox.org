<script setup>
    import { computed } from 'vue';
    import { useDatabase } from 'vuefire';
    import { useCurrentExtendedUser } from '@/composables/useCurrentExtendedUser';

    import ClickCopy from '../components/ClickCopy.vue';

    const db = useDatabase();
    const { user, claims } = useCurrentExtendedUser();
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
