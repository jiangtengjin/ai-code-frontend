<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/loginUser'
import { ENV_CONFIG } from '@/config/env'
import dayjs from 'dayjs'

interface Props {
  app: API.AppVO
  showCreator?: boolean
  showTime?: boolean
  size?: 'default' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  showCreator: true,
  showTime: true,
  size: 'default'
})

const router = useRouter()
const loginUserStore = useLoginUserStore()

// 计算创建者信息
const creator = computed(() => {
  if (props.showCreator) {
    return props.app.user || loginUserStore.loginUser
  }
  return null
})

// 格式化时间
const formatTime = (time: string | undefined) => {
  if (!time) return ''
  return dayjs(time).format('YYYY-MM-DD')
}

// 查看对话
const viewChat = () => {
  if (props.app.id) {
    router.push(`/app/chat/${props.app.id}?view=1`)
  }
}

// 查看作品
const viewWork = () => {
  if (props.app.deployKey) {
    const url = `${ENV_CONFIG.DEPLOY_BASE_URL}/${props.app.deployKey}`
    window.open(url, '_blank')
  }
}
</script>

<template>
  <div class="app-card" :class="{ 'app-card-large': size === 'large' }">
    <div class="app-preview">
      <img v-if="app.cover" :src="app.cover" :alt="app.appName" />
      <div v-else class="app-placeholder">
        <span>🤖</span>
      </div>
      <div class="app-overlay">
        <a-space>
          <a-button type="primary" @click="viewChat">查看对话</a-button>
          <a-button v-if="app.deployKey" type="default" @click="viewWork">查看作品</a-button>
        </a-space>
      </div>
    </div>
    
    <div class="app-info">
      <div v-if="showCreator" class="app-card-layout">
        <div class="app-card-left">
          <a-avatar :src="creator?.userAvatar" size="default">
            {{ creator?.userName?.charAt(0) || 'N' }}
          </a-avatar>
        </div>
        <div class="app-card-right">
          <h3 class="app-title">{{ app.appName || '未命名应用' }}</h3>
          <p class="app-creator">{{ creator?.userName || 'NoCode 官方' }}</p>
        </div>
      </div>
      <div v-else>
        <h3 class="app-title">{{ app.appName || '未命名应用' }}</h3>
      </div>
      
      <p v-if="showTime" class="app-time">创建于 {{ formatTime(app.createTime) }}</p>
    </div>
  </div>
</template>

<style scoped>
.app-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
}

.app-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.app-card-large {
  min-width: 320px;
}

.app-preview {
  height: 180px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.app-card-large .app-preview {
  height: 200px;
}

.app-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.app-placeholder {
  font-size: 48px;
  color: #d9d9d9;
}

.app-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.app-card:hover .app-overlay {
  opacity: 1;
}

.app-info {
  padding: 16px;
}

.app-card-layout {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.app-card-left {
  flex-shrink: 0;
}

.app-card-right {
  flex: 1;
  min-width: 0;
}

.app-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px;
  color: #1a1a1a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.app-creator {
  font-size: 13px;
  color: #666;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.app-creator::before {
  content: "👤";
  font-size: 11px;
}

.app-time {
  font-size: 12px;
  color: #999;
  margin: 0;
  text-align: center;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}
</style>