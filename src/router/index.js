import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import AdminLayout from '../layouts/AdminLayout.vue'
import DashboardHome from '../views/DashboardHome.vue'
import DataPohon from '../views/DataPohon.vue'
// import DataLahan from '../views/DataLahan.vue'
// import DataIrigasi from '../views/DataIrigasi.vue'
// import DataJalan from '../views/DataJalan.vue'
// import DataPekerja from '../views/DataPekerja.vue'
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
        path: 'data-pohon',
        name: 'DataPohon',
        component: DataPohon
      },
      // {
      //   path: 'data-lahan',
      //   name: 'DataLahan',
      //   component: DataLahan
      // },
      // {
      //   path: 'data-irigasi',
      //   name: 'DataIrigasi',
      //   component: DataIrigasi
      // },
      // {
      //   path: 'data-jalan',
      //   name: 'DataJalan',
      //   component: DataJalan
      // },
      // {
      //   path: 'data-pekerja',
      //   name: 'DataPekerja',
      //   component: DataPekerja
      // },
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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
