<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { getAppVoById, deleteApp } from '@/api/appController'
import { useLoginUserStore } from '@/stores/loginUser'
import { ENV_CONFIG } from '@/config/env'
import AppPreview from '@/components/AppPreview.vue'

const route = useRoute()
const router = useRouter()
const loginUserStore = useLoginUserStore()

// 应用信息
const app = ref<API.AppVO>({})
const loading = ref(false)

// 获取应用信息
const loadApp = async () => {
  const appId = route.params.id as string
  if (!appId) {
    message.error('应用ID不存在')
    router.push('/')
    return
  }

  loading.value = true
  try {
    const res = await getAppVoById({ id: appId as any })
    if (res.data.code === 0 && res.data.data) {
      app.value = res.data.data
    } else {
      message.error('获取应用信息失败：' + res.data.message)
      router.push('/')
    }
  } catch (error) {
    message.error('获取应用信息失败')
    router.push('/')
  } finally {
    loading.value = false
  }
}

// 编辑应用
const editApp = () => {
  router.push(`/app/edit/${app.value.id}`)
}

// 删除应用
const handleDelete = async () => {
  if (!app.value.id) return

  try {
    const res = await deleteApp({ id: app.value.id })
    if (res.data.code === 0) {
      message.success('删除成功')
      router.push('/')
    } else {
      message.error('删除失败：' + res.data.message)
    }
  } catch (error) {
    message.error('删除失败，请重试')
  }
}

// 继续对话
const continueChat = () => {
  router.push(`/app/chat/${app.value.id}`)
}

// 预览URL
const previewUrl = computed(() => {
  if (app.value.codeGenType && app.value.id) {
    return `${ENV_CONFIG.PREVIEW_BASE_URL}/${app.value.codeGenType}_${app.value.id}/`
  }
  return ''
})

// 打开预览
const openPreview = () => {
  if (previewUrl.value) {
    window.open(previewUrl.value, '_blank')
  }
}

// 检查是否是应用所有者
const isOwner = () => {
  return String(loginUserStore.loginUser.id) === String(app.value.userId)
}

onMounted(() => {
  loadApp()
})
</script>

<template>
  <div class="app-detail-page">
    <a-spin :spinning="loading" tip="加载中...">
      <!-- 返回按钮 -->
      <div class="page-header">
        <a-button type="text" @click="router.back()" class="back-btn">
          <template #icon>←</template>
          返回
        </a-button>
      </div>

      <div class="detail-content" v-if="app.id">
        <!-- 应用基本信息 -->
        <div class="app-info-card">
          <div class="app-cover">
            <img 
              v-if="app.cover" 
              :src="app.cover" 
              :alt="app.appName"
              class="cover-image"
            />
            <div v-else class="cover-placeholder">
              <span>🎨</span>
            </div>
          </div>
          
          <div class="app-details">
            <h1 class="app-name">{{ app.appName || '未命名应用' }}</h1>
            
            <div class="app-meta">
              <div class="meta-item">
                <span class="meta-label">创建者：</span>
                <span class="meta-value">{{ app.user?.userName || '未知' }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">创建时间：</span>
                <span class="meta-value">{{ new Date(app.createTime || '').toLocaleString() }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">更新时间：</span>
                <span class="meta-value">{{ new Date(app.updateTime || '').toLocaleString() }}</span>
              </div>
              <div class="meta-item" v-if="app.deployedTime">
                <span class="meta-label">部署时间：</span>
                <span class="meta-value">{{ new Date(app.deployedTime).toLocaleString() }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">应用类型：</span>
                <span class="meta-value">{{ app.codeGenType || '网站' }}</span>
              </div>
              <div class="meta-item" v-if="app.priority && app.priority > 0">
                <span class="meta-label">优先级：</span>
                <span class="meta-value">{{ app.priority }}</span>
              </div>
            </div>

            <div class="app-description">
              <h3>应用描述</h3>
              <p>{{ app.initPrompt || '暂无描述' }}</p>
            </div>

            <!-- 操作按钮 -->
            <div class="action-buttons">
              <a-button type="primary" @click="continueChat" size="large">
                继续对话
              </a-button>
              
              <a-button @click="openPreview" size="large" v-if="app.codeGenType">
                预览应用
              </a-button>
              
              <template v-if="isOwner()">
                <a-button @click="editApp" size="large">
                  编辑应用
                </a-button>
                
                <a-popconfirm
                  title="确定要删除这个应用吗？"
                  ok-text="确定"
                  cancel-text="取消"
                  @confirm="handleDelete"
                >
                  <a-button danger size="large">
                    删除应用
                  </a-button>
                </a-popconfirm>
              </template>
            </div>
          </div>
        </div>

        <!-- 应用预览 -->
        <div class="app-preview-card" v-if="app.codeGenType">
          <h2>应用预览</h2>
          <AppPreview
            :url="previewUrl"
            :loading="false"
            placeholder-text="应用预览加载中..."
            class="preview-wrapper"
          />
        </div>
      </div>
    </a-spin>
  </div>
</template>

<style scoped>
.app-detail-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.page-header {
  margin-bottom: 24px;
}

.back-btn {
  font-size: 16px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 应用信息卡片 */
.app-info-card {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 32px;
}

.app-cover {
  flex-shrink: 0;
  width: 200px;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  font-size: 64px;
  color: #bfbfbf;
}

.app-details {
  flex: 1;
}

.app-name {
  font-size: 32px;
  font-weight: 600;
  margin: 0 0 24px 0;
  color: #262626;
}

.app-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.meta-item {
  display: flex;
  align-items: center;
}

.meta-label {
  font-weight: 500;
  color: #8c8c8c;
  min-width: 80px;
}

.meta-value {
  color: #262626;
}

.app-description {
  margin-bottom: 32px;
}

.app-description h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #262626;
}

.app-description p {
  color: #595959;
  line-height: 1.6;
  margin: 0;
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

/* 应用预览卡片 */
.app-preview-card {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.app-preview-card h2 {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 24px 0;
  color: #262626;
}

.preview-wrapper {
  height: 600px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-info-card {
    flex-direction: column;
    padding: 24px;
  }
  
  .app-cover {
    width: 100%;
    height: 200px;
  }
  
  .app-name {
    font-size: 24px;
  }
  
  .app-meta {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .preview-wrapper {
    height: 400px;
  }
}
</style>