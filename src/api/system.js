import axios from '@/libs/api.request'

export const listLog = (parmas) => {
  return axios.request({
    url: 'sys/log/list',
    data: parmas,
    method: 'post'
  })
}

export const deleteLog = (id) => {
  return axios.request({
    url: 'sys/log/' + id,
    method: 'delete'
  })
}

export const deleteBacthLog = (ids) => {
  console.log(ids)
  return axios.request({
    url: 'sys/log/delete',
    data: ids,
    method: 'post'
  })
}
