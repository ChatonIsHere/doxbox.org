import { createRouter, createWebHistory } from 'vue-router';
import { getCurrentUser } from 'vuefire';

import HomeView from '../views/HomeView.vue';
const GameserversView = () => import('../views/GameserversView.vue');
const QuinnView = () => import('../views/QuinnView.vue');
const SessionsView = () => import('../views/SessionsView.vue');

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView,
            meta: {
                title: 'Home',
            },
        },
        {
            path: '/gameservers',
            name: 'gameservers',
            component: GameserversView,
            meta: {
                title: 'Gameservers',
                requiresAuth: true,
            },
        },
        {
            path: '/quinn',
            name: 'quinn',
            component: QuinnView,
            meta: {
                title: 'Quinn',
                requiresAuth: true,
            },
        },
        {
            path: '/sessions',
            name: 'sessions',
            component: SessionsView,
            meta: {
                title: 'Tabletop Sessions',
                requiresAuth: true,
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

router.beforeEach((to, next) => {
    const nearestWithTitle = to.matched
        .slice()
        .reverse()
        .find((r) => r.meta && r.meta.title);

    if (nearestWithTitle) {
        document.title = nearestWithTitle.meta.title + ' - Dox Box';
    }
});

export default router;
