<template>
    <div>
        <main class="px-3">
            <div class="px-4 py-5 text-center">
                <div class="py-5">
                    <h1 class="display-5 fw-bold text-white" v-if="user.loggedIn">Welcome, {{ user.data.displayName }}</h1>
                    <h1 class="display-5 fw-bold text-white" v-else>Welcome to Dox Box</h1>

                    <img id="userAvatar" v-if="user.loggedIn" :src="user.data.avatar" class="rounded-circle pb-4 pt-2" />

                    <div class="col-lg-6 mx-auto">
                        <p class="fs-5 mb-4">A small clan dedicated to shenanigans</p>
                        <div class="d-grid gap-2 d-sm-flex justify-content-sm-center">
                            <button v-if="!user.loggedIn" type="button" class="btn btn-outline-light btn-lg px-4">Join the Discord</button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<script>
import { useStore } from 'vuex';
import { computed } from 'vue';
import { auth } from '../firebaseConfig';

export default {
    name: 'DashboardComponent',

    setup() {
        const store = useStore();

        auth.onAuthStateChanged((user) => {
            store.dispatch('fetchUser', user);
        });

        const user = computed(() => {
            return store.getters.user;
        });

        return { user };
    },
};
</script>
