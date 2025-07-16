<template>
  <div class="admin-layout">
    <!-- Topbar -->
    <header class="topbar">
      <div class="topbar-left">
        <img src="@/assets/image/logo.png" alt="Logo" class="logo-icon" />
        <span class="page-title">WebGIS Admin : {{ pageTitle }}</span>
      </div>
      <button class="logout-btn" @click="logout">Logout</button>
    </header>

    <!-- Main Wrapper: Sidebar + Content -->
    <div class="main-wrapper">
      <!-- Sidebar -->
      <aside class="sidebar">
        <!-- Avatar & Name -->
        <div class="sidebar-profile">
            <img src="@/assets/image/user.png" alt="Admin Avatar" class="avatar-img" />
            <div class="admin-name">Admin: Nama Admin</div>
        </div>

        <!-- Navigation -->
        <nav>
            <router-link to="/admin" exact-active-class="active">🏠 Dashboard</router-link>
            <router-link to="/admin/data-pohon" exact-active-class="active">🌴 Data Pohon</router-link>
            <router-link to="/admin/data-lahan" exact-active-class="active">🌾 Data Lahan</router-link>
            <router-link to="/admin/data-irigasi" exact-active-class="active">🚰 Data Irigasi</router-link>
            <router-link to="/admin/data-jalan" exact-active-class="active">🛣️ Data Jalan</router-link>
            <router-link to="/admin/data-pekerja" exact-active-class="active">👷 Data Pekerja</router-link>
            <router-link to="/admin/user" exact-active-class="active">👤 Management User</router-link>
        </nav>
      </aside>

      <!-- Page Content -->
      <main class="page-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    pageTitle() {
      const path = this.$route.path
      if (path.includes('data-pohon')) return 'Data Pohon'
      if (path.includes('data-lahan')) return 'Data Lahan'
      if (path.includes('data-irigasi')) return 'Data Irigasi'
      if (path.includes('data-jalan')) return 'Data Jalan'
      if (path.includes('data-pekerja')) return 'Data Pekerja'
      if (path.includes('user')) return 'Management User'
      return 'Dashboard Admin'
    }
  },
  methods: {
    logout() {
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: 'Segoe UI', sans-serif;
}

/* Topbar */
.topbar {
  height: 60px;
  background-color: #014634;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  height: 32px;
  width: 32px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
}

.logout-btn {
  background: #e0e0e0;
  border: none;
  color: #002E24;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.3s ease;
}

.logout-btn:hover {
  background: #ccc;
}

/* Main wrapper after topbar */
.main-wrapper {
  display: flex;
  flex: 1;
  height: calc(100vh - 60px); /* sisa dari topbar */
}

/* Sidebar */
.sidebar {
  width: 220px;
  background-color: #002E24;
  color: white;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.sidebar-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 30px;
  text-align: center;
}

.sidebar-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
  margin-top: 10px;
}

.avatar-img {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 10px;
  background-color: #ddd;
}

.admin-name {
  color: white;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
}

.sidebar nav {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sidebar a {
  color: white;
  text-decoration: none;
  padding: 10px 15px;
  border-radius: 6px;
  transition: background 0.2s ease;
}

.sidebar a:hover,
.sidebar a.active {
  background-color: #014634;
}

/* Page Content */
.page-content {
  flex: 1;
  padding: 20px;
  background-color: #f5f5f5;
  overflow-y: auto;
}
</style>
