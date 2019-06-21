import axios from '@/libs/api.request'

export const getRoleList = (params) => {
  return axios.request({
    url: 'sys/role/list',
    data: params,
    method: 'post'
  })
}

export const saveRole = (params) => {
  return axios.request({
    url: 'sys/role',
    data: params,
    method: 'post'
  })
}
export const updateRole = (params) => {
  return axios.request({
    url: 'sys/role',
    data: params,
    method: 'put'
  })
}

export const deleteRole = (id) => {
  return axios.request({
    url: 'sys/role/' + id,
    method: 'delete'
  })
}

export const roleMenuQuery = (id) => {
  return axios.request({
    url: 'sys/role/menu/' + id,
    method: 'get'
  })
}

export const authorizationMenu = (params) => {
  return axios.request({
    url: 'sys/role/menu',
    data: params,
    method: 'post'
  })
}
