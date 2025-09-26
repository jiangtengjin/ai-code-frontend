import { createRouter, createWebHistory } from 'vue-router'
import ACCESS_ENUM from '@/auth/accessEnum'
import HomePage from '@/pages/HomePage.vue'
import UserLoginPage from '@/pages/user/UserLoginPage.vue'
import UserRegisterPage from '@/pages/user/UserRegisterPage.vue'
import UserManagePage from '@/pages/admin/UserManagePage.vue'
import AppManagePage from '@/pages/admin/AppManagePage.vue'
import AppChatPage from '@/pages/app/AppChatPage.vue'
import AppDetailPage from '@/pages/app/AppDetailPage.vue'
import AppEditPage from '@/pages/app/AppEditPage.vue'
import NoAuthPage from '@/pages/NoAuthPage.vue'
import NotFoundPage from '@/pages/NotFoundPage.vue'
import UserCenterPage from '@/pages/user/UserCenterPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: '主页',
      component: HomePage,
    },
    {
      path: '/user/login',
      name: '用户登录',
      component: UserLoginPage,
    },
    {
      path: '/user/register',
      name: '用户注册',
      component: UserRegisterPage,
    },
    {
      path: '/user/center',
      name: '用户中心',
      component: UserCenterPage,
    },
    {
      path: '/admin/userManage',
      name: 'adminUserManage',
      component: UserManagePage,
      meta: {
        access: ACCESS_ENUM.ADMIN,
      },
    },
    {
      path: '/admin/appManage',
      name: 'adminAppManage',
      component: AppManagePage,
      meta: {
        access: ACCESS_ENUM.ADMIN,
      },
    },
    {
      path: '/app/chat/:id',
      name: '应用对话',
      component: AppChatPage,
      meta: {
        access: ACCESS_ENUM.USER,
      },
    },
    {
      path: '/app/detail/:id',
      name: '应用详情',
      component: AppDetailPage,
    },
    {
      path: '/app/edit/:id',
      name: '编辑应用',
      component: AppEditPage,
      meta: {
        access: ACCESS_ENUM.USER,
      },
    },
    {
      path: '/noAuth',
      name: '没有权限',
      component: NoAuthPage,
    },
    {
      path: '/notFound',
      name: '页面不存在',
      component: NotFoundPage,
    },
  ],
})

// 路由守卫
import checkAuth from '@/auth/checkAuth'
import { useLoginUserStore } from '@/stores/loginUser'

router.beforeEach(async (to, from, next) => {
  // 获取当前登录用户
  const loginUserStore = useLoginUserStore()
  let loginUser = loginUserStore.loginUser

  // 如果之前没有获取过登录用户信息，则获取一次
  if (!loginUser || !loginUser.userRole) {
    await loginUserStore.fetchLoginUser()
    loginUser = loginUserStore.loginUser
  }

  // 当前页面需要的权限
  const needAccess = (to.meta?.access as string) ?? ACCESS_ENUM.NOT_LOGIN

  // 要跳转的页面必须要登录
  if (needAccess !== ACCESS_ENUM.NOT_LOGIN) {
    // 如果没登录，跳转到登录页面
    if (!loginUser || !loginUser.userRole || loginUser.userRole === ACCESS_ENUM.NOT_LOGIN) {
      next(`/user/login?redirect=${to.fullPath}`)
      return
    }

    // 如果已经登录了，但是权限不足，那么跳转到无权限页面
    if (!checkAuth(loginUser, needAccess)) {
      next('/noAuth')
      return
    }
  }

  next()
})

export default router
