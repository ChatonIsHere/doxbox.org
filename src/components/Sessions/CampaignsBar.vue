<script setup>
    import { computed, ref, onUnmounted } from 'vue';
    import { getDatabase, ref as dbRef, onValue } from 'firebase/database';
    import { useAuthStore } from '@/stores/authStore'; // Import auth store
    import { storeToRefs } from 'pinia'; // Import storeToRefs

    const db = getDatabase();

    const campaigns = ref(null);
    const campaignsRef = dbRef(db, `quinn/campaigns/`);
    const unsubscribeCampaigns = onValue(campaignsRef, (snapshot) => {
        campaigns.value = snapshot.val();
    });

    const discordUsernames = ref(null);
    const usernamesRef = dbRef(db, `quinn/userData/username/`);
    const unsubscribeUsernames = onValue(usernamesRef, (snapshot) => {
        discordUsernames.value = snapshot.val();
    });

    onUnmounted(() => {
        unsubscribeCampaigns();
        unsubscribeUsernames();
    });

    const authStore = useAuthStore(); // Get store instance
    const { user, userExtended } = storeToRefs(authStore); // Use storeToRefs for user and userExtended

    const playerCampaigns = computed(() => {
        // Use userExtended from the store
        if (typeof campaigns.value !== 'undefined' && campaigns.value !== null && userExtended.value && typeof userExtended.value.discordID !== 'undefined') {
            return Object.values(campaigns.value).filter((campaign) => {
                if (campaign.dm == userExtended.value.discordID) return true;

                if (typeof campaign.players !== 'undefined') {
                    return Object.keys(campaign.players).includes(userExtended.value.discordID);
                }
            });
        } else return []; // Return empty array if data is not ready
    });

    const usernameFromDiscordID = (discordID) => {
        return typeof discordUsernames.value !== 'undefined' && discordUsernames.value !== null ? discordUsernames.value[discordID] : discordID;
    };
</script>

<template>
    <div class="container">
        <div class="row justify-content-center">
            <!-- Ensure playerCampaigns is an array before iterating -->
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
                                <li>{{ usernameFromDiscordID(campaign.dm) }}</li>
                            </ul>
                        </li>
                        <li class="list-group-item">
                            <h5>Players</h5>
                            <ul class="list-unstyled">
                                <li v-for="player in Object.keys(campaign.players || {})" :key="player">{{ usernameFromDiscordID(player) }}</li>
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
