import axios from '@/libs/api.request'

export const getElderList = (params) => {
  return axios.request({
    url: 'sys/elder/list',
    data: params,
    method: 'post'
  })
}

export const saveElder = (params) => {
  return axios.request({
    url: 'sys/elder',
    data: params,
    method: 'post'
  })
}
export const updateElder = (params) => {
  return axios.request({
    url: 'sys/elder',
    data: params,
    method: 'put'
  })
}

export const deleteElder = (id) => {
  return axios.request({
    url: 'sys/elder/' + id,
    method: 'delete'
  })
}
