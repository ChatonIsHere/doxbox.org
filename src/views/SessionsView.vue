<script setup>
    import { computed } from 'vue';
    import { useDatabase, useDatabaseObject } from 'vuefire'; // Keep useDatabase, useDatabaseObject
    import { ref as dbRef } from 'firebase/database'; // Keep ref as dbRef
    import { useAuthStore } from '@/stores/authStore'; // Import auth store
    import { storeToRefs } from 'pinia'; // Import storeToRefs

    import SessionDayDropdown from '../components/Sessions/SessionDayDropdown.vue';
    import UpcomingSessions from '../components/Sessions/UpcomingSessions.vue';
    import SessionsCalendar from '../components/Sessions/SessionsCalendar.vue';
    import CampaignsBar from '../components/Sessions/CampaignsBar.vue';

    const db = useDatabase();
    // const user = useCurrentUser(); // Removed

    // const userExtended = useDatabaseObject(dbRef(db, `users/${user.value.uid}/`)); // Remove this line

    const campaigns = useDatabaseObject(dbRef(db, `quinn/campaigns/`));

    const authStore = useAuthStore(); // Get store instance
    const { user, userExtended } = storeToRefs(authStore); // Use storeToRefs for user and userExtended

    const dmsCampaign = computed(() => {
        // Use userExtended from the store
        // Ensure userExtended.value exists before accessing dmCampaign
        if (typeof campaigns.value !== 'undefined' && userExtended.value && typeof userExtended.value.dmCampaign !== 'undefined') {
            return campaigns.value[userExtended.value.dmCampaign];
        } else return false;
    });
</script>

<template>
    <div class="container-fluid">
        <div class="row">
            <div class="col-12 col-lg-3 pb-5">
                <h4 class="fw-bold text-white pb-3">Session Calendar</h4>
                <SessionsCalendar />
                <div v-if="dmsCampaign" class="w-75 mx-auto">
                    <p class="text-white">{{ dmsCampaign.name }} session day</p>
                    <SessionDayDropdown :campaign="dmsCampaign" />
                </div>
            </div>
            <div class="col-12 col-lg-9 pe-lg-5">
                <h4 class="fw-bold text-white pb-3">Upcoming Sessions</h4>
                <UpcomingSessions />
            </div>
        </div>
        <div class="row pt-sm-5">
            <CampaignsBar />
        </div>
    </div>
</template>
