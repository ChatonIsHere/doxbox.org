<script setup>
    import { computed } from 'vue';
    import { useDatabase, useDatabaseObject, useCurrentUser } from 'vuefire';
    import { ref as dbRef, update } from 'firebase/database';

    const db = useDatabase();
    const user = useCurrentUser();

    const campaigns = useDatabaseObject(dbRef(db, `quinn/campaigns/`));
    const upcomingSessions = useDatabaseObject(dbRef(db, `sessions/upcoming/`));

    const userExtended = useDatabaseObject(dbRef(db, `users/${user.value.uid}/`));

    const campaignFromID = (id) => {
        return Object.values(campaigns.value).find((campaign) => campaign.id === id);
    };

    const sortSessions = (sessions) => {
        try {
            let modifiedSessionsArray = [];

            Object.entries(sessions).forEach((session) => {
                modifiedSessionsArray.push({
                    id: session[0],
                    campaign: session[1].campaign,
                    date: session[1].date,
                });
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
</script>

<template>
    <div class="accordion accordion-flush" id="sessionsAccordion">
        <div class="accordion-item" v-for="session in sortSessions(upcomingSessions)">
            <h2 class="accordion-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" :data-bs-target="`#accordion-${session.date}-${session.campaign}`" aria-expanded="false" :aria-controls="`accordion-${session.date}-${session.campaign}`">{{ sessionDateString(session) }}</button>
            </h2>
            <div :id="`accordion-${session.date}-${session.campaign}`" class="accordion-collapse collapse" data-bs-parent="#sessionsAccordion">
                <div class="accordion-body">
                    <a class="btn btn-danger btn-info m-2" v-if="dmsCampaign.id == session.campaign" v-on:click="cancelSession(session.id)">Cancel Session</a>
                </div>
            </div>
        </div>
    </div>
</template>
