import axios from '@/libs/api.request'

export const getActivityList = (params) => {
  return axios.request({
    url: 'sys/activity/list',
    data: params,
    method: 'post'
  })
}

export const saveActivity = (params) => {
  return axios.request({
    url: 'sys/activity',
    data: params,
    method: 'post'
  })
}
export const updateActivity = (params) => {
  return axios.request({
    url: 'sys/activity',
    data: params,
    method: 'put'
  })
}

export const deleteActivity = (id) => {
  return axios.request({
    url: 'sys/activity/' + id,
    method: 'delete'
  })
}
