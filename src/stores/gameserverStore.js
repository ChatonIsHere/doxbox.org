import { defineStore } from 'pinia';
import { ref, onUnmounted } from 'vue';
import { getDatabase, ref as dbRef, onValue } from 'firebase/database';

export const useGameserverStore = defineStore(
    'gameservers',
    () => {
        const db = getDatabase();

        const gameservers = ref([]);

        const gameserversRef = dbRef(db, 'gameservers');
        const unsubscribeGameservers = onValue(gameserversRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                gameservers.value = Object.entries(data).map(([id, value]) => ({ id, ...value }));
            } else {
                gameservers.value = [];
            }
        });

        onUnmounted(() => {
            unsubscribeGameservers();
        });

        return {
            gameservers,
        };
    },
    {
        persist: {
            storage: localStorage,
            paths: ['gameservers'],
        },
    }
);
