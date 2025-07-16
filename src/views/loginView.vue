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

        <!-- Password input + icon toggle -->
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
    handleSubmit() {
      if (this.email === 'admin@example.com' && this.password === 'admin') {
        this.$router.push('/dashboard')
      } else {
        alert('Email atau password salah')
      }
    }
  }
}
</script>

<style>
@import '@/assets/css/login.css';
</style>