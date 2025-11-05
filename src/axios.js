import axios from 'axios'

const instance = axios.create({
  baseURL: 'http://160.187.143.174/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
})

// Tambah interceptor supaya token dikirim otomatis di setiap request
instance.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default instance
