<script setup>
    import { computed } from 'vue';
    import { useDatabase, useCurrentUser, useDatabaseObject } from 'vuefire';
    import { ref as dbRef, update } from 'firebase/database';

    const db = useDatabase();
    const user = useCurrentUser();

    const availability = useDatabaseObject(dbRef(db, `users/${user.value.uid}/availability`));

    const availableMonday = computed({
        get() {
            return typeof availability.value != 'undefined' ? availability.value.monday : false;
        },
        set(value) {
            update(dbRef(db, `users/${user.value.uid}/availability`), { monday: value });
        },
    });

    const availableTuesday = computed({
        get() {
            return typeof availability.value != 'undefined' ? availability.value.tuesday : false;
        },
        set(value) {
            update(dbRef(db, `users/${user.value.uid}/availability`), { tuesday: value });
        },
    });

    const availableWednesday = computed({
        get() {
            return typeof availability.value != 'undefined' ? availability.value.wednesday : false;
        },
        set(value) {
            update(dbRef(db, `users/${user.value.uid}/availability`), { wednesday: value });
        },
    });

    const availableThursday = computed({
        get() {
            return typeof availability.value != 'undefined' ? availability.value.thursday : false;
        },
        set(value) {
            update(dbRef(db, `users/${user.value.uid}/availability`), { thursday: value });
        },
    });

    const availableFriday = computed({
        get() {
            return typeof availability.value != 'undefined' ? availability.value.friday : false;
        },
        set(value) {
            update(dbRef(db, `users/${user.value.uid}/availability`), { friday: value });
        },
    });

    const availableSaturday = computed({
        get() {
            return typeof availability.value != 'undefined' ? availability.value.saturday : false;
        },
        set(value) {
            update(dbRef(db, `users/${user.value.uid}/availability`), { saturday: value });
        },
    });

    const availableSunday = computed({
        get() {
            return typeof availability.value != 'undefined' ? availability.value.sunday : false;
        },
        set(value) {
            update(dbRef(db, `users/${user.value.uid}/availability`), { sunday: value });
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
