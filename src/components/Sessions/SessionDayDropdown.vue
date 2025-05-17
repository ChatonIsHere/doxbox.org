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

    const resetSessionDay = () => {
        update(dbRef(db, `quinn/campaigns/${campaign.id}/`), { sessionDay: null });
    };

    const week = ['Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays', 'Sundays'];
</script>

<template>
    <div class="input-group">
        <select class="custom-select form-control form-control-sm" id="daySelector" v-model="sessionDayModel">
            <option v-for="day in Object.entries(week)" :value="day[0]">{{ day[1] }}</option>
        </select>
        <div class="input-group-append">
            <button class="input-group-text bg-danger" id="btnGroupAddon" for="daySelector" v-on:click="resetSessionDay">X</button>
        </div>
    </div>
</template>

<style>
    #btnGroupAddon {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
    }
</style>
