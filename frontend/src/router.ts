import { createRouter, createWebHistory } from 'vue-router'
import { store } from './main';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: () => import('@/views/home/Index.vue'),
        },

        {
            path: "/map",
            component: () => import("@/views/map/Index.vue"),
            beforeEnter: (to, from, next) => {
                console.log("store.name", store.name);

                if (!store.name) {
                    next("/");
                } else {
                    next();
                }
            },
        },
    ],
});

export default router;
