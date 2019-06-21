import axios from '@/libs/api.request'

export const listCustomer = (params) => {
  return axios.request({
    url: 'sys/customer/list',
    data: params,
    method: 'post'
  })
}

export const queryCustomer = (id) => {
  return axios.request({
    url: 'sys/customer/' + id,
    method: 'get'
  })
}

export const addCustomer = (params) => {
  return axios.request({
    url: 'sys/customer',
    data: params,
    method: 'post'
  })
}

export const deleteCustomer = (id) => {
  return axios.request({
    url: 'sys/customer/' + id,
    method: 'delete'
  })
}

export const updateCustomer = (params) => {
  return axios.request({
    url: 'sys/customer',
    data: params,
    method: 'put'
  })
}

export const getAuthorization = (id) => {
  return axios.request({
    url: 'sys/authorization/' + id,
    method: 'get'
  })
}
