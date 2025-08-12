import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import AdminLayout from '../layouts/AdminLayout.vue'
import DashboardHome from '../views/DashboardHome.vue'
import UploadPeta from '../views/UploadPeta.vue'
import DataPohon from '../views/DataPohon.vue'
import DataBlok from '../views/DataBlok.vue'
import DataLahan from '../views/DataLahan.vue'
// import DataZona from '../views/DataZona.vue'
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
    children: [
      {
        path: '', // -> /admin
        name: 'DashboardHome',
        component: DashboardHome
      },
      {
        path: 'upload-peta', 
        name: 'UploadPeta.vue',
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
      // {
      //   path: 'data-zona',
      //   name: 'DataZona',
      //   component: DataZona
      // },
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
    component: HomeStaff
  },
  {
    path: '/peta',
    name: 'MapView',
    component: () => import('@/views/MapView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const isLoggedIn = !!localStorage.getItem('token')

  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login')
  } else if (to.path === '/login' && isLoggedIn) {
    // Cegah user masuk login kalau sudah login
    const role = localStorage.getItem('role')
    if (role === 'admin') {
      next('/admin')
    } else {
      next('/homestaff')
    }
  } else {
    next()
  }
})

export default router