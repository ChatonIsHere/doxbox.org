import { ref, onMounted } from 'vue';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref as dbRef, get } from 'firebase/database';

export function useCurrentExtendedUser() {
    const user = ref(null);
    const claims = ref(null);
    const userExtended = ref(null);

    onMounted(() => {
        const auth = getAuth();
        onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                user.value = currentUser;
                const tokenResult = await currentUser.getIdTokenResult();
                claims.value = tokenResult.claims;

                const db = getDatabase();
                const userRef = dbRef(db, `users/${currentUser.uid}`);
                const userSnapshot = await get(userRef);

                if (userSnapshot.exists()) {
                    userExtended.value = userSnapshot.val();
                } else {
                    console.log('No such document!');
                }
            } else {
                user.value = null;
                claims.value = null;
                userExtended.value = null;
            }
        });
    });

    return { user, claims, userExtended };
}
