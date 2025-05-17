<script setup>
    import { useAuthStore } from '@/stores/authStore';
    import { useSessionsStore } from '@/stores/sessionsStore';
    import { storeToRefs } from 'pinia';

    import SessionDayDropdown from '@/components/Sessions/SessionDayDropdown.vue';
    import UpcomingSessions from '@/components/Sessions/UpcomingSessions.vue';
    import SessionsCalendar from '@/components/Sessions/SessionsCalendar.vue';
    import CampaignsBar from '@/components/Sessions/CampaignsBar.vue';

    const sessionsStore = useSessionsStore();
    const { dmsCampaign } = storeToRefs(sessionsStore);
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

<style>
    hr.thin {
        margin-top: 0.5em;
        margin-bottom: 0.5em;
        border-color: rgba(255, 255, 255, 0.1);
    }

    .card {
        border-color: rgba(255, 255, 255, 0.1);
    }

    .form-control.bg-secondary {
        background-color: #6c757d !important;
    }

    .form-control.bg-secondary::placeholder {
        color: rgba(255, 255, 255, 0.7);
    }

    .form-control.bg-secondary:focus {
        background-color: #6c757d !important;
        color: white !important;
        border-color: #86b7fe;
        box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
    }

    --bs-table-bg {
        background-color: transparent !important;
    }
</style>
