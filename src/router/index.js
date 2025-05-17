import { createRouter, createWebHistory } from 'vue-router';
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

    // Wait for the auth store to be initialized
    // This ensures the onAuthStateChanged listener has run at least once
    // and populated the user/claims state.
    if (!authStore.authInitialized) {
        await new Promise((resolve) => {
            const unsubscribe = authStore.$subscribe((mutation, state) => {
                if (state.authInitialized) {
                    unsubscribe();
                    resolve();
                }
            });
            // If the store is already initialized by the time we subscribe, resolve immediately
            if (authStore.authInitialized) {
                unsubscribe();
                resolve();
            }
        });
    }

    const user = authStore.user; // Get user from the store

    if (to.meta.requiresAuth && !user) {
        // If route requires auth and no user is logged in (according to store), redirect to home
        return next({ path: '/' });
    }

    // If user is logged in and route requires linked Discord
    if (to.meta.requiresLinkedDiscord && user) {
        // Check claims from the store
        if (!authStore.claims || !authStore.claims.discordID) {
            console.warn('User requires linked Discord but claims or discordID is missing in store.');
            // Redirect to home if Discord is not linked
            return next({ path: '/' });
        }
    }

    // Update document title
    const nearestWithTitle = to.matched
        .slice()
        .reverse()
        .find((r) => r.meta && r.meta.title);

    if (nearestWithTitle) {
        document.title = nearestWithTitle.meta.title + ' - Dox Box';
    }

    // Continue navigation
    next();
});

export default router;
