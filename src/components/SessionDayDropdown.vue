<script setup>
    import { computed } from 'vue';
    import { useDatabase, useDatabaseObject } from 'vuefire';
    import { ref as dbRef, update } from 'firebase/database';

    const db = useDatabase();

    const { campaign } = defineProps(['campaign']);

    const sessionDayModel = computed({
        get() {
            return campaign.sessionDay;
        },
        set(value) {
            update(dbRef(db, `quinn/campaigns/${campaign.id}/`), { sessionDay: value });
        },
    });

    const week = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
</script>

<template>
    <select class="form-control form-control-sm" v-model="sessionDayModel">
        <option v-for="day in Object.entries(week)" :value="day[0]">{{ day[1] }}</option>
    </select>
</template>
