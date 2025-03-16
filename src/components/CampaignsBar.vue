<script setup>
    import { computed, ref } from 'vue';
    import { useDatabase, useDatabaseObject, useCurrentUser } from 'vuefire';
    import { ref as dbRef } from 'firebase/database';

    const db = useDatabase();
    const user = useCurrentUser();

    const campaigns = useDatabaseObject(dbRef(db, `quinn/campaigns/`));
    const discordUsernames = useDatabaseObject(dbRef(db, `quinn/userData/username/`));
    const userExtended = useDatabaseObject(dbRef(db, `users/${user.value.uid}/`));

    const playerCampaigns = computed(() => {
        if (typeof campaigns.value !== 'undefined' && typeof userExtended.value !== 'undefined') {
            return Object.values(campaigns.value).filter((campaign) => {
                if (campaign.dm == userExtended.value.discordID) return true;

                if (typeof campaign.players !== 'undefined') {
                    return Object.keys(campaign.players).includes(userExtended.value.discordID);
                }
            });
        } else return false;
    });

    const usernameFromDiscordID = (discordID) => {
        return typeof discordUsernames.value !== 'undefined' ? discordUsernames.value[discordID] : discordID;
    };
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
