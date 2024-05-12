<template>
    <button v-if="user.loggedIn" @click.prevent="signOut" class="btn btn-secondary">Log Out</button>
    <button v-else @click.prevent="LoginGoogle()" class="btn btn-secondary">Sign in with Google</button>
</template>

<script>
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { computed } from 'vue';
import { auth } from '../firebaseConfig';
import { ref } from 'vue';

export default {
    name: 'NavbarAuthComponent',

    setup() {
        const store = useStore();
        const router = useRouter();
        const error = ref(null);

        auth.onAuthStateChanged((user) => {
            store.dispatch('fetchUser', user);
        });

        const user = computed(() => {
            return store.getters.user;
        });

        const signOut = async () => {
            await store.dispatch('logOut');
            router.push('/');
        };

        const LoginGoogle = async () => {
            try {
                await store.dispatch('logInGoogle');
                router.push('/');
            } catch (err) {
                error.value = err.message;
            }
        };

        return { user, signOut, LoginGoogle, error };
    },
};
</script>
