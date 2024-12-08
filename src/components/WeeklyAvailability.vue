<script setup>
    import { computed } from 'vue';
    import { useDatabase, useCurrentUser, useDatabaseObject } from 'vuefire';
    import { ref as dbRef, update } from 'firebase/database';

    const db = useDatabase();
    const user = useCurrentUser();

    const availability = useDatabaseObject(dbRef(db, `users/${user.value.uid}/availability`));

    const availableMonday = computed({
        get() {
            let available = false;

            try {
                available = availability.value[0];
            } catch (err) {}

            return available;
        },
        set(value) {
            update(dbRef(db, `users/${user.value.uid}/availability`), { 0: value });
        },
    });

    const availableTuesday = computed({
        get() {
            let available = false;

            try {
                available = availability.value[1];
            } catch (err) {}

            return available;
        },
        set(value) {
            update(dbRef(db, `users/${user.value.uid}/availability`), { 1: value });
        },
    });

    const availableWednesday = computed({
        get() {
            let available = false;

            try {
                available = availability.value[2];
            } catch (err) {}

            return available;
        },
        set(value) {
            update(dbRef(db, `users/${user.value.uid}/availability`), { 2: value });
        },
    });

    const availableThursday = computed({
        get() {
            let available = false;

            try {
                available = availability.value[3];
            } catch (err) {}

            return available;
        },
        set(value) {
            update(dbRef(db, `users/${user.value.uid}/availability`), { 3: value });
        },
    });

    const availableFriday = computed({
        get() {
            let available = false;

            try {
                available = availability.value[4];
            } catch (err) {}

            return available;
        },
        set(value) {
            update(dbRef(db, `users/${user.value.uid}/availability`), { 4: value });
        },
    });

    const availableSaturday = computed({
        get() {
            let available = false;

            try {
                available = availability.value[5];
            } catch (err) {}

            return available;
        },
        set(value) {
            update(dbRef(db, `users/${user.value.uid}/availability`), { 5: value });
        },
    });

    const availableSunday = computed({
        get() {
            let available = false;

            try {
                available = availability.value[6];
            } catch (err) {}

            return available;
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
