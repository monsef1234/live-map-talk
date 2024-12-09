import { createRouter, createWebHistory, RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import { useStore } from '@/store/store';


const routes = [
    {
        path: '/',
        component: () => import('@/views/home/Index.vue'),
    },

    {
        path: "/map",
        component: () => import("@/views/map/Index.vue"),
        beforeEnter: (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
            const store = useStore();
            console.log(store)
            console.log("store.name", store.name);
            if (!store.name) {
                next("/");
            } else {
                next();
            }
        },
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
