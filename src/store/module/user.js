import {login, logout, getUserInfo} from '@/api/user'
import {setToken, getToken} from '@/libs/util'
import {ResPonseCallback} from '@/common/callback.js'

export default {
  state: {
    userName: '',
    userId: '',
    avatorImgPath: '',
    token: getToken(),
    access: '',
    hasGetInfo: false
  },
  mutations: {
    setAvator(state, avatorPath) {
      state.avatorImgPath = avatorPath
    },
    setUserId(state, id) {
      state.userId = id
    },
    setUserName(state, name) {
      state.userName = name
    },
    setAccess(state, access) {
      state.access = access
    },
    setToken(state, token) {
      state.token = token
      setToken(token)
    },
    setHasGetInfo(state, status) {
      state.hasGetInfo = status
    }
  },
  actions: {
    // 登录
    handleLogin({commit}, {userName, password, code, uuid}) {
      return new Promise((resolve, reject) => {
        login({
          userName,
          password,
          code,
          uuid
        }).then(res => {
          const data = res.data
          if (data.token) {
            commit('setToken', data.token)
            commit('setHasGetInfo', true)
          }
          resolve(res)
        }).catch(err => {
          reject(err)
        })
      })
    },
    // 退出登录
    handleLogOut({state, commit}) {
      return new Promise((resolve, reject) => {
        logout(state.token).then(() => {
          commit('setToken', '')
          commit('setAccess', [])
          localStorage.clear()
          resolve()
        }).catch(err => {
          ResPonseCallback(err)
          reject(err)
        })
        // 如果你的退出登录无需请求接口，则可以直接使用下面三行代码而无需使用logout调用接口
        //commit('setToken', '')
        //commit('setAccess', [])
        //resolve()
      })
    }
  }
}
