<script setup>
    import { useSessionsStore } from '@/stores/sessionsStore';
    import { storeToRefs } from 'pinia';

    const sessionsStore = useSessionsStore();
    const { playerCampaigns } = storeToRefs(sessionsStore);
</script>

<template>
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-12 col-md-6 col-lg-4 col-xl-2 pb-2" v-for="campaign in playerCampaigns" :key="campaign.id">
                <div class="card h-100 d-flex flex-column">
                    <div class="card-header p-3">
                        <h4>{{ campaign.name }}</h4>
                    </div>
                    <div style="width: 100%; height: 2px" v-bind:style="{ backgroundColor: campaign.calendar.color }"></div>
                    <ul class="list-group list-group-flush flex-grow-1">
                        <li class="list-group-item">
                            <h5>DM</h5>
                            <ul class="list-unstyled">
                                <li>{{ sessionsStore.usernameFromDiscordID(campaign.dm) }}</li>
                            </ul>
                        </li>
                        <li class="list-group-item">
                            <h5>Players</h5>
                            <ul class="list-unstyled">
                                <li v-for="player in Object.keys(campaign.players || {})" :key="player">{{ sessionsStore.usernameFromDiscordID(player) }}</li>
                            </ul>
                        </li>
                    </ul>
                    <div class="card-footer text-muted">
                        <a class="btn btn-primary btn-info m-2" v-if="campaign.details.url !== 'https://www.dndbeyond.com/my-campaigns'" :href="campaign.details.url">Campaign</a>
                        <a class="btn btn-primary btn-success m-2" v-if="campaign.details.map !== 'https://shmeppy.com/'" :href="campaign.details.map">Battlemap</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
    .vc-prev,
    .vc-next,
    .vc-title {
        background-color: #00000000 !important;
        color: white !important;
    }

    .vc-container {
        background-color: #343a4022;
        border-radius: 5px;
        color: white !important;
    }
</style>
