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
            beforeEnter: (to, from, next) => {
                const store = useStore();
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
