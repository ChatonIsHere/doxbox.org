<script setup>
    import { computed } from 'vue';
    import { useDatabase, useDatabaseObject, useCurrentUser } from 'vuefire';
    import { ref as dbRef, update } from 'firebase/database';

    const db = useDatabase();
    const user = useCurrentUser();

    const campaigns = useDatabaseObject(dbRef(db, `quinn/campaigns/`));
    const upcomingSessions = useDatabaseObject(dbRef(db, `sessions/upcoming/`));

    const userExtended = useDatabaseObject(dbRef(db, `users/${user.value.uid}/`));

    const discordUsernames = useDatabaseObject(dbRef(db, `quinn/userData/username/`));

    const campaignFromID = (id) => {
        return Object.values(campaigns.value).find((campaign) => campaign.id === id);
    };

    const sortSessions = (sessions) => {
        try {
            let modifiedSessionsArray = [];

            Object.entries(sessions).forEach((session) => {
                let players = Object.keys(campaigns.value[session[1].campaign].players);
                players.push(campaigns.value[session[1].campaign].dm);

                if (players.includes(userExtended.value.discordID)) {
                    modifiedSessionsArray.push({
                        id: session[0],
                        campaign: session[1].campaign,
                        date: session[1].date,
                        availability: session[1].availability,
                    });
                }
            });

            modifiedSessionsArray.sort((a, b) => new Date(a.date) - new Date(b.date));

            return modifiedSessionsArray;
        } catch (err) {
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

        return `${campaign.name} on ${dateString}`;
    };

    const dmsCampaign = computed(() => {
        if (typeof campaigns.value !== 'undefined' && typeof userExtended.value !== 'undefined') return campaigns.value[userExtended.value.dmCampaign];
        else return false;
    });

    const cancelSession = (sessionID) => {
        if (sessionID !== '') update(dbRef(db, `sessions/upcoming/`), { [sessionID]: null });
    };

    const usernameFromDiscordID = (discordID) => {
        return typeof discordUsernames.value !== 'undefined' ? discordUsernames.value[discordID] : discordID;
    };

    const getPlayerAvailability = (session) => {
        if (typeof campaigns.value === 'undefined' || typeof session.availability === 'undefined') return false;

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

        let players = Object.keys(campaigns.value[session.campaign].players);
        players.push(campaigns.value[session.campaign].dm);

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
        update(dbRef(db, `sessions/upcoming/${sessionID}/availability/`), {
            [userExtended.value.discordID]: sessionavailabilityType,
        });
    };
</script>

<template>
    <div class="accordion accordion-flush" id="sessionsAccordion">
        <div class="accordion-item" v-for="session in sortSessions(upcomingSessions)">
            <h2 class="accordion-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" :data-bs-target="`#accordion-${session.date}-${session.campaign}`" aria-expanded="false" :aria-controls="`accordion-${session.date}-${session.campaign}`">{{ sessionDateString(session) }}</button>
            </h2>
            <div :id="`accordion-${session.date}-${session.campaign}`" class="accordion-collapse collapse" data-bs-parent="#sessionsAccordion">
                <div class="accordion-body">
                    <div class="container">
                        <div class="row">
                            <div class="col" v-for="availabilityType in getPlayerAvailability(session)">
                                <h5>{{ availabilityType.title }}</h5>
                                <hr class="thin" />
                                <ul class="list-unstyled">
                                    <li v-for="player in availabilityType.players">{{ usernameFromDiscordID(player) }}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="btn-group m-2" v-if="dmsCampaign.id == session.campaign" role="group" aria-label="Basic example">
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

<style>
    hr.thin {
        margin-top: 0.5em;
        margin-bottom: 0.5em;
    }
</style>
