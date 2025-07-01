import { createWebHistory, createRouter } from 'vue-router';

import Transactions from './components/Transactions.vue';
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Transactions,
  },
    {
      name: 'Transactions',
      path: '/transactions',
      component: Transactions
    }
];
    const router = createRouter({
        history: createWebHistory(),
        routes,
      });
      
      export default router;