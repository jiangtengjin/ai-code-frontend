import { h } from 'vue'
import { HomeOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons-vue'
import ACCESS_ENUM from '@/auth/accessEnum'

/**
 * 菜单项配置接口
 */
export interface MenuConfig {
  key: string
  label: string
  title: string
  icon?: () => any
  access?: string  // 权限要求
  hideInMenu?: boolean  // 是否在菜单中隐藏
}

/**
 * 菜单配置
 * 通过维护这个配置文件来灵活管理菜单项和权限
 */
export const menuConfigs: MenuConfig[] = [
  {
    key: '/',
    label: '主页',
    title: '主页',
    icon: () => h(HomeOutlined),
    access: ACCESS_ENUM.NOT_LOGIN, // 无需登录即可访问
  },
  {
    key: '/user/center',
    label: '用户中心',
    title: '用户中心',
    icon: () => h(UserOutlined),
    access: ACCESS_ENUM.USER, // 需要登录才能访问
  },
  {
    key: '/admin/userManage',
    label: '用户管理',
    title: '用户管理',
    icon: () => h(TeamOutlined),
    access: ACCESS_ENUM.ADMIN, // 需要管理员权限
  },
  // 可以继续添加更多菜单项
  // {
  //   key: '/vip/feature',
  //   label: 'VIP功能',
  //   title: 'VIP功能',
  //   access: ACCESS_ENUM.NUMBER, // VIP权限
  // },
]

/**
 * 根据菜单配置获取路由项
 * @param menu 菜单配置
 * @returns 路由项格式的菜单
 */
export const menuToRouteItem = (menu: MenuConfig) => {
  return {
    key: menu.key,
    label: menu.label,
    title: menu.title,
    icon: menu.icon,
    meta: {
      access: menu.access,
      hideInMenu: menu.hideInMenu,
    },
  }
}