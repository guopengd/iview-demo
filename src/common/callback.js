import {Message} from 'iview'
import Cookies from 'js-cookie'
import {TOKEN_KEY} from '../libs/util'
import router from '@/router/index'
import {Modal} from 'iview'
import {reLogin} from '@/api/user'

// 请求正常，根据后台code执行相应的回调函数
export function RequestCallback(res) {
  if (res.data.code && res.data.msg) {
    switch (res.data.code) {
      case 500:
        Message.error(res.data.msg)
        break
      case 200:
        Message.info(res.data.msg)
        break
    }
  }
}

// 请求异常，根据后台code执行相应的回调函数
export function ResPonseCallback(err) {

  // 根据后台状态码返回相应的页面
  if (err.response) {
    switch (err.response.status) {
      case 400:
        Message.error(err.response.data.message)
        break
      case 403:
        router.push({path: '401'})
        break
      case 401:
        conModal()
        break
      case 500:
        router.push({path: '500'})
        break
    }
  }

  //token失效被拦截就会返回跨域失败，执行清空token功能
  if (err.toString() === 'Error: Network Error') {
    if (Cookies.get(TOKEN_KEY)) {
      Cookies.set(TOKEN_KEY, '', {expires: 7})
      router.push({name: 'login'})
      Message.error("您的token不合法或者过期了，请重新登陆")
    }
  }

}

//敏感操作确认密码
export function conModal() {
  let val = ''
  return Modal.confirm({
    render: (h) => {
      return h('Input', {
        props: {
          value: val,
          autofocus: true,
          placeholder: '敏感操作，请确认密码后再进行操作'
        },
        on: {
          input: (v) => {
            val = v
          }
        }
      })
    },
    onOk: () => {
      reLogin(val)
    }
  })
}
