import { createRouter, createWebHistory } from "vue-router";
import { getToken } from "@/utils/auth";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: "Login",
      component: () => import("@/views/Login/index.vue"),
      meta: { guest: true },
    },
    {
      path: "/",
      redirect: "/dashboard",
    },
    {
      path: "/dashboard",
      name: "Dashboard",
      component: () => import("@/views/Dashboard/index.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/timeline",
      name: "Timeline",
      component: () => import("@/views/Timeline/index.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/items",
      name: "Items",
      component: () => import("@/views/Items/index.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/item/:id",
      name: "Item",
      component: () => import("@/views/Item/index.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/settings",
      name: "Settings",
      component: () => import("@/views/Settings/index.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/:pathMatch(.*)*",
      name: "NotFound",
      component: () => import("@/views/NotFound/index.vue"),
    },
  ],
});

router.beforeEach((to, _from, next) => {
  const token = getToken();

  if (to.meta.requiresAuth && !token) {
    next("/login");
  } else if (to.meta.guest && token) {
    next("/dashboard");
  } else {
    next();
  }
});

export default router;
