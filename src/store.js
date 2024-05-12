import { createStore } from 'vuex';
import { auth } from './firebaseConfig';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { sha256 } from 'js-sha256';

const provider = new GoogleAuthProvider();

const store = createStore({
    state: {
        user: {
            loggedIn: false,
            data: null,
        },
    },

    getters: {
        user(state) {
            return state.user;
        },
    },
    mutations: {
        SET_USER(state, payload) {
            state.user.data = payload;
        },
        SET_LOGGED_IN(state, value) {
            state.user.loggedIn = value;
        },
    },
    actions: {
        async logIn(context, { email, password }) {
            const response = await signInWithEmailAndPassword(auth, email, password);
            if (response) {
                context.commit('SET_USER', response.user);
            } else {
                throw new Error('login failed');
            }
        },

        async logInGoogle(context) {
            const response = await signInWithPopup(auth, provider);
            if (response) {
                context.commit('SET_USER', response.user);
            } else {
                throw new Error('login failed');
            }
        },

        async logOut(context) {
            await signOut(auth);
            context.commit('SET_USER', null);
        },

        async fetchUser(context, user) {
            context.commit('SET_LOGGED_IN', user !== null);
            if (user) {
                context.commit('SET_USER', {
                    displayName: user.displayName,
                    email: user.email,
                    avatar: getGravatarURL(user.email),
                });
            } else {
                context.commit('SET_USER', null);
            }
        },
    },
});

function getGravatarURL(email) {
    const address = String(email).trim().toLowerCase();

    const hash = sha256(address);

    return `https://www.gravatar.com/avatar/${hash}`;
}

// export the store
export default store;
