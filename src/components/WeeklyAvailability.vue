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
            return availabilityMonday.value['$value'];
        },
        set(value) {
            update(dbRef(db, `users/${user.value.uid}/availability`), { 0: value });
        },
    });

    const availableTuesday = computed({
        get() {
            return availabilityTuesday.value['$value'];
        },
        set(value) {
            update(dbRef(db, `users/${user.value.uid}/availability`), { 1: value });
        },
    });

    const availableWednesday = computed({
        get() {
            return availabilityWednesday.value['$value'];
        },
        set(value) {
            update(dbRef(db, `users/${user.value.uid}/availability`), { 2: value });
        },
    });

    const availableThursday = computed({
        get() {
            return availabilityThursday.value['$value'];
        },
        set(value) {
            update(dbRef(db, `users/${user.value.uid}/availability`), { 3: value });
        },
    });

    const availableFriday = computed({
        get() {
            return availabilityFriday.value['$value'];
        },
        set(value) {
            update(dbRef(db, `users/${user.value.uid}/availability`), { 4: value });
        },
    });

    const availableSaturday = computed({
        get() {
            return availabilitySaturday.value['$value'];
        },
        set(value) {
            update(dbRef(db, `users/${user.value.uid}/availability`), { 5: value });
        },
    });

    const availableSunday = computed({
        get() {
            return availabilitySunday.value['$value'];
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
