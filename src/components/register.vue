<template>
  <div class="auth-wrapper">
    <div class="card">
      <h2 class="title">Create Account</h2>

      <form @submit.prevent="submit" autocomplete="off">
        <!-- Name -->
        <div class="form-group">
          <label for="name">Name</label>
          <input
            id="name"
            v-model.trim="name"
            placeholder="Your full name"
            required
          />
        </div>

        <!-- Email -->
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model.trim="email"
            type="email"
            placeholder="you@example.com"
            required
          />
        </div>

        <!-- Password -->
        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model.trim="password"
            type="password"
            minlength="6"
            placeholder="Minimum 6 characters"
            required
          />
        </div>

        <!-- Confirm -->
        <div class="form-group">
          <label for="confirm">Confirm Password</label>
          <input
            id="confirm"
            v-model.trim="confirm"
            type="password"
            minlength="6"
            placeholder="Retype password"
            required
          />
        </div>

        <button class="primary-btn" :disabled="store.loading">
          {{ store.loading ? 'Creating…' : 'Register' }}
        </button>
      </form>

      <p v-if="pwMismatch" class="msg error">Passwords do not match.</p>
      <p v-if="store.error" class="msg error">{{ store.error }}</p>

      <p class="msg">
        Already have an account?
        <router-link to="/login" class="link">Login</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const name     = ref('')
const email    = ref('')
const password = ref('')
const confirm  = ref('')

const pwMismatch = computed(
  () => password.value && confirm.value && password.value !== confirm.value
)

const store  = useAuthStore()
const router = useRouter()

async function submit () {
  if (pwMismatch.value) return
  try {
    await store.register({ name: name.value, email: email.value, password: password.value })
    store.logout()                                                // 💡 clear token
    router.push({ name: 'Login', query: { registered: 'true' } }) // show success msg
  } catch {
    /* error handled in store */
  }
}
</script>


<style scoped>
/* Layout */
.auth-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ece9e6 0%, #ffffff 40%, #f5f7fa 100%);
  padding: 20px;
  box-sizing: border-box;
}
.card {
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  border-radius: 12px;
  padding: 32px 28px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
}
.title {
  margin-bottom: 24px;
  text-align: center;
  font-size: 24px;
  font-weight: 700;
  color: #333;
}

/* Form */
.form-group {
  margin-bottom: 18px;
}
label {
  display: block;
  margin-bottom: 6px;
  color: #111;
  font-weight: 600;
  font-size: 14px;
}
input {
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 6px;
  transition: border-color 0.2s, box-shadow 0.2s;
}
input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.15);
}

/* Button */
.primary-btn {
  width: 100%;
  margin-top: 8px;
  padding: 12px;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  background: #007bff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.25s, transform 0.15s;
}
.primary-btn:hover {
  background: #0065d1;
}
.primary-btn:active {
  transform: translateY(1px);
}
.primary-btn:disabled {
  background: #8fb8ff;
  cursor: not-allowed;
}

/* Messages & links */
.msg {
  margin-top: 14px;
  font-size: 14px;
  text-align: center;
}
.error {
  color: #d93025;
}
.link {
  color: #007bff;
  text-decoration: underline;
}
.link:hover {
  color: #0056b3;
}
</style>
