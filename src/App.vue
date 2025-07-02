<script setup>

</script>

<template>
  <main>
    <router-view />
  </main>
</template>


<style scoped>
/* ──────────────────────────────
   Center the Transactions card
   ────────────────────────────── */
main {
  display: block;
 
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
