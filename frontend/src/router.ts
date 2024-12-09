import { createRouter, createWebHistory } from 'vue-router'
import { useStore } from './store/store';

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

                console.log("store.name", useStore().name);

                if (!useStore().name) {
                    next("/");
                } else {
                    next();
                }
            },
        },
    ],
});

export default router;
