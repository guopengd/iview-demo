import axios from '@/libs/api.request'

export const getMenuList = () => {
  return axios.request({
    url: 'sys/menu/list',
    method: 'get'
  })
}
