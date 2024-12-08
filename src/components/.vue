<script setup>
    import { computed, ref } from 'vue';
    import { useDatabase, useDatabaseObject } from 'vuefire';
    import { ref as dbRef } from 'firebase/database';

    const db = useDatabase();

    const history = useDatabaseObject(dbRef(db, `sessions/history/`));
    const campaigns = useDatabaseObject(dbRef(db, `quinn/campaigns/`));

    const sessionHistory = computed(() => {
        let dateArray = [];

        if (typeof history.value == 'undefined') return [];

        for (let session of Object.values(history.value)) {
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

        return dateArray;
    });

    const disabledDates = ref([
        {
            repeat: {
                weekdays: [7],
            },
        },
    ]);
</script>

<template>
    <VCalendar :attributes="sessionHistory" :disabled-dates="disabledDates" borderless />
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
