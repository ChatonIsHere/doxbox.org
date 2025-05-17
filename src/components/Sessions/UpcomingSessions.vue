<script setup>
    import { computed, ref, onUnmounted } from 'vue';
    import { getDatabase, ref as dbRef, onValue, update } from 'firebase/database';
    import { useAuthStore } from '@/stores/authStore';
    import { storeToRefs } from 'pinia';

    const db = getDatabase();

    const campaigns = ref(null);
    const campaignsRef = dbRef(db, `quinn/campaigns/`);
    const unsubscribeCampaigns = onValue(campaignsRef, (snapshot) => {
        campaigns.value = snapshot.val();
    });

    const upcomingSessions = ref(null);
    const upcomingSessionsRef = dbRef(db, `sessions/upcoming/`);
    const unsubscribeUpcomingSessions = onValue(upcomingSessionsRef, (snapshot) => {
        upcomingSessions.value = snapshot.val();
    });

    const discordUsernames = ref(null);
    const usernamesRef = dbRef(db, `quinn/userData/username/`);
    const unsubscribeUsernames = onValue(usernamesRef, (snapshot) => {
        discordUsernames.value = snapshot.val();
    });

    onUnmounted(() => {
        unsubscribeCampaigns();
        unsubscribeUpcomingSessions();
        unsubscribeUsernames();
    });

    const authStore = useAuthStore();
    const { user, userExtended } = storeToRefs(authStore);

    const campaignFromID = (id) => {
        return campaigns.value ? Object.values(campaigns.value).find((campaign) => campaign.id === id) : undefined;
    };

    const sortSessions = (sessions) => {
        try {
            let modifiedSessionsArray = [];

            if (sessions && campaigns.value && userExtended.value && userExtended.value.discordID) {
                Object.entries(sessions).forEach((session) => {
                    const campaign = campaigns.value[session[1].campaign];
                    if (campaign) {
                        let players = Object.keys(campaign.players || {});
                        players.push(campaign.dm);

                        if (players.includes(userExtended.value.discordID)) {
                            modifiedSessionsArray.push({
                                id: session[0],
                                campaign: session[1].campaign,
                                date: session[1].date,
                                availability: session[1].availability,
                            });
                        }
                    }
                });

                modifiedSessionsArray.sort((a, b) => new Date(a.date) - new Date(b.date));
            }

            return modifiedSessionsArray;
        } catch (err) {
            console.error(err);
            return [];
        }
    };

    const sessionDateString = (session) => {
        let sessionDate = new Date(session.date);
        let campaign = campaignFromID(session.campaign);

        let dateString = new Intl.DateTimeFormat('en-GB', {
            dateStyle: 'full',
            timeZone: 'Europe/London',
        }).format(sessionDate);

        return `${campaign ? campaign.name : 'Unknown Campaign'} on ${dateString}`;
    };

    const colorFromSession = (session) => {
        let campaign = campaignFromID(session.campaign);

        return campaign && campaign.calendar ? campaign.calendar.color : '#000000';
    };

    const dmsCampaign = computed(() => {
        if (campaigns.value !== null && typeof campaigns.value !== 'undefined' && userExtended.value && typeof userExtended.value.dmCampaign !== 'undefined') return campaigns.value[userExtended.value.dmCampaign];
        else return false;
    });

    const cancelSession = (sessionID) => {
        if (sessionID !== '') update(dbRef(db, `sessions/upcoming/`), { [sessionID]: null });
    };

    const usernameFromDiscordID = (discordID) => {
        return typeof discordUsernames.value !== 'undefined' && discordUsernames.value !== null ? discordUsernames.value[discordID] : discordID;
    };

    const getPlayerAvailability = (session) => {
        if (typeof campaigns.value === 'undefined' || campaigns.value === null || typeof session.availability === 'undefined') return false;

        let available = {
                title: 'Available',
                players: [],
            },
            maybeAvailable = {
                title: 'Maybe Available',
                players: [],
            },
            unavailable = {
                title: 'Unavailable',
                players: [],
            },
            noResponse = {
                title: 'No Response',
                players: [],
            };

        const campaign = campaigns.value[session.campaign];
        if (!campaign) return false;

        let players = Object.keys(campaign.players || {});
        players.push(campaign.dm);

        for (let player of players) {
            switch (session.availability[player]) {
                case 'available':
                    available.players.push(player);
                    break;
                case 'maybeAvailable':
                    maybeAvailable.players.push(player);
                    break;
                case 'unavailable':
                    unavailable.players.push(player);
                    break;
                default:
                    noResponse.players.push(player);
                    break;
            }
        }

        let availabilityArray = [];

        if (available.players.length > 0) availabilityArray.push(available);
        if (maybeAvailable.players.length > 0) availabilityArray.push(maybeAvailable);
        if (unavailable.players.length > 0) availabilityArray.push(unavailable);
        if (noResponse.players.length > 0) availabilityArray.push(noResponse);

        return availabilityArray;
    };

    const updateAvailability = (sessionID, sessionavailabilityType) => {
        if (userExtended.value && userExtended.value.discordID) {
            update(dbRef(db, `sessions/upcoming/${sessionID}/availability/`), {
                [userExtended.value.discordID]: sessionavailabilityType,
            });
        } else {
            console.warn('User data not loaded. Cannot update availability.');
        }
    };
</script>

<template>
    <div class="accordion accordion-flush" id="sessionsAccordion">
        <div class="accordion-item" v-for="session in sortSessions(upcomingSessions)">
            <h2 class="accordion-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" :data-bs-target="`#accordion-${session.date}-${session.campaign}`" aria-expanded="false" :aria-controls="`accordion-${session.date}-${session.campaign}`">{{ sessionDateString(session) }}</button>
                <div style="width: 100%; height: 2px" v-bind:style="{ backgroundColor: colorFromSession(session) }"></div>
            </h2>
            <div :id="`accordion-${session.date}-${session.campaign}`" class="accordion-collapse collapse" data-bs-parent="#sessionsAccordion">
                <div class="accordion-body">
                    <div class="container">
                        <div class="row">
                            <div class="col-12 col-md" v-for="availabilityType in getPlayerAvailability(session) || []">
                                <h5>{{ availabilityType.title }}</h5>
                                <hr class="thin" />
                                <ul class="list-unstyled">
                                    <li v-for="player in availabilityType.players">{{ usernameFromDiscordID(player) }}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="btn-group m-2" v-if="dmsCampaign ? dmsCampaign.id == session.campaign : false" role="group" aria-label="Basic example">
                        <button type="button" class="btn btn-danger btn-info" v-on:click="cancelSession(session.id)">Cancel Session</button>
                    </div>
                    <div class="btn-group m-2" v-else role="group" aria-label="Basic example">
                        <button type="button" v-on:click="updateAvailability(session.id, 'available')" class="btn btn-success">Available</button>
                        <button type="button" v-on:click="updateAvailability(session.id, 'maybeAvailable')" class="btn btn-warning">Maybe Available</button>
                        <button type="button" v-on:click="updateAvailability(session.id, 'unavailable')" class="btn btn-danger">Unavailable</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
    hr.thin {
        margin-top: 0.5em;
        margin-bottom: 0.5em;
    }

    .accordion-button {
        background-color: #1e1e1e;
        color: #ffffff;
    }

    .accordion-button:not(.collapsed) {
        background-color: #212529;
        color: #ffffff;
    }

    .accordion-button:hover {
        background-color: #212529;
        color: #ffffff;
    }
</style>
