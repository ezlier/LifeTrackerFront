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
    // User routes
    {
      path: "/",
      redirect: "/dashboard",
      component: () => import("@/layouts/User/DefaultLayout.vue"),
      children: [
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
          path: "/focus",
          name: "Focus",
          component: () => import("@/views/Focus/index.vue"),
          meta: { requiresAuth: true },
        },
        {
          path: "/settings",
          name: "Settings",
          component: () => import("@/views/Settings/index.vue"),
          meta: { requiresAuth: true },
        },
      ],
    },

    {
      path: "/:pathMatch(.*)*",
      name: "NotFound",
      component: () => import("@/views/NotFound/index.vue"),
    },
    // Admin routes
    {
      path: "/admin",
      component: () => import("@/layouts/Admin/index.vue"),
      redirect: "/admin/users",
      meta: { requiresAuth: true },
      children: [
        {
          path: "users",
          name: "AdminUsers",
          component: () => import("@/views/Admin/Users/index.vue"),
        },
        {
          path: "timeline",
          name: "AdminTimeline",
          component: () => import("@/views/Admin/TimeLine/index.vue"),
        },
        {
          path: "dashboard",
          name: "AdminDashboard",
          component: () => import("@/views/Admin/Dashboard/index.vue"),
        },
        {
          path: "items",
          name: "AdminItems",
          component: () => import("@/views/Admin/Items/index.vue"),
        },
        {
          path: "focus",
          name: "AdminFocus",
          component: () => import("@/views/Admin/Focus/index.vue"),
        },
      ],
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
