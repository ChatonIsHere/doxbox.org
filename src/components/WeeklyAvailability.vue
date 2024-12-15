<script setup>
    import { computed } from 'vue';
    import { useDatabase, useCurrentUser, useDatabaseObject } from 'vuefire';
    import { ref as dbRef, update } from 'firebase/database';

    const db = useDatabase();
    const user = useCurrentUser();

    const availabilityMonday = useDatabaseObject(dbRef(db, `users/${user.value.uid}/availability/0`));
    const availabilityTuesday = useDatabaseObject(dbRef(db, `users/${user.value.uid}/availability/1`));
    const availabilityWednesday = useDatabaseObject(dbRef(db, `users/${user.value.uid}/availability/2`));
    const availabilityThursday = useDatabaseObject(dbRef(db, `users/${user.value.uid}/availability/3`));
    const availabilityFriday = useDatabaseObject(dbRef(db, `users/${user.value.uid}/availability/4`));
    const availabilitySaturday = useDatabaseObject(dbRef(db, `users/${user.value.uid}/availability/5`));
    const availabilitySunday = useDatabaseObject(dbRef(db, `users/${user.value.uid}/availability/6`));

    const availableMonday = computed({
        get() {
            try {
                return availabilityMonday.value['$value'];
            } catch (err) {
                return false;
            }
        },
        set(value) {
            update(dbRef(db, `users/${user.value.uid}/availability`), { 0: value });
        },
    });

    const availableTuesday = computed({
        get() {
            try {
                return availabilityTuesday.value['$value'];
            } catch (err) {
                return false;
            }
        },
        set(value) {
            update(dbRef(db, `users/${user.value.uid}/availability`), { 1: value });
        },
    });

    const availableWednesday = computed({
        get() {
            try {
                return availabilityWednesday.value['$value'];
            } catch (err) {
                return false;
            }
        },
        set(value) {
            update(dbRef(db, `users/${user.value.uid}/availability`), { 2: value });
        },
    });

    const availableThursday = computed({
        get() {
            try {
                return availabilityThursday.value['$value'];
            } catch (err) {
                return false;
            }
        },
        set(value) {
            update(dbRef(db, `users/${user.value.uid}/availability`), { 3: value });
        },
    });

    const availableFriday = computed({
        get() {
            try {
                return availabilityFriday.value['$value'];
            } catch (err) {
                return false;
            }
        },
        set(value) {
            update(dbRef(db, `users/${user.value.uid}/availability`), { 4: value });
        },
    });

    const availableSaturday = computed({
        get() {
            try {
                return availabilitySaturday.value['$value'];
            } catch (err) {
                return false;
            }
        },
        set(value) {
            update(dbRef(db, `users/${user.value.uid}/availability`), { 5: value });
        },
    });

    const availableSunday = computed({
        get() {
            try {
                return availabilitySunday.value['$value'];
            } catch (err) {
                return false;
            }
        },
        set(value) {
            update(dbRef(db, `users/${user.value.uid}/availability`), { 6: value });
        },
    });
</script>

<template>
    <table class="mx-auto hide-formatting pb-2">
        <tbody>
            <tr>
                <td class="has-text-right p-1">
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" v-model="availableMonday" />
                        <span class="check"></span>
                    </div>
                </td>
                <td class="has-text-left p-1">Monday</td>
            </tr>
            <tr>
                <td class="has-text-right p-1">
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" v-model="availableTuesday" />
                        <span class="check"></span>
                    </div>
                </td>
                <td class="has-text-left p-1">Tuesday</td>
            </tr>
            <tr>
                <td class="has-text-right p-1">
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" v-model="availableWednesday" />
                        <span class="check"></span>
                    </div>
                </td>
                <td class="has-text-left p-1">Wednesday</td>
            </tr>
            <tr>
                <td class="has-text-right p-1">
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" v-model="availableThursday" />
                        <span class="check"></span>
                    </div>
                </td>
                <td class="has-text-left p-1">Thursday</td>
            </tr>
            <tr>
                <td class="has-text-right p-1">
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" v-model="availableFriday" />
                        <span class="check"></span>
                    </div>
                </td>
                <td class="has-text-left p-1">Friday</td>
            </tr>
            <tr>
                <td class="has-text-right p-1">
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" v-model="availableSaturday" />
                        <span class="check"></span>
                    </div>
                </td>
                <td class="has-text-left p-1">Saturday</td>
            </tr>
            <tr>
                <td class="has-text-right p-1">
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" v-model="availableSunday" />
                        <span class="check"></span>
                    </div>
                </td>
                <td class="has-text-left p-1">Sunday</td>
            </tr>
        </tbody>
    </table>
</template>
