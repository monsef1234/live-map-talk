import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
// import { useStore } from '@/store/store';


const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        component: () => import('@/views/home/Index.vue'),
    },

    {
        path: "/map",
        component: () => import("@/views/map/Index.vue"),
        //Production update store issue
        // beforeEnter: (to, from, next) => {
        //     const store = useStore();
        //     if (!store.name) {
        //         next("/");
        //     } else {
        //         next();
        //     }
        // },
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
