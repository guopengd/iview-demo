import axios from '@/libs/api.request'

export const login = ({userName, password, code, uuid}) => {
  const data = {
    userName,
    password,
    code,
    uuid
  }
  return axios.request({
    url: 'sys/login',
    data,
    method: 'post'
  })
}

export const logout = (token) => {
  return axios.request({
    url: 'sys/logout',
    method: 'post'
  })
}

export const createCode = (uuid) => {
  return axios.request({
    url: 'sys/createCode/' + uuid,
    method: 'get'
  })
}

export const listUserMenus = () => {
  return axios.request({
    url: 'sys/menu',
    method: 'post'
  })
}

export const reLogin = (password) => {
  return axios.request({
    url: 'sys/reLogin',
    data: {password},
    method: 'post'
  })
}
