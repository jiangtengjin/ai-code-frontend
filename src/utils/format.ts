import dayjs from 'dayjs'

/**
 * 格式化时间
 * @param time 时间字符串
 * @param format 格式化模板
 * @returns 格式化后的时间字符串
 */
export const formatTime = (time: string | undefined, format = 'YYYY-MM-DD HH:mm:ss'): string => {
  if (!time) return ''
  return dayjs(time).format(format)
}

/**
 * 格式化相对时间
 * @param time 时间字符串
 * @returns 相对时间字符串
 */
export const formatRelativeTime = (time: string | undefined): string => {
  if (!time) return ''

  const now = dayjs()
  const target = dayjs(time)
  const diff = now.diff(target, 'minute')

  if (diff < 1) {
    return '刚刚'
  } else if (diff < 60) {
    return `${diff}分钟前`
  } else if (diff < 60 * 24) {
    return `${Math.floor(diff / 60)}小时前`
  } else if (diff < 60 * 24 * 30) {
    return `${Math.floor(diff / (60 * 24))}天前`
  } else {
    return target.format('YYYY-MM-DD')
  }
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的文件大小
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 格式化数字
 * @param num 数字
 * @returns 格式化后的数字字符串
 */
export const formatNumber = (num: number): string => {
  if (num < 1000) return num.toString()
  if (num < 10000) return (num / 1000).toFixed(1) + 'K'
  if (num < 100000) return (num / 10000).toFixed(1) + 'W'
  return (num / 10000).toFixed(0) + 'W'
}

/**
 * 截断文本
 * @param text 文本
 * @param maxLength 最大长度
 * @returns 截断后的文本
 */
export const truncateText = (text: string | undefined, maxLength: number): string => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * 格式化用户角色
 * @param role 用户角色
 * @returns 格式化后的角色名称
 */
export const formatUserRole = (role: string | undefined): string => {
  switch (role) {
    case 'admin':
      return '管理员'
    case 'user':
      return '普通用户'
    default:
      return '未知角色'
  }
}

/**
 * 格式化应用优先级
 * @param priority 优先级
 * @returns 格式化后的优先级描述
 */
export const formatAppPriority = (priority: number | undefined): string => {
  if (priority === 99) return '精选'
  if (priority === 0) return '普通'
  return `优先级${priority}`
}

/**
 * 格式化部署状态
 * @param deployedTime 部署时间
 * @param deployKey 部署密钥
 * @returns 部署状态描述
 */
export const formatDeployStatus = (
  deployedTime: string | undefined,
  deployKey: string | undefined,
): string => {
  if (!deployedTime && !deployKey) return '未部署'
  if (deployedTime) return '已部署'
  return '部署中'
}

/**
 * 生成预览链接
 * @param codeGenType 代码生成类型
 * @param appId 应用ID
 * @returns 预览链接
 */
export const generatePreviewUrl = (
  codeGenType: string | undefined,
  appId: number | undefined,
): string => {
  if (!codeGenType || !appId) return ''
  return `http://localhost:8123/api/static/${codeGenType}_${appId}/`
}
