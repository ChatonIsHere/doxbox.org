<script setup>
    import { computed, ref } from 'vue';
    import { useDatabase, useDatabaseObject, useCurrentUser } from 'vuefire';
    import { ref as dbRef } from 'firebase/database';

    const db = useDatabase();
    const user = useCurrentUser();

    const campaigns = useDatabaseObject(dbRef(db, `quinn/campaigns/`));
    const history = useDatabaseObject(dbRef(db, `sessions/history/`));
    const upcoming = useDatabaseObject(dbRef(db, `sessions/upcoming/`));

    const userExtended = useDatabaseObject(dbRef(db, `users/${user.value.uid}/`));

    const calendar = ref(null);

    const viewThisMonth = () => {
        calendar.value.move(new Date());
    };

    const sessionHistory = computed(() => {
        let dateArray = [
            {
                key: 'today',
                dates: [new Date()],
                highlight: {
                    color: 'indigo',
                    fillMode: 'outline',
                    style: 'background-color: #00000000;',
                },
            },
        ];

        try {
            let sessions = Object.values(history.value).concat(Object.values(upcoming.value));

            for (let session of sessions) {
                let backgroundColor = 'blue';
                let fillMode = 'solid';
                let label = 'Unknown campaign';

                try {
                    if (typeof campaigns.value[session.campaign].calendar !== 'undefined') {
                        backgroundColor = campaigns.value[session.campaign].calendar.color;
                        fillMode = campaigns.value[session.campaign].calendar.style;
                        label = campaigns.value[session.campaign].name;
                    }
                } catch (err) {}

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
            let availability = Object.values(userExtended.value.availability);

            for (let i = 0; i < 7; i++) {
                if (!availability[i]) {
                    if (i == 6) weekdays.push(1);
                    else weekdays.push(i + 2);
                }
            }
        } catch (err) {}

        return [
            {
                repeat: {
                    weekdays: weekdays,
                },
            },
        ];
    });
</script>

<template>
    <VCalendar ref="calendar" :attributes="sessionHistory" :disabled-dates="disabledDates" :min-date="new Date('2024-11-01')" :max-date="new Date(Date.now() + 12096e5)" borderless>
        <template #footer>
            <div class="w-full px-3 pb-3">
                <button class="btn btn-sm btn-dark" v-on:click="viewThisMonth">This Month</button>
            </div>
        </template>
    </VCalendar>
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
