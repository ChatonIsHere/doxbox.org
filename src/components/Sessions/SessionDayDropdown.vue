<script setup>
    import { computed } from 'vue';
    import { useSessionsStore } from '@/stores/sessionsStore';

    const { campaign } = defineProps(['campaign']);

    const sessionsStore = useSessionsStore();
    const { updateSessionDay, resetSessionDay } = sessionsStore;

    const sessionDayModel = computed({
        get() {
            return campaign.sessionDay;
        },
        set(value) {
            updateSessionDay(campaign.id, value);
        },
    });

    const week = ['Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays', 'Sundays'];
</script>

<template>
    <div class="input-group">
        <select class="custom-select form-control form-control-sm" id="daySelector" v-model="sessionDayModel">
            <option v-for="day in Object.entries(week)" :value="day[0]">{{ day[1] }}</option>
        </select>
        <div class="input-group-append">
            <button class="input-group-text bg-danger" id="btnGroupAddon" for="daySelector" v-on:click="resetSessionDay(campaign.id)">X</button>
        </div>
    </div>
</template>

<style>
    #btnGroupAddon {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
    }
</style>
