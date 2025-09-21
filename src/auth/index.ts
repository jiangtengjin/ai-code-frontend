import router from '@/router'
import { useLoginUserStore } from '@/stores/loginUser'
import ACCESS_ENUM from './accessEnum'
import checkAuth from './checkAuth'

router.beforeEach(async (to, from, next) => {
  // 判断路由是否存在，不存在则跳转到404
  if (!to.matched.length) {
    next('/notFound')
    return
  }
  const loginUserStore = useLoginUserStore()
  let loginUser = loginUserStore.loginUser
  // 如果之前没登陆过，自动登录
  if (!loginUser || !loginUser.userRole) {
    // 加 await 是为了等用户登录成功之后，再执行后续的代码
    await loginUserStore.fetchLoginUser()
    loginUser = loginUserStore.loginUser
  }
  console.log('登陆用户信息', loginUser)
  const needAccess = (to.meta?.access as string) ?? ACCESS_ENUM.NOT_LOGIN
  // 要跳转的页面必须要登陆
  if (needAccess !== ACCESS_ENUM.NOT_LOGIN) {
    // 如果没登陆，跳转到登录页面
    if (!loginUser || !loginUser.userRole || loginUser.userRole === ACCESS_ENUM.NOT_LOGIN) {
      next(`/user/login?redirect=${to.fullPath}`)
      return
    }
    // 如果已经登陆了，但是权限不足，那么跳转到无权限页面
    if (!checkAuth(loginUser, needAccess)) {
      next('/noAuth')
      return
    }
  }
  next()
})
