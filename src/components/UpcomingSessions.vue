<script setup>
    import { computed, ref } from 'vue';
    import { useDatabase, useDatabaseObject, useCurrentUser } from 'vuefire';
    import { ref as dbRef } from 'firebase/database';

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
            return Object.values(sessions).sort((a, b) => new Date(a.date) - new Date(b.date));
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
</script>

<template>
    <div class="accordion accordion-flush" id="sessionsAccordion">
        <div class="accordion-item" v-for="session in sortSessions(upcomingSessions)">
            <h2 class="accordion-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" :data-bs-target="`#accordion-${session.date}-${session.campaign}`" aria-expanded="false" :aria-controls="`accordion-${session.date}-${session.campaign}`">{{ sessionDateString(session) }}</button>
            </h2>
            <div :id="`accordion-${session.date}-${session.campaign}`" class="accordion-collapse collapse" data-bs-parent="#sessionsAccordion">
                <div class="accordion-body">
                    <a class="btn btn-primary btn-info m-2" :href="campaignFromID(session.campaign).details.url">Campaign</a>
                    <a class="btn btn-primary btn-success m-2" :href="campaignFromID(session.campaign).details.map">Battlemap</a>
                    <p v-if="campaignFromID(session.campaign).details.date !== '0001-01-01'">In-universe date: {{ campaignFromID(session.campaign).details.date }}</p>
                </div>
            </div>
        </div>
    </div>
</template>
