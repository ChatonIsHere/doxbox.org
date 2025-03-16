<script setup>
    import { computed } from 'vue';
    import { useCurrentUser } from 'vuefire';
    import NoLinkedDiscord from '../components/NoLinkedDiscord.vue';

    const user = useCurrentUser();

    const getUserID = computed(() => {
        return user.value.uid;
    });
</script>

<template>
    <div class="px-4 py-5 text-center">
        <h4 class="display-4 fw-bold text-white pb-4">Settings :3</h4>
        <NoLinkedDiscord />
    </div>
</template>

<style>
    --bs-table-bg {
        background-color: transparent !important;
    }
</style>
