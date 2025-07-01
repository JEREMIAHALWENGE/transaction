<script setup>
import Transactions from './components/Transactions.vue'
</script>

<template>
  <!-- flexbox wrapper -->
  <main>
    <Transactions />
  </main>
</template>

<style scoped>
/* ──────────────────────────────
   Center the Transactions card
   ────────────────────────────── */
main {
  display: flex;
  justify-content: center;  /* horizontal centering  */
  align-items:   center;    /* vertical centering; change to flex-start if you prefer top‑aligned */
  min-height: 100vh;        /* full‑viewport height makes vertical centering possible */
  padding: 40px 0;          /* breathing room on small screens */
  background: #fff;      /* subtle page background (optional) */
}

/* ──────────────────────────────
   Any header / logo styles you had
   ────────────────────────────── */
header { line-height: 1.5; }

.logo { display: block; margin: 0 auto 2rem; }

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }
  .logo { margin: 0 2rem 0 0; }
  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
