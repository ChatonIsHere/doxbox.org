import { ref, onMounted } from 'vue';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref as dbRef, get } from 'firebase/database';

async function getCurrentUser() {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
        const tokenResult = await user.getIdTokenResult();
        return {
            ...user,
            claims: tokenResult.claims,
        };
    }
    return null;
}

async function needsLinking() {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
        async () => {
            const tokenResult = await user.getIdTokenResult();
            return !tokenResult.claims.discordID;
        };
    }
    return false;
}

export { getCurrentUser, needsLinking };
