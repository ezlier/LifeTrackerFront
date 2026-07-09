import axios from 'axios'
import { getToken, removeToken } from '@/utils/auth'
import router from '@/router'

const http = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

// Request interceptor — attach token
http.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor — unwrap data + handle 401
http.interceptors.response.use(
  (res) => {
    const body = res.data
    if (body.code === 1) {
      return body.data
    }
    return Promise.reject(new Error(body.msg || 'Request failed'))
  },
  (error) => {
    if (error.response?.status === 401) {
      removeToken()
      router.push('/login')
    }
    return Promise.reject(error)
  },
)

export default http
