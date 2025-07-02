<template>
  <div class="auth-wrapper">
    <h2>LOGIN</h2>

    <form @submit.prevent="handleLogin">
      <label>Email</label>
      <input v-model="email" type="email" placeholder="Enter your email" required />

      <label>Password</label>
      <input v-model="password" type="password" placeholder="Enter your password" required />

      <button type="submit" :disabled="store.loading">Login</button>
    </form>

    <p v-if="store.error" class="error">{{ store.error }}</p>

    <p>
      Don’t have an account?
      <router-link to="/register" class="register-link">Register</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const store = useAuthStore()

const email = ref('')
const password = ref('')

const handleLogin = async () => {
  try {
    await store.login(email.value, password.value)
    const redirect = route.query.redirect || '/transactions'
    router.push(redirect)
  } catch (err) {
    console.error('Login failed', err)
  }
}
</script>

<style scoped>
.auth-wrapper {
  max-width: 500px;
  margin: auto;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  font-family: 'Segoe UI', sans-serif;
  color: #000;
}
h2 {
  text-align: center;
  margin-bottom: 16px;
}

label {
  font-weight: bold;
  margin-top: 12px;
  display: block;
}

input,
button {
  display: block;
  width: 100%;
  margin-top: 6px;
  padding: 10px;
  font-size: 15px;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-sizing: border-box;
}

button {
  background-color: #007bff;
  color: white;
  font-weight: bold;
  border: none;
  margin-top: 16px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}

button:hover {
  background-color: #0056b3;
}

button:disabled {
  background-color: #aaa;
  cursor: not-allowed;
}

.error {
  color: red;
  margin-top: 10px;
  font-size: 14px;
}

.register-link {
  color: #007bff;
  text-decoration: underline;
  margin-left: 4px;
}
</style>
