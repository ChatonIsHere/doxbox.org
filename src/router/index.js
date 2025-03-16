import { createRouter, createWebHistory } from 'vue-router';
import { getAuth } from 'firebase/auth';
import { getCurrentUser } from 'vuefire';

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
    try {
        const user = await getCurrentUser();

        if (to.meta.requiresAuth && !user) {
            return next({ path: '/' });
        }

        if (to.meta.requiresLinkedDiscord && user) {
            const tokenResult = await user.getIdTokenResult();
            const claims = tokenResult.claims;

            if (to.meta.requiresLinkedDiscord && !claims.discordID) {
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
    } catch (error) {
        console.error('Error during navigation guard:', error);
        next(false); // Cancel navigation on error
    }
});

export default router;
