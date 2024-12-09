import { createRouter, createWebHistory } from 'vue-router'

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
        },
    ],
});

export default router;
