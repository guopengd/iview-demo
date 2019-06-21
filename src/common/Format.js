// 时间格式化
export function formatDate(date, fmt) {
  let o = {
    'M+': date.getMonth() + 1, // 月份
    'd+': date.getDate(), // 日
    'h+': date.getHours(), // 小时
    'm+': date.getMinutes(), // 分
    's+': date.getSeconds(), // 秒
    'S': date.getMilliseconds() // 毫秒
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  for (var k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
    }
  }
  return fmt
}

// 状态显示
export function formatState(status) {
  switch (status) {
    case 1:
      return '启用'
    case 0:
      return '禁用'
  }
}

// 手机号显示
export function formatPhone(phone) {
  if (phone && phone.match(/^1\d{10}$/)) {
    return phone
  } else {
    return '暂无'
  }
}

export function formatEmail(email) {
  if (email) {
    return email
  } else {
    return '暂无'
  }
}

export function getSelected(roleMenu, menuList) {
  for (let i = 0; i < menuList.length; i++) {
    getRecursion(roleMenu, menuList[i])
    console.log(i)
  }
}

export function getRecursion(roleMenu, menuList) {
  for (let i = 0; i < menuList.length; i++) {
    if (menuList[i].children) {
      getRecursion(roleMenu, menuList)
    } else {
      for (let j = 0; j < roleMenu.length; j++) {
        if (roleMenu.menuId === menuList.id) {
          menuList.checked = true
          return
        }
      }
    }
  }
}
