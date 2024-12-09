import { createRouter, createWebHistory } from 'vue-router'
import { useStore } from '@/store/store';

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

router.beforeEach((to, from, next) => {
    if (to.path === "/" && useStore().name) {
        next("/map");
    } else if (to.path === "/map" && !useStore().name) {
        next("/");
    } else {
        next();
    }
});

export default router;
