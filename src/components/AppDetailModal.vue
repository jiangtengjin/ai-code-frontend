<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useLoginUserStore } from '@/stores/loginUser'
import { deleteApp as deleteAppApi } from '@/api/appController'
import dayjs from 'dayjs'
import {
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons-vue'

interface Props {
  visible: boolean
  app?: API.AppVO
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'deleted'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const router = useRouter()
const loginUserStore = useLoginUserStore()

// 计算权限
const isOwner = computed(() => {
  return props.app?.userId === loginUserStore.loginUser.id
})

const isAdmin = computed(() => {
  return loginUserStore.loginUser.userRole === 'admin'
})

// 格式化时间
const formatTime = (time: string | undefined) => {
  if (!time) return ''
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

// 关闭弹窗
const handleClose = () => {
  emit('update:visible', false)
}

// 编辑应用
const editApp = () => {
  if (props.app?.id) {
    router.push(`/app/edit/${props.app.id}`)
    handleClose()
  }
}

// 删除应用
const deleteApp = async () => {
  if (!props.app?.id) return

  try {
    const res = await deleteAppApi({ id: props.app.id })
    if (res.data.code === 0) {
      message.success('删除成功')
      emit('deleted')
      handleClose()
    } else {
      message.error('删除失败：' + res.data.message)
    }
  } catch (error) {
    console.error('删除失败：', error)
    message.error('删除失败')
  }
}
</script>

<template>
  <a-modal 
    :open="visible" 
    title="应用详情" 
    :footer="null" 
    width="500px"
    @cancel="handleClose"
  >
    <div class="app-detail-content" v-if="app">
      <!-- 应用基础信息 -->
      <div class="app-basic-info">
        <div class="info-item">
          <span class="info-label">创建者：</span>
          <div class="creator-info">
            <a-avatar :src="app.user?.userAvatar" size="small" />
            <span class="creator-name">{{ app.user?.userName || '未知用户' }}</span>
          </div>
        </div>
        <div class="info-item">
          <span class="info-label">创建时间：</span>
          <span>{{ formatTime(app.createTime) }}</span>
        </div>
        <div class="info-item" v-if="app.updateTime">
          <span class="info-label">更新时间：</span>
          <span>{{ formatTime(app.updateTime) }}</span>
        </div>
        <div class="info-item" v-if="app.codeGenType">
          <span class="info-label">应用类型：</span>
          <span>{{ app.codeGenType }}</span>
        </div>
      </div>

      <!-- 应用描述 -->
      <div class="app-description" v-if="app.initPrompt">
        <div class="info-item">
          <span class="info-label">应用描述：</span>
        </div>
        <p class="description-text">{{ app.initPrompt }}</p>
      </div>

      <!-- 操作栏（仅本人或管理员可见） -->
      <div v-if="isOwner || isAdmin" class="app-actions">
        <a-space>
          <a-button type="primary" @click="editApp">
            <template #icon>
              <EditOutlined />
            </template>
            修改
          </a-button>
          <a-popconfirm
            title="确定要删除这个应用吗？"
            @confirm="deleteApp"
            ok-text="确定"
            cancel-text="取消"
          >
            <a-button danger>
              <template #icon>
                <DeleteOutlined />
              </template>
              删除
            </a-button>
          </a-popconfirm>
        </a-space>
      </div>
    </div>
  </a-modal>
</template>

<style scoped>
.app-detail-content {
  padding: 8px 0;
}

.app-basic-info {
  margin-bottom: 24px;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.info-label {
  width: 80px;
  color: #666;
  font-size: 14px;
  flex-shrink: 0;
}

.creator-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.creator-name {
  font-size: 14px;
  color: #1a1a1a;
}

.app-description {
  margin-bottom: 24px;
}

.description-text {
  margin: 8px 0 0 0;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 6px;
  color: #666;
  line-height: 1.5;
}

.app-actions {
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: center;
}
</style>