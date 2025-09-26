<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { getAppVoById, updateApp } from '@/api/appController'
import { useLoginUserStore } from '@/stores/loginUser'

const route = useRoute()
const router = useRouter()
const loginUserStore = useLoginUserStore()

// 应用信息
const app = ref<API.AppVO>({})
const loading = ref(false)
const submitting = ref(false)

// 表单数据
const formData = ref({
  appName: ''
})

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
      
      // 检查权限
      if (String(app.value.userId) !== String(loginUserStore.loginUser.id)) {
        message.error('您没有权限编辑此应用')
        router.push('/')
        return
      }
      
      // 初始化表单数据
      formData.value.appName = app.value.appName || ''
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

// 提交表单
const handleSubmit = async () => {
  if (!app.value.id) return

  if (!formData.value.appName.trim()) {
    message.error('请输入应用名称')
    return
  }

  submitting.value = true
  try {
    const res = await updateApp({
      id: app.value.id,
      appName: formData.value.appName.trim()
    })

    if (res.data.code === 0) {
      message.success('更新成功')
      router.push(`/app/detail/${app.value.id}`)
    } else {
      message.error('更新失败：' + res.data.message)
    }
  } catch (error) {
    message.error('更新失败，请重试')
  } finally {
    submitting.value = false
  }
}

// 取消编辑
const handleCancel = () => {
  router.back()
}

onMounted(() => {
  loadApp()
})
</script>

<template>
  <div class="app-edit-page">
    <a-spin :spinning="loading" tip="加载中...">
      <!-- 页面头部 -->
      <div class="page-header">
        <a-button type="text" @click="router.back()" class="back-btn">
          <template #icon>←</template>
          返回
        </a-button>
        <h1 class="page-title">编辑应用</h1>
      </div>

      <!-- 编辑表单 -->
      <div class="edit-content" v-if="app.id">
        <a-card title="基本信息" class="edit-card">
          <a-form
            :model="formData"
            layout="vertical"
            @finish="handleSubmit"
          >
            <a-form-item
              label="应用名称"
              name="appName"
              :rules="[
                { required: true, message: '请输入应用名称' },
                { max: 50, message: '应用名称不能超过50个字符' }
              ]"
            >
              <a-input
                v-model:value="formData.appName"
                placeholder="请输入应用名称"
                size="large"
              />
            </a-form-item>

            <!-- 只读信息展示 -->
            <a-form-item label="应用描述">
              <a-textarea
                :value="app.initPrompt"
                :rows="4"
                readonly
                placeholder="应用描述（只读）"
              />
              <div class="form-tip">
                应用描述不可修改，如需修改请重新创建应用
              </div>
            </a-form-item>

            <a-form-item label="创建时间">
              <a-input
                :value="new Date(app.createTime || '').toLocaleString()"
                readonly
                size="large"
              />
            </a-form-item>

            <a-form-item label="更新时间">
              <a-input
                :value="new Date(app.updateTime || '').toLocaleString()"
                readonly
                size="large"
              />
            </a-form-item>

            <a-form-item label="应用类型">
              <a-input
                :value="app.codeGenType || '网站'"
                readonly
                size="large"
              />
            </a-form-item>

            <!-- 操作按钮 -->
            <a-form-item>
              <div class="form-actions">
                <a-button @click="handleCancel" size="large">
                  取消
                </a-button>
                <a-button 
                  type="primary" 
                  html-type="submit"
                  :loading="submitting"
                  size="large"
                >
                  保存修改
                </a-button>
              </div>
            </a-form-item>
          </a-form>
        </a-card>

        <!-- 应用预览 -->
        <a-card title="应用预览" class="preview-card" v-if="app.codeGenType">
          <div class="preview-container">
            <iframe 
              :src="`http://localhost:8123/api/static/${app.codeGenType}_${app.id}/`"
              class="preview-iframe"
              frameborder="0"
            ></iframe>
          </div>
        </a-card>
      </div>
    </a-spin>
  </div>
</template>

<style scoped>
.app-edit-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.back-btn {
  font-size: 16px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: #262626;
}

.edit-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.edit-card {
  height: fit-content;
}

.form-tip {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.preview-card {
  height: fit-content;
}

.preview-container {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  height: 500px;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .edit-content {
    grid-template-columns: 1fr;
  }
  
  .preview-container {
    height: 400px;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>