import { defineStore } from 'pinia';
import { ref, onUnmounted } from 'vue';
import { getDatabase, ref as dbRef, query, orderByChild, onValue } from 'firebase/database';

export const useNavigationStore = defineStore(
    'navigation',
    () => {
        const db = getDatabase();

        const internalNav = ref([]);
        const externalNav = ref([]);

        const navInternalRef = query(dbRef(db, 'navigation/internal'), orderByChild('order'));
        const unsubscribeNavInternal = onValue(navInternalRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                internalNav.value = Object.entries(data).map(([id, value]) => ({ id, ...value }));
            } else {
                internalNav.value = [];
            }
        });

        const navExternalRef = query(dbRef(db, 'navigation/external'), orderByChild('order'));
        const unsubscribeNavExternal = onValue(navExternalRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                externalNav.value = Object.entries(data).map(([id, value]) => ({ id, ...value }));
            } else {
                externalNav.value = [];
            }
        });

        onUnmounted(() => {
            unsubscribeNavInternal();
            unsubscribeNavExternal();
        });

        return {
            internalNav,
            externalNav,
        };
    },
    {
        persist: {
            storage: localStorage,
            paths: ['internalNav', 'externalNav'],
        },
    }
);
