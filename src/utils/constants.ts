/**
 * 应用相关常量
 */

// 代码生成类型
export const CODE_GEN_TYPES = {
  HTML: 'html',
  REACT: 'react',
  VUE: 'vue',
} as const

// 代码生成类型标签
export const CODE_GEN_TYPE_LABELS = {
  [CODE_GEN_TYPES.HTML]: 'HTML',
  [CODE_GEN_TYPES.REACT]: 'React',
  [CODE_GEN_TYPES.VUE]: 'Vue',
} as const

// 用户角色
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const

// 用户角色标签
export const USER_ROLE_LABELS = {
  [USER_ROLES.ADMIN]: '管理员',
  [USER_ROLES.USER]: '普通用户',
} as const

// 应用优先级
export const APP_PRIORITY = {
  FEATURED: 99, // 精选应用
  NORMAL: 0, // 普通应用
} as const

// 分页默认配置
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  DEFAULT_PAGE_NUM: 1,
  HOME_PAGE_SIZE: 6, // 首页显示数量
} as const

// 表单验证规则
export const FORM_RULES = {
  APP_NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 50,
  },
  PROMPT: {
    MAX_LENGTH: 1000,
  },
  USER_NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 20,
  },
  USER_ACCOUNT: {
    MIN_LENGTH: 4,
    MAX_LENGTH: 16,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 20,
  },
} as const

// API 响应状态码
export const API_STATUS = {
  SUCCESS: 0,
  ERROR: 1,
} as const

// 本地存储键名
export const STORAGE_KEYS = {
  LOGIN_USER: 'loginUser',
  TOKEN: 'token',
} as const

// 默认头像
export const DEFAULT_AVATAR =
  'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png'

// 部署相关
export const DEPLOY_CONFIG = {
  LOCAL_BASE_URL: 'http://localhost:8123',
  STATIC_PATH: '/api/static',
} as const
