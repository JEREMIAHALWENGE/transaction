import { defineStore } from 'pinia'
import axios from 'axios'
axios.defaults.baseURL = 'http://localhost:3000'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user  : JSON.parse(localStorage.getItem('user'))  || null,
    token : localStorage.getItem('token') || null,
    error : null,
    loading: false,
  }),
  getters: {
    isLoggedIn: (s) => !!s.token,
  },
  actions: {
    async login (email, password) {
      this.loading = true
      this.error   = null
      try {
        const { data } = await axios.post('/api/auth/login', { email, password })
        this.user  = data.user
        this.token = data.token
        localStorage.setItem('user',  JSON.stringify(data.user))
        localStorage.setItem('token', data.token)
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
      } catch (err) {
        this.error = err.response?.data?.message || err.message
        throw err
      } finally {
        this.loading = false
      }
    },
    async register (payload) {
      this.loading = true
      this.error   = null
      try {
        const { data } = await axios.post('/api/auth/register', payload)
        this.user  = data.user
        this.token = data.token
        localStorage.setItem('user',  JSON.stringify(data.user))
        localStorage.setItem('token', data.token)
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
      } catch (err) {
        this.error = err.response?.data?.message || err.message
        throw err
      } finally {
        this.loading = false
      }
    },
    logout () {
      this.user  = null
      this.token = null
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
    },
  },
})
