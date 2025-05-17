import { defineStore } from 'pinia';
import { ref, onUnmounted } from 'vue';
import { getDatabase, ref as dbRef, onValue } from 'firebase/database';

export const useQuinnStore = defineStore(
    'quinn',
    () => {
        const db = getDatabase();

        const usernames = ref(null);
        const players = ref([]);

        const usernamesRef = dbRef(db, 'quinn/userData/username');
        const unsubscribeUsernames = onValue(usernamesRef, (snapshot) => {
            usernames.value = snapshot.val();
        });

        const playersRef = dbRef(db, 'quinn/userData/d20');
        const unsubscribePlayers = onValue(playersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                players.value = Object.entries(data).map(([id, value]) => ({ id, ...value }));
            } else {
                players.value = [];
            }
        });

        onUnmounted(() => {
            unsubscribeUsernames();
            unsubscribePlayers();
        });

        return {
            usernames,
            players,
        };
    },
    {
        persist: {
            storage: localStorage,
            paths: ['usernames', 'players'],
        },
    }
);
