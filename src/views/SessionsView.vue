<script setup>
    import { computed, ref } from 'vue';
    import { useDatabase, useCurrentUser, useDatabaseObject } from 'vuefire';
    import { ref as dbRef, update } from 'firebase/database';

    import WeeklyAvailability from '../components/WeeklyAvailability.vue';
    import SessionsCalendar from '../components/SessionsCalendar.vue';

    const db = useDatabase();
    const user = useCurrentUser();

    const userExtended = useDatabaseObject(dbRef(db, `users/${user.value.uid}/`));

    const userHasDiscordLinked = computed(() => {
        try {
            if (userExtended.value.discordID) return true;
        } catch (err) {
            return false;
        }
    });

    const getUserID = computed(() => {
        return user.value.uid;
    });
</script>

<template>
    <div v-if="!userHasDiscordLinked">
        <p>Please link your Discord account using the Quinn command /linkaccount</p>
        <p>
            Your user ID is: <code>{{ getUserID }}</code>
        </p>
    </div>
    <div v-else class="container">
        <div class="row">
            <div class="col">
                <h4 class="fw-bold text-white pb-4">Typical Weekly Availability</h4>
                <WeeklyAvailability />
            </div>
            <div class="col">
                <h4 class="fw-bold text-white pb-4">Session Calendar</h4>
                <SessionsCalendar />
            </div>
        </div>
    </div>
</template>
