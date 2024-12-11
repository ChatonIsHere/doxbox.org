<script setup>
    import { computed, ref } from 'vue';
    import { useDatabase, useCurrentUser, useDatabaseObject } from 'vuefire';
    import { ref as dbRef, update } from 'firebase/database';

    import WeeklyAvailability from '../components/WeeklyAvailability.vue';
    import SessionDayDropdown from '../components/SessionDayDropdown.vue';
    import UpcomingSessions from '../components/UpcomingSessions.vue';
    import SessionsCalendar from '../components/SessionsCalendar.vue';

    const db = useDatabase();
    const user = useCurrentUser();

    const userExtended = useDatabaseObject(dbRef(db, `users/${user.value.uid}/`));
    const campaigns = useDatabaseObject(dbRef(db, `quinn/campaigns/`));

    const userHasDiscordLinked = computed(() => {
        try {
            if (userExtended.value.discordID) return true;
        } catch (err) {
            return false;
        }
    });

    const getUserID = computed(() => {
        return user.value.uid;
    });

    const dmsCampaign = computed(() => (Object.values(campaigns.value).filter((campaign) => campaign.dm == userExtended.value.discordID).length > 0 ? Object.values(campaigns.value).find((campaign) => campaign.dm == userExtended.value.discordID) : false));

    const dmsCampaignAvailable = computed(() => {
        try {
            return typeof dmsCampaign.value.name === 'string';
        } catch (err) {
            return false;
        }
    });
</script>

<template>
    <div v-if="!userHasDiscordLinked">
        <p>Please link your Discord account using the Quinn command /linkaccount</p>
        <p>
            Your user ID is: <code>{{ getUserID }}</code>
        </p>
    </div>
    <div v-else class="container-fluid">
        <div class="row">
            <div class="col">
                <div>
                    <h4 class="fw-bold text-white pb-2">Typical Weekly Availability</h4>
                    <WeeklyAvailability />
                </div>
                <div v-if="dmsCampaignAvailable" class="w-50 mx-auto pt-4">
                    <h4 class="fw-bold text-white pb-2">{{ dmsCampaign.name }} Main Session</h4>
                    <SessionDayDropdown :campaign="dmsCampaign" />
                </div>
            </div>
            <div class="col col-4 mx-5">
                <h4 class="fw-bold text-white pb-2">Upcoming Sessions</h4>
                <UpcomingSessions />
            </div>
            <div class="col">
                <h4 class="fw-bold text-white pb-4">Session Calendar</h4>
                <SessionsCalendar />
            </div>
        </div>
    </div>
</template>
