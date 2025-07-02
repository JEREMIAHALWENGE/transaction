// src/router/index.js
import { createWebHistory, createRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import Transactions from '@/components/Transactions.vue'
import Login        from '@/components/login.vue'
import Register     from '@/components/register.vue'

const routes = [
  
  {
    path: '/',
    redirect: { name: 'Register' },
    meta: { guest: true },
  },

  {
    name: 'Transactions',
    path: '/transactions',
    component: Transactions,
    meta: { auth: true },
  },
  {
    name: 'Login',
    path: '/login',
    component: Login,
    meta: { guest: true },
  },
  {
    name: 'Register',
    path: '/register',
    component: Register,
    meta: { guest: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  if (to.meta.auth && !auth.isLoggedIn) {
    return next({ name: 'Login', query: { redirect: to.fullPath } })
  }

  if (to.meta.guest && auth.isLoggedIn) {
    return next({ name: 'Transactions' }) // send logged‑in users to dashboard
  }

  next()
})

export default router
