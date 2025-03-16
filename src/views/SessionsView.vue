<script setup>
    import { computed, ref } from 'vue';
    import { useDatabase, useCurrentUser, useDatabaseObject } from 'vuefire';
    import { ref as dbRef, update } from 'firebase/database';

    import WeeklyAvailability from '../components/WeeklyAvailability.vue';
    import SessionDayDropdown from '../components/SessionDayDropdown.vue';
    import UpcomingSessions from '../components/UpcomingSessions.vue';
    import SessionsCalendar from '../components/SessionsCalendar.vue';
    import CampaignsBar from '../components/CampaignsBar.vue';

    const db = useDatabase();
    const user = useCurrentUser();

    const userExtended = useDatabaseObject(dbRef(db, `users/${user.value.uid}/`));
    const campaigns = useDatabaseObject(dbRef(db, `quinn/campaigns/`));

    const dmsCampaign = computed(() => {
        if (typeof campaigns.value !== 'undefined' && typeof userExtended.value !== 'undefined') return campaigns.value[userExtended.value.dmCampaign];
        else return false;
    });
</script>

<template>
    <div class="container-fluid">
        <div class="row">
            <div class="col-12 col-lg-4 pb-5">
                <h4 class="fw-bold text-white pb-4">Session Calendar</h4>
                <SessionsCalendar />
            </div>
            <div class="col-12 col-lg-4 pb-5">
                <h4 class="fw-bold text-white pb-2">Upcoming Sessions</h4>
                <UpcomingSessions />
            </div>
            <div class="col-12 col-lg-4 pb-5">
                <div>
                    <h4 class="fw-bold text-white pb-2">Typical Weekly Availability</h4>
                    <WeeklyAvailability />
                </div>
                <div v-if="dmsCampaign" class="w-50 mx-auto pt-4">
                    <p class="text-white">Automatically schedule sessions for {{ dmsCampaign.name }} on</p>
                    <SessionDayDropdown :campaign="dmsCampaign" />
                </div>
            </div>
        </div>
        <div class="row pt-5">
            <CampaignsBar />
        </div>
    </div>
</template>
