import { createRouter, createWebHistory } from 'vue-router';
import { getAuth } from 'firebase/auth';
import { getCurrentUser } from 'vuefire'; // Keep getCurrentUser for initial auth state check
import { useAuthStore } from '@/stores/authStore'; // Import the auth store

import HomeView from '../views/HomeView.vue';
const GameserversView = () => import('../views/GameserversView.vue');
const QuinnView = () => import('../views/QuinnView.vue');
const SessionsView = () => import('../views/SessionsView.vue');
const SettingsView = () => import('../views/SettingsView.vue');

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView,
            meta: {
                title: 'Home',
                requiresAuth: false,
                requiresLinkedDiscord: false,
            },
        },
        {
            path: '/gameservers',
            name: 'gameservers',
            component: GameserversView,
            meta: {
                title: 'Gameservers',
                requiresAuth: true,
                requiresLinkedDiscord: true,
            },
        },
        {
            path: '/quinn',
            name: 'quinn',
            component: QuinnView,
            meta: {
                title: 'Quinn',
                requiresAuth: true,
                requiresLinkedDiscord: true,
            },
        },
        {
            path: '/sessions',
            name: 'sessions',
            component: SessionsView,
            meta: {
                title: 'Tabletop Sessions',
                requiresAuth: true,
                requiresLinkedDiscord: true,
            },
        },
        {
            path: '/settings',
            name: 'settings',
            component: SettingsView,
            meta: {
                title: 'Settings',
                requiresAuth: true,
                requiresLinkedDiscord: false,
            },
        },
        {
            path: '/:pathMatch(.*)*',
            redirect: '/',
        },
    ],
    linkExactActiveClass: 'active',
});

router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore(); // Get store instance

    try {
        // Use getCurrentUser to ensure initial auth state is loaded before proceeding
        const user = await getCurrentUser();

        if (to.meta.requiresAuth && !user) {
            return next({ path: '/' });
        }

        // Rely on the store's claims once the user is loaded
        if (to.meta.requiresLinkedDiscord && user) {
            // Wait for auth store to be initialized and claims to be potentially loaded
            // This might require a more robust waiting mechanism if claims aren't immediately available
            // For simplicity here, we assume claims are loaded shortly after user
            // A more complex app might watch authStore.authInitialized or claims
            if (!authStore.claims || !authStore.claims.discordID) {
                // If claims aren't loaded yet, try fetching them again or wait
                // For now, redirect if claims or discordID is missing
                console.warn('User requires linked Discord but claims or discordID is missing in store.');
                // Optionally re-fetch claims if needed, but the listener should handle this
                // const tokenResult = await user.getIdTokenResult();
                // if (!tokenResult.claims.discordID) {
                return next({ path: '/' });
                // }
            }
        }

        const nearestWithTitle = to.matched
            .slice()
            .reverse()
            .find((r) => r.meta && r.meta.title);

        if (nearestWithTitle) {
            document.title = nearestWithTitle.meta.title + ' - Dox Box';
        }

        next();
    } catch (error) {
        console.error('Error during navigation guard:', error);
        next(false); // Cancel navigation on error
    }
});

export default router;
