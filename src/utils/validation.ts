import { FORM_RULES } from './constants'

/**
 * 验证应用名称
 * @param appName 应用名称
 * @returns 验证结果
 */
export const validateAppName = (appName: string): { valid: boolean; message?: string } => {
  if (!appName || appName.trim().length === 0) {
    return { valid: false, message: '应用名称不能为空' }
  }

  if (appName.length < FORM_RULES.APP_NAME.MIN_LENGTH) {
    return { valid: false, message: `应用名称至少${FORM_RULES.APP_NAME.MIN_LENGTH}个字符` }
  }

  if (appName.length > FORM_RULES.APP_NAME.MAX_LENGTH) {
    return { valid: false, message: `应用名称不能超过${FORM_RULES.APP_NAME.MAX_LENGTH}个字符` }
  }

  return { valid: true }
}

/**
 * 验证提示词
 * @param prompt 提示词
 * @returns 验证结果
 */
export const validatePrompt = (prompt: string): { valid: boolean; message?: string } => {
  if (!prompt || prompt.trim().length === 0) {
    return { valid: false, message: '提示词不能为空' }
  }

  if (prompt.length > FORM_RULES.PROMPT.MAX_LENGTH) {
    return { valid: false, message: `提示词不能超过${FORM_RULES.PROMPT.MAX_LENGTH}个字符` }
  }

  return { valid: true }
}

/**
 * 验证用户名
 * @param userName 用户名
 * @returns 验证结果
 */
export const validateUserName = (userName: string): { valid: boolean; message?: string } => {
  if (!userName || userName.trim().length === 0) {
    return { valid: false, message: '用户名不能为空' }
  }

  if (userName.length < FORM_RULES.USER_NAME.MIN_LENGTH) {
    return { valid: false, message: `用户名至少${FORM_RULES.USER_NAME.MIN_LENGTH}个字符` }
  }

  if (userName.length > FORM_RULES.USER_NAME.MAX_LENGTH) {
    return { valid: false, message: `用户名不能超过${FORM_RULES.USER_NAME.MAX_LENGTH}个字符` }
  }

  return { valid: true }
}

/**
 * 验证用户账号
 * @param userAccount 用户账号
 * @returns 验证结果
 */
export const validateUserAccount = (userAccount: string): { valid: boolean; message?: string } => {
  if (!userAccount || userAccount.trim().length === 0) {
    return { valid: false, message: '用户账号不能为空' }
  }

  if (userAccount.length < FORM_RULES.USER_ACCOUNT.MIN_LENGTH) {
    return { valid: false, message: `用户账号至少${FORM_RULES.USER_ACCOUNT.MIN_LENGTH}个字符` }
  }

  if (userAccount.length > FORM_RULES.USER_ACCOUNT.MAX_LENGTH) {
    return { valid: false, message: `用户账号不能超过${FORM_RULES.USER_ACCOUNT.MAX_LENGTH}个字符` }
  }

  // 只允许字母、数字和下划线
  const accountRegex = /^[a-zA-Z0-9_]+$/
  if (!accountRegex.test(userAccount)) {
    return { valid: false, message: '用户账号只能包含字母、数字和下划线' }
  }

  return { valid: true }
}

/**
 * 验证密码
 * @param password 密码
 * @returns 验证结果
 */
export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (!password || password.trim().length === 0) {
    return { valid: false, message: '密码不能为空' }
  }

  if (password.length < FORM_RULES.PASSWORD.MIN_LENGTH) {
    return { valid: false, message: `密码至少${FORM_RULES.PASSWORD.MIN_LENGTH}个字符` }
  }

  if (password.length > FORM_RULES.PASSWORD.MAX_LENGTH) {
    return { valid: false, message: `密码不能超过${FORM_RULES.PASSWORD.MAX_LENGTH}个字符` }
  }

  return { valid: true }
}

/**
 * 验证确认密码
 * @param password 原密码
 * @param confirmPassword 确认密码
 * @returns 验证结果
 */
export const validateConfirmPassword = (
  password: string,
  confirmPassword: string,
): { valid: boolean; message?: string } => {
  if (!confirmPassword || confirmPassword.trim().length === 0) {
    return { valid: false, message: '确认密码不能为空' }
  }

  if (password !== confirmPassword) {
    return { valid: false, message: '两次输入的密码不一致' }
  }

  return { valid: true }
}

/**
 * 验证邮箱
 * @param email 邮箱
 * @returns 验证结果
 */
export const validateEmail = (email: string): { valid: boolean; message?: string } => {
  if (!email || email.trim().length === 0) {
    return { valid: false, message: '邮箱不能为空' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, message: '请输入有效的邮箱地址' }
  }

  return { valid: true }
}

/**
 * 验证URL
 * @param url URL地址
 * @returns 验证结果
 */
export const validateUrl = (url: string): { valid: boolean; message?: string } => {
  if (!url || url.trim().length === 0) {
    return { valid: true } // URL可以为空
  }

  try {
    new URL(url)
    return { valid: true }
  } catch {
    return { valid: false, message: '请输入有效的URL地址' }
  }
}

/**
 * 验证优先级
 * @param priority 优先级
 * @returns 验证结果
 */
export const validatePriority = (priority: number): { valid: boolean; message?: string } => {
  if (priority < 0 || priority > 99) {
    return { valid: false, message: '优先级范围为0-99' }
  }

  return { valid: true }
}
