import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
})

// زيد token لكل request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token')
  if (token) req.headers.Authorization = `Bearer ${token}`
  return req
})

// Auth
export const register = (data) => API.post('/auth/register', data)
export const login = (data) => API.post('/auth/login', data)

// Vehicles
export const getVehicles = () => API.get('/vehicles')
export const createVehicle = (data) => API.post('/vehicles', data)
export const updateVehicle = (id, data) => API.put(`/vehicles/${id}`, data)
export const deleteVehicle = (id) => API.delete(`/vehicles/${id}`)

// Clients
export const getClients = () => API.get('/clients')
export const createClient = (data) => API.post('/clients', data)
export const updateClient = (id, data) => API.put(`/clients/${id}`, data)
export const deleteClient = (id) => API.delete(`/clients/${id}`)

// Contracts
export const getContracts = () => API.get('/contracts')
export const createContract = (data) => API.post('/contracts', data)
export const updateContract = (id, data) => API.put(`/contracts/${id}`, data)
export const deleteContract = (id) => API.delete(`/contracts/${id}`)