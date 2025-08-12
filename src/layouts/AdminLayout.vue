<template>
  <div class="admin-layout">
    <!-- Topbar -->
    <header class="topbar">
      <div class="topbar-left">
        <button class="sidebar-toggle" @click="toggleSidebar">
          <i class="fas fa-bars"></i>
        </button>
        <img src="@/assets/image/logo.png" alt="Logo" class="logo-icon" />
        <span class="page-title">WebGIS Admin : {{ pageTitle }}</span>
      </div>
      <button class="logout-btn" @click="logout">Logout</button>
    </header>

    <!-- Main Wrapper -->
    <div class="main-wrapper">
      <!-- Sidebar -->
      <aside :class="['sidebar', { collapsed: isSidebarCollapsed }]">
        <div class="sidebar-profile" v-if="!isSidebarCollapsed">
          <img src="@/assets/image/user.png" alt="Admin Avatar" class="avatar-img" />
          <div class="admin-name">Admin: Nama Admin</div>
        </div>

        <nav>
          <router-link to="/admin" exact-active-class="active">
            <i class="fas fa-home"></i>
            <span v-if="!isSidebarCollapsed">Dashboard</span>
          </router-link>

          <div class="menu-group">
            <div class="dropdown-title" @click="toggleMenu('data')">
              <i class="fas fa-layer-group"></i>
              <span v-if="!isSidebarCollapsed">Data Spasial</span>
              <span class="arrow" v-if="!isSidebarCollapsed">{{ menuOpen.data ? '▲' : '▼' }}</span>
            </div>
            <div v-show="menuOpen.data" class="submenu">
              <router-link to="/admin/upload-peta"><i class="fas fa-upload"></i> <span v-if="!isSidebarCollapsed">Upload Peta</span></router-link>
              <router-link to="/admin/data-pohon"><i class="fas fa-tree"></i> <span v-if="!isSidebarCollapsed">Data Pohon</span></router-link>
              <router-link to="/admin/data-blok"><i class="fas fa-th-large"></i> <span v-if="!isSidebarCollapsed">Data Blok</span></router-link>
              <router-link to="/admin/data-zona"><i class="fas fa-map-marker-alt"></i> <span v-if="!isSidebarCollapsed">Data Zona</span></router-link>
              <router-link to="/admin/data-lahan"><i class="fas fa-tractor"></i> <span v-if="!isSidebarCollapsed">Data Lahan</span></router-link>
              <router-link to="/admin/data-irigasi"><i class="fas fa-water"></i> <span v-if="!isSidebarCollapsed">Data Irigasi</span></router-link>
              <router-link to="/admin/data-jalan"><i class="fas fa-road"></i> <span v-if="!isSidebarCollapsed">Data Jalan</span></router-link>
            </div>
          </div>

          <div class="menu-group">
            <div class="dropdown-title" @click="toggleMenu('user')">
              <i class="fas fa-users-cog"></i>
              <span v-if="!isSidebarCollapsed">Data Non-Spasial</span>
              <span class="arrow" v-if="!isSidebarCollapsed">{{ menuOpen.user ? '▲' : '▼' }}</span>
            </div>
            <div v-show="menuOpen.user" class="submenu">
              <router-link to="/admin/data-alat"><i class="fas fa-tools"></i> <span v-if="!isSidebarCollapsed">Data Alat</span></router-link>
              <router-link to="/admin/data-transportasi"><i class="fas fa-truck"></i> <span v-if="!isSidebarCollapsed">Data Transportasi</span></router-link>
              <router-link to="/admin/data-pekerja"><i class="fas fa-user"></i> <span v-if="!isSidebarCollapsed">Data Pekerja</span></router-link>
              <router-link to="/admin/user"><i class="fas fa-user"></i> <span v-if="!isSidebarCollapsed">Data Pengguna</span></router-link>
            </div>
          </div>
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
import axios from '@/axios'

export default {
  data() {
    return {
      menuOpen: {
        data: true,
        user: false,
      }
    }
  },
  computed: {
    pageTitle() {
      const path = this.$route.path
      if (path.includes('data-pohon')) return 'Data Pohon'
      if (path.includes('data-lahan')) return 'Data Lahan'
      if (path.includes('data-irigasi')) return 'Data Irigasi'
      if (path.includes('data-jalan')) return 'Data Jalan'
      if (path.includes('user')) return 'Management User'
      return 'Dashboard Admin'
    }
  },
  methods: {
    toggleMenu(menu) {
      this.menuOpen[menu] = !this.menuOpen[menu]
    },
    async logout() {
      try {
        await axios.post('/logout')
      } catch (error) {
        if (error.response && error.response.status === 401) {
          console.warn('Token sudah tidak berlaku / expired.')
        } else {
          console.error('Gagal logout:', error)
          alert('Terjadi kesalahan saat logout')
        }
      } finally {
        // Hapus data dari localStorage dan arahkan ke login
        localStorage.removeItem('token')
        localStorage.removeItem('user_name')
        localStorage.removeItem('role')
        this.$router.push('/login')
      }
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

.topbar {
  height: 60px;
  background-color: #014634;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  height: 32px;
  width: 32px;
}

.page-title {
  font-size: 16px;
  font-weight: 600;
}

.sidebar-toggle {
  background: transparent;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
}

.main-wrapper {
  display: flex;
  flex: 1;
  height: calc(100vh - 60px);
}

.sidebar {
  width: 200px;
  background-color: #013c2a;
  color: white;
  padding: 16px 8px;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  overflow-y: auto;
}

.sidebar.collapsed {
  width: 60px;
}

.sidebar.collapsed .submenu {
  margin-left: 0;
}

.sidebar-profile {
  text-align: center;
  margin-bottom: 12px;
}

.avatar-img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 8px;
}

.admin-name {
  font-size: 14px;
  font-weight: bold;
}

.sidebar nav a {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  font-size: 14px;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  transition: background 0.2s ease;
}

.sidebar nav a:hover,
.sidebar nav a.active {
  background-color: #02674b;
}

.menu-group {
  margin-top: 10px;
}

.dropdown-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  background-color: #014634;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: bold;
  gap: 10px;
}

.arrow {
  margin-left: auto;
}

.submenu {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 6px 0 0 10px;
}

.page-content {
  flex: 1;
  padding: 20px;
  background-color: #f5f5f5;
  overflow-y: auto;
}

.logout-btn {
  background: #ffffff;
  color: #014634;
  border: 1px solid #014634;
  padding: 6px 12px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}

.logout-btn:hover {
  background: #014634;
  color: white;
}
</style>
