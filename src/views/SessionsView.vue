<script setup>
    import { computed } from 'vue';
    import { useDatabase, useCurrentUser, useDatabaseObject } from 'vuefire';
    import { ref as dbRef } from 'firebase/database';

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
            <div class="col-12 col-lg-3 pb-5">
                <h4 class="fw-bold text-white pb-4">Session Calendar</h4>
                <SessionsCalendar />
                <div v-if="dmsCampaign" class="w-75 mx-auto">
                    <p class="text-white">{{ dmsCampaign.name }} session day</p>
                    <SessionDayDropdown :campaign="dmsCampaign" />
                </div>
            </div>
            <div class="col-12 col-lg-9 pe-lg-5">
                <h4 class="fw-bold text-white pb-2">Upcoming Sessions</h4>
                <UpcomingSessions />
            </div>
        </div>
        <div class="row">
            <CampaignsBar />
        </div>
    </div>
</template>
