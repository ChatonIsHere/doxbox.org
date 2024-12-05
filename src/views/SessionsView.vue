<script setup>
    import { computed, ref } from 'vue';
    import { useDatabase, useCurrentUser, useDatabaseObject } from 'vuefire';
    import { ref as dbRef, update } from 'firebase/database';

    import WeeklyAvailability from '../components/WeeklyAvailability.vue';

    const db = useDatabase();
    const user = useCurrentUser();

    const history = useDatabaseObject(dbRef(db, `sessions/history`));

    const sessionHistory = computed(() => {
        let dateArray = [];

        if (typeof history.value == 'undefined') return [];

        for (let session of Object.values(history.value)) {
            dateArray.push(new Date(session.date));
        }

        return dateArray;
    });

    const attributes = ref([
        {
            highlight: true,
            dates: sessionHistory,
        },
    ]);
</script>

<template>
    <div class="container">
        <div class="row">
            <div class="col">
                <h1 class="display-6 fw-bold text-white pb-4">Typical Weekly Availability</h1>
                <WeeklyAvailability />
            </div>
            <div class="col">
                <VCalendar :attributes="attributes" />
            </div>
        </div>
    </div>
</template>
