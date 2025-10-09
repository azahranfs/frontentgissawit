<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-box">
        <div class="login-avatar">
          <img src="@/assets/image/user.png" alt="Avatar" />
        </div>
        <h2>LOGIN</h2>
        <h3>WebGIS Kebun Sawit</h3>
        <form @submit.prevent="handleSubmit">
          <input
            type="email"
            v-model="email"
            placeholder="Email..."
            required
          />

          <div class="password-wrapper">
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="password"
              placeholder="Password..."
              required
              class="password-input"
            />
            <span class="toggle-btn" @click="togglePassword">
              <i class="fas" :class="showPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
            </span>
          </div>

          <button type="submit">Submit</button>

          <div class="login-links">
            <a href="#">Forgot password?</a><br />
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '@/axios'

export default {
  data() {
    return {
      email: '',
      password: '',
      showPassword: false
    }
  },
  methods: {
    togglePassword() {
      this.showPassword = !this.showPassword
    },
    async handleSubmit() {
      try {
        const response = await axios.post('/login', {
          email: this.email,
          password: this.password
        })

        const token = response.data.token
        const user = response.data.user

        localStorage.setItem('token', token)
        localStorage.setItem('role', user.role)
        localStorage.setItem('user_name', user.name)

        // Redirect berdasarkan role
        if (user.role === 'admin') {
          this.$router.push('/admin')
        } else {
          this.$router.push('/homestaff')
        }
      } catch (error) {
        console.error(error)
        alert('Login gagal. Pastikan email dan password benar.')
      }
    }
  }
}
</script>

<style scoped>
@import '@/assets/css/login.css';
</style>
