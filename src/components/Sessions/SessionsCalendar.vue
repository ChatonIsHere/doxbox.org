<script setup>
    import { computed, ref, watch } from 'vue';
    import { useAuthStore } from '@/stores/authStore';
    import { useSessionsStore } from '@/stores/sessionsStore';
    import { storeToRefs } from 'pinia';

    const sessionsStore = useSessionsStore();
    const { campaigns, allSessions, dmsCampaign } = storeToRefs(sessionsStore);
    const { scheduleNewSession: storeScheduleNewSession } = sessionsStore;

    const authStore = useAuthStore();
    const { userExtended } = storeToRefs(authStore);

    const calendar = ref(null);

    const datePicker = ref(null);
    const selectedDate = ref('Please select a date');

    const schedulingNewSession = ref(false);

    const latestErrorMessage = ref('');

    const viewThisMonth = (target) => {
        if (target == 'calendar') calendar.value.move(new Date());
        if (target == 'datePicker') datePicker.value.move(new Date());
    };

    const calendarSessions = computed(() => {
        let dateArray = [
            {
                key: 'today',
                dates: [new Date()],
                color: 'indigo',
                dot: true,
            },
        ];

        try {
            let sessions = Object.values(allSessions.value || {});

            for (let session of sessions) {
                let backgroundColor = 'blue';
                let fillMode = 'solid';
                let label = 'Unknown campaign';

                try {
                    if (campaigns.value && campaigns.value[session.campaign] && typeof campaigns.value[session.campaign].calendar !== 'undefined') {
                        backgroundColor = campaigns.value[session.campaign].calendar.color;
                        fillMode = campaigns.value[session.campaign].calendar.style;
                        label = campaigns.value[session.campaign].name;
                    }
                } catch (err) {
                    console.error(err);
                }

                dateArray.push({
                    dates: [new Date(session.date)],
                    highlight: { style: `background-color: ${backgroundColor};`, fillMode: fillMode },
                    popover: {
                        label: label,
                    },
                });
            }
        } catch (err) {
            if (err.name !== 'TypeError') console.error(err);
        }

        return dateArray;
    });

    const disabledDates = computed(() => {
        let weekdays = [];

        try {
            if (userExtended.value && userExtended.value.availability) {
                let availability = Object.values(userExtended.value.availability);

                for (let i = 0; i < 7; i++) {
                    if (!availability[i]) {
                        if (i == 6) weekdays.push(1);
                        else weekdays.push(i + 2);
                    }
                }
            }
        } catch (err) {
            console.error(err);
        }

        return [
            {
                repeat: {
                    weekdays: weekdays,
                },
            },
        ];
    });

    const toggleSessionScheduleDialog = () => {
        if (schedulingNewSession.value) selectedDate.value = 'Please select a date';
        schedulingNewSession.value = !schedulingNewSession.value;
    };

    const scheduleNewSession = () => {
        const success = storeScheduleNewSession(dmsCampaign.value.id, selectedDate.value, userExtended.value?.discordID);

        if (!success) {
            latestErrorMessage.value = `Failed to schedule session. There might be an existing session on ${sessionsStore.formatDate(selectedDate.value)} or user data is missing.`;
            setTimeout(() => {
                latestErrorMessage.value = '';
            }, 15000);
        } else {
            latestErrorMessage.value = '';
        }

        toggleSessionScheduleDialog();
    };

    const newSessionDateString = computed(() => {
        let dateString = new Intl.DateTimeFormat('en-GB', {
            dateStyle: 'full',
            timeZone: 'Europe/London',
        }).format(selectedDate.value);

        return dateString;
    });

    watch(selectedDate, (newValue) => {
        const targetDate = new Date(newValue);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (targetDate.getTime() === 0 || targetDate < today) {
            selectedDate.value = 'Please select a date';
        }
    });
</script>

<template>
    <VDatePicker v-if="schedulingNewSession" ref="datePicker" class="w-75" v-model="selectedDate" :attributes="calendarSessions" :min-date="new Date(Date.now() + 864e5)" :max-date="new Date(Date.now() + 12096e5 + 12096e5)" borderless show-weeknumbers="left">
        <template #footer>
            <div class="btn-group d-flex w-100 px-3 pb-3">
                <button class="btn btn-sm btn-dark w-50" v-on:click="viewThisMonth('datePicker')">This Month</button>
                <button class="btn btn-sm btn-danger w-50" v-if="selectedDate == 'Please select a date'" v-on:click="toggleSessionScheduleDialog">Cancel</button>
                <button class="btn btn-sm btn-success w-50" v-else v-on:click="scheduleNewSession()">Confirm</button>
            </div>
            <div class="mx-2">
                <p v-if="selectedDate == 'Please select a date'">Please select a date</p>
                <div v-else>
                    <p class="pb-0 mb-0">New {{ dmsCampaign ? dmsCampaign.name : 'Unknown Campaign' }} session on</p>
                    <p class="pt-0 mt-0">{{ newSessionDateString }}</p>
                </div>
            </div>
        </template>
    </VDatePicker>
    <VCalendar v-else ref="calendar" class="w-75" :attributes="calendarSessions" :disabled-dates="disabledDates" :min-date="new Date('2024-11-01')" :max-date="new Date(Date.now() + 12096e5)" borderless show-weeknumbers="left">
        <template #footer>
            <div class="btn-group d-flex w-100 px-3 pb-3">
                <button class="btn btn-sm btn-dark w-50" v-on:click="viewThisMonth('calendar')">This Month</button>
                <button class="btn btn-sm btn-success w-50" v-if="dmsCampaign" v-on:click="toggleSessionScheduleDialog">New Session</button>
            </div>
        </template>
    </VCalendar>
    <p class="text-danger pt-2">{{ latestErrorMessage }}</p>
</template>

<style>
    .vc-prev,
    .vc-next,
    .vc-title {
        background-color: #00000000 !important;
        color: white !important;
    }

    .vc-container {
        background-color: #343a4022;
        border-radius: 5px;
        color: white !important;
    }
</style>
