import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

import HomeView from '@/views/HomeView.vue';
const GameserversView = () => import('@/views/GameserversView.vue');
const QuinnView = () => import('@/views/QuinnView.vue');
const SessionsView = () => import('@/views/SessionsView.vue');
const SettingsView = () => import('@/views/SettingsView.vue');

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
    const authStore = useAuthStore();
    if (!authStore.authInitialized) {
        await new Promise((resolve) => {
            const unsubscribe = authStore.$subscribe((mutation, state) => {
                if (state.authInitialized) {
                    unsubscribe();
                    resolve();
                }
            });
            if (authStore.authInitialized) {
                unsubscribe();
                resolve();
            }
        });
    }

    const user = authStore.user;

    if (to.meta.requiresAuth && !user) {
        return next({ path: '/' });
    }

    if (to.meta.requiresLinkedDiscord && user) {
        if (!authStore.claims || !authStore.claims.discordID) {
            console.warn('User requires linked Discord but claims or discordID is missing in store.');
            return next({ path: '/' });
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
});

export default router;
