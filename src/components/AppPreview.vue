<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ExportOutlined } from '@ant-design/icons-vue'
import { generatePreviewUrl } from '@/config/env'

interface Props {
  appId?: string | number
  codeGenType?: string
  title?: string
  loading?: boolean
  showHeader?: boolean
  url?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '生成后的网页展示',
  loading: false,
  showHeader: true,
})

const previewReady = ref(false)

// 计算预览URL
const previewUrl = computed(() => {
  // 优先使用外部传入的完整 URL
  if (props.url) return props.url
  if (!props.appId || !props.codeGenType) return ''
  // 使用环境方法统一生成预览URL
  return generatePreviewUrl(props.codeGenType, props.appId)
})

// 监听URL变化，重置预览状态
watch(previewUrl, () => {
  previewReady.value = false
})

// 在新窗口打开预览
const openInNewTab = () => {
  if (previewUrl.value) {
    window.open(previewUrl.value, '_blank')
  }
}

// iframe加载完成
const onIframeLoad = () => {
  previewReady.value = true
}
</script>

<template>
  <div class="app-preview">
    <div v-if="showHeader" class="preview-header">
      <h3>{{ title }}</h3>
      <div class="preview-actions">
        <a-button v-if="previewUrl" type="link" @click="openInNewTab">
          <template #icon>
            <ExportOutlined />
          </template>
          新窗口打开
        </a-button>
      </div>
    </div>

    <div class="preview-content">
      <div v-if="!previewUrl && !loading" class="preview-placeholder">
        <div class="placeholder-icon">🌐</div>
        <p>网站文件生成完成后将在这里展示</p>
      </div>

      <div v-else-if="loading" class="preview-loading">
        <a-spin size="large" />
        <p>正在生成网站...</p>
      </div>

      <iframe
        v-else
        :src="previewUrl"
        class="preview-iframe"
        frameborder="0"
        @load="onIframeLoad"
      ></iframe>
    </div>
  </div>
</template>

<style scoped>
.app-preview {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  height: 100%;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #e8e8e8;
  flex-shrink: 0;
}

.preview-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.preview-actions {
  display: flex;
  gap: 8px;
}

.preview-content {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
}

.placeholder-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.preview-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
}

.preview-loading p {
  margin-top: 16px;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
}
</style>
