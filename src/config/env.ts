// 环境变量配置
export const ENV_CONFIG = {
  // API 基础 URL
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8123/api',
  
  // 应用预览基础 URL
  PREVIEW_BASE_URL: import.meta.env.VITE_PREVIEW_BASE_URL || 'http://localhost:8123/api/static',
  
  // 应用部署基础 URL
  DEPLOY_BASE_URL: import.meta.env.VITE_DEPLOY_BASE_URL || 'http://localhost',
}

// 生成预览 URL 的工具函数
export const generatePreviewUrl = (codeGenType: string, appId: string | number): string => {
  return `${ENV_CONFIG.PREVIEW_BASE_URL}/${codeGenType}_${appId}/`
}

// 生成部署 URL 的工具函数
export const generateDeployUrl = (deployKey: string): string => {
  return `${ENV_CONFIG.DEPLOY_BASE_URL}/${deployKey}`
}