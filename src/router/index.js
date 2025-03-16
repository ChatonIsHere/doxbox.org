import { createRouter, createWebHistory } from 'vue-router';
import { getAuth } from 'firebase/auth';
import { getCurrentUser } from '@/utilities/userHelpers';

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

router.beforeEach(async (to) => {
    if (to.meta.requiresAuth) {
        const user = await getCurrentUser();
        if (!user) {
            return {
                path: '/',
            };
        }
    }
});

router.beforeEach(async (to) => {
    if (to.meta.requiresLinkedDiscord) {
        const user = await getCurrentUser();
        if (!user.claims.discordID) {
            return {
                path: '/',
            };
        }
    }
});

router.beforeEach((to, from, next) => {
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
