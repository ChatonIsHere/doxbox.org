<script setup>
    import { computed } from 'vue';
    import { useDatabase, useDatabaseObject } from 'vuefire'; // Removed useCurrentUser
    import { ref as dbRef } from 'firebase/database';
    import { useAuthStore } from '@/stores/authStore'; // Import auth store
    import { storeToRefs } from 'pinia'; // Import storeToRefs

    const db = useDatabase();
    // const user = useCurrentUser(); // Removed

    const campaigns = useDatabaseObject(dbRef(db, `quinn/campaigns/`));
    const discordUsernames = useDatabaseObject(dbRef(db, `quinn/userData/username/`));
    // const userExtended = useDatabaseObject(dbRef(db, `users/${user.value.uid}/`)); // Removed

    const authStore = useAuthStore(); // Get store instance
    const { user, userExtended } = storeToRefs(authStore); // Use storeToRefs for user and userExtended

    const playerCampaigns = computed(() => {
        // Use userExtended from the store
        if (typeof campaigns.value !== 'undefined' && userExtended.value && typeof userExtended.value.discordID !== 'undefined') {
            return Object.values(campaigns.value).filter((campaign) => {
                if (campaign.dm == userExtended.value.discordID) return true;

                if (typeof campaign.players !== 'undefined') {
                    return Object.keys(campaign.players).includes(userExtended.value.discordID);
                }
            });
        } else return []; // Return empty array if data is not ready
    });

    const usernameFromDiscordID = (discordID) => {
        return typeof discordUsernames.value !== 'undefined' ? discordUsernames.value[discordID] : discordID;
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
                                <li v-for="player in Object.keys(campaign.players)" :key="player">{{ usernameFromDiscordID(player) }}</li>
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
