import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import AdminLayout from '../layouts/AdminLayout.vue'
import DashboardHome from '../views/DashboardHome.vue'
import UploadPeta from '../views/UploadPeta.vue'
import DataPohon from '../views/DataPohon.vue'
import DataBlok from '../views/DataBlok.vue'
import DataLahan from '../views/DataLahan.vue'
import DataZona from '../views/DataZona.vue'
import DataIrigasi from '../views/DataIrigasi.vue'
import DataJalan from '../views/DataJalan.vue'
import DataPekerja from '../views/DataPekerja.vue'
import DataAlat from '../views/DataAlat.vue'
import DataTransportasi from '../views/DataTransportasi.vue'
import ManagementUser from '../views/ManagementUser.vue'
import HomeStaff from '../views/HomeStaff.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, role: 'admin' }, // 🔒 proteksi seluruh grup admin
    children: [
      {
        path: '',
        name: 'DashboardHome',
        component: DashboardHome
      },
      {
        path: 'upload-peta',
        name: 'UploadPeta',
        component: UploadPeta
      },
      {
        path: 'data-pohon',
        name: 'DataPohon',
        component: DataPohon
      },
      {
        path: 'data-blok',
        name: 'DataBlok',
        component: DataBlok
      },
      {
        path: 'data-lahan',
        name: 'DataLahan',
        component: DataLahan
      },
      {
        path: 'data-zona',
        name: 'DataZona',
        component: DataZona
      },
      {
        path: 'data-irigasi',
        name: 'DataIrigasi',
        component: DataIrigasi
      },
      {
        path: 'data-jalan',
        name: 'DataJalan',
        component: DataJalan
      },
      {
        path: 'data-pekerja',
        name: 'DataPekerja',
        component: DataPekerja
      },
      {
        path: 'data-alat',
        name: 'DataAlat',
        component: DataAlat
      },
      {
        path: 'data-transportasi',
        name: 'DataTransportasi',
        component: DataTransportasi
      },
      {
        path: 'user',
        name: 'ManagementUser',
        component: ManagementUser
      }
    ]
  },
  {
    path: '/homestaff',
    name: 'HomeStaff',
    component: HomeStaff,
    meta: { requiresAuth: true, role: 'staff' } // 🔒 proteksi halaman staf juga
  },
  {
    path: '/peta',
    name: 'MapView',
    component: () => import('@/views/MapView.vue'),
    meta: { requiresAuth: true } // boleh diakses siapa pun yg login
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ✅ Route Guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  if (to.meta.requiresAuth && !token) {
    // belum login → balik ke login
    next('/login')
  } else if (to.meta.role && to.meta.role !== role) {
    // role salah → redirect sesuai role user
    if (role === 'admin') next('/admin')
    else if (role === 'staf') next('/homestaff')
    else next('/login')
  } else if (to.path === '/login' && token) {
    // kalau sudah login, cegah masuk ke halaman login lagi
    if (role === 'admin') next('/admin')
    else next('/homestaff')
  } else {
    next()
  }
})

export default router
