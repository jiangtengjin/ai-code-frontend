<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { getAppVoById, deployApp } from '@/api/appController'
import { useLoginUserStore } from '@/stores/loginUser'

const route = useRoute()
const router = useRouter()
const loginUserStore = useLoginUserStore()

// 应用信息
const app = ref<API.AppVO>({})
const loading = ref(false)

// 对话相关
const messages = ref<Array<{
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: number
}>>([])

const currentMessage = ref('')
const chatLoading = ref(false)
const messagesContainer = ref<HTMLElement>()

// 网页展示相关
const showWebsite = ref(false)
const websiteUrl = ref('')
const deployLoading = ref(false)

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
      
      // 自动发送初始提示词
      if (app.value.initPrompt && messages.value.length === 0) {
        await sendMessage(app.value.initPrompt, true)
      }
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

// 获取文件图标
const getFileIcon = (filename: string) => {
  if (filename.includes('.jsx') || filename.includes('.js')) return '📄'
  if (filename.includes('.css')) return '🎨'
  if (filename.includes('.html')) return '🌐'
  if (filename.includes('.json')) return '⚙️'
  return '📁'
}

// 判断是否为结构化响应
const isStructuredResponse = (content: string) => {
  return content.includes('STEP') || content.includes('创建') || content.includes('生成') || 
         content.includes('.jsx') || content.includes('.js') || content.includes('.css') || content.includes('.html')
}

// 解析结构化响应
const parseStructuredResponse = (content: string) => {
  const sections: any[] = []
  const lines = content.split('\n')
  
  let currentSection: any = { type: 'text', content: '' }
  
  for (const line of lines) {
    if (line.includes('STEP')) {
      // 保存当前section
      if (currentSection.content.trim()) {
        sections.push(currentSection)
      }
      
      // 创建新的step section
      currentSection = {
        type: 'step',
        title: line.trim(),
        content: ''
      }
    } else if (line.includes('.jsx') || line.includes('.js') || line.includes('.css') || line.includes('.html')) {
      // 文件相关信息
      const fileName = line.trim()
      const icon = getFileIcon(fileName)
      
      sections.push({
        type: 'file',
        name: fileName.split(' ')[0],
        path: fileName,
        icon: icon
      })
    } else if (line.includes('创建') || line.includes('生成') || line.includes('完成')) {
      // 描述性信息
      if (currentSection.type === 'step') {
        currentSection.content += line + '\n'
      } else {
        sections.push({
          type: 'description',
          content: line.trim()
        })
      }
    } else if (line.trim()) {
      // 普通文本
      if (currentSection.type === 'step') {
        currentSection.content += line + '\n'
      } else {
        currentSection.content += line + '\n'
      }
    }
  }
  
  // 添加最后一个section
  if (currentSection.content.trim()) {
    sections.push(currentSection)
  }
  
  return sections
}

// 发送消息
const sendMessage = async (content: string, isInitial = false) => {
  if (!content.trim() && !isInitial) return

  const messageContent = isInitial ? content : currentMessage.value.trim()
  if (!messageContent) return

  // 添加用户消息
  const userMessage = {
    id: Date.now().toString(),
    type: 'user' as const,
    content: messageContent,
    timestamp: Date.now()
  }
  messages.value.push(userMessage)

  if (!isInitial) {
    currentMessage.value = ''
  }

  // 滚动到底部
  await nextTick()
  scrollToBottom()

  // 添加AI消息占位符
  const aiMessage = {
    id: (Date.now() + 1).toString(),
    type: 'ai' as const,
    content: '',
    timestamp: Date.now()
  }
  messages.value.push(aiMessage)

  chatLoading.value = true

  try {
    // 使用 EventSource 接收流式响应
    const eventSource = new EventSource(
      `http://localhost:8123/api/app/chat/gen/code?appId=${app.value.id}&message=${encodeURIComponent(messageContent)}`,
      { withCredentials: true }
    )

    eventSource.onmessage = (event) => {
      const data = event.data
      if (data === '[DONE]') {
        eventSource.close()
        chatLoading.value = false
        
        // 显示网站预览
        showWebsite.value = true
        websiteUrl.value = `http://localhost:8123/api/static/${app.value.codeGenType}_${app.value.id}/`
        
        return
      }

      // 更新AI消息内容
      const lastMessage = messages.value[messages.value.length - 1]
      if (lastMessage.type === 'ai') {
        lastMessage.content += data
        
        // 滚动到底部
        nextTick(() => {
          scrollToBottom()
        })
      }
    }

    eventSource.onerror = (error) => {
      console.error('EventSource error:', error)
      eventSource.close()
      chatLoading.value = false
      message.error('对话出现错误，请重试')
    }

  } catch (error) {
    chatLoading.value = false
    message.error('发送消息失败，请重试')
  }
}

// 滚动到底部
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 部署应用
const handleDeploy = async () => {
  if (!app.value.id) return

  deployLoading.value = true
  try {
    const res = await deployApp({ appId: app.value.id })
    if (res.data.code === 0 && res.data.data) {
      message.success('部署成功！')
      
      // 显示部署链接
      const deployUrl = res.data.data
      message.info(`部署地址：${deployUrl}`, 10)
      
      // 可以选择打开新窗口
      window.open(deployUrl, '_blank')
    } else {
      message.error('部署失败：' + res.data.message)
    }
  } catch (error) {
    message.error('部署失败，请重试')
  } finally {
    deployLoading.value = false
  }
}

// 处理回车发送
const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage(currentMessage.value)
  }
}

onMounted(() => {
  loadApp()
})
</script>

<template>
  <div class="app-chat-page">
    <a-spin :spinning="loading" tip="加载中...">
      <!-- 顶部栏 -->
      <div class="chat-header">
        <div class="header-left">
          <a-button type="text" @click="router.back()" class="back-btn">
            <template #icon>←</template>
          </a-button>
          <h1 class="app-title">{{ app.appName || '生成个人博客' }}</h1>
        </div>
        <div class="header-right">
          <a-button 
            type="primary" 
            :loading="deployLoading"
            @click="handleDeploy"
            :disabled="!showWebsite"
          >
            部署按钮
          </a-button>
        </div>
      </div>

      <!-- 主要内容区域 -->
      <div class="chat-content">
        <!-- 左侧对话区域 -->
        <div class="chat-section">
          <div class="chat-title">应用名称</div>
          
          <!-- 消息区域 -->
          <div class="messages-container" ref="messagesContainer">
            <div 
              v-for="msg in messages" 
              :key="msg.id"
              :class="['message', msg.type]"
            >
              <div class="message-content">
                <div v-if="msg.type === 'user'" class="user-message">
                  {{ msg.content }}
                </div>
                <div v-else class="ai-message">
                  <div class="ai-label">AI 回复</div>
                  <div class="ai-content">
                    <div v-if="isStructuredResponse(msg.content)" class="structured-response">
                      <div v-for="(section, index) in parseStructuredResponse(msg.content)" :key="index" class="response-section">
                        <div v-if="section.type === 'step'" class="step-section">
                          <div class="step-header">
                            <span class="step-icon">🔧</span>
                            <span class="step-title">{{ section.title }}</span>
                          </div>
                          <div class="step-content" v-if="section.content">{{ section.content }}</div>
                        </div>
                        <div v-else-if="section.type === 'file'" class="file-section">
                          <div class="file-item">
                            <span class="file-icon">{{ section.icon }}</span>
                            <span class="file-name">{{ section.name }}</span>
                            <span class="file-path">{{ section.path }}</span>
                          </div>
                        </div>
                        <div v-else-if="section.type === 'description'" class="description-section">
                          <p>{{ section.content }}</p>
                        </div>
                        <div v-else class="text-section">
                          {{ section.content }}
                        </div>
                      </div>
                    </div>
                    <div v-else class="simple-response" v-html="msg.content.replace(/\n/g, '<br>')"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 加载指示器 -->
            <div v-if="chatLoading" class="message ai">
              <div class="message-content">
                <div class="ai-message">
                  <div class="ai-label">AI 回复</div>
                  <div class="ai-content">
                    <a-spin size="small" /> 正在生成...
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 输入框 -->
          <div class="input-section">
            <div class="input-container">
              <a-textarea
                v-model:value="currentMessage"
                placeholder="请描述您想要的修改，可以一步一步地完善您的网站"
                :rows="3"
                :disabled="chatLoading"
                @keypress="handleKeyPress"
                class="message-input"
              />
              <div class="input-actions">
                <a-button type="text" size="small">
                  <template #icon>📎</template>
                  上传
                </a-button>
                <a-button type="text" size="small">
                  <template #icon>🎤</template>
                  语音
                </a-button>
                <a-button type="text" size="small">
                  ✨ 优化
                </a-button>
                <a-button 
                  type="primary" 
                  :loading="chatLoading"
                  @click="sendMessage(currentMessage)"
                  :disabled="!currentMessage.trim()"
                  class="send-btn"
                >
                  <template #icon>↗</template>
                </a-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧网页展示区域 -->
        <div class="preview-section">
          <div class="preview-header">
            <span class="preview-title">生成的网页展示</span>
          </div>
          
          <div class="preview-content">
            <div v-if="!showWebsite" class="preview-placeholder">
              <div class="placeholder-content">
                <div class="placeholder-icon">🌐</div>
                <p>网站生成完成后将在此处展示</p>
              </div>
            </div>
            
            <iframe 
              v-else
              :src="websiteUrl"
              class="preview-iframe"
              frameborder="0"
            ></iframe>
          </div>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<style scoped>
.app-chat-page {
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

/* 顶部栏 */
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-btn {
  font-size: 18px;
  padding: 4px 8px;
}

.app-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #262626;
}

/* 主要内容区域 */
.chat-content {
  flex: 1;
  display: flex;
  gap: 24px;
  min-height: 0;
}

/* 左侧对话区域 */
.chat-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

.chat-title {
  padding: 16px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
  font-weight: 600;
  color: #262626;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: white;
}

.message {
  margin-bottom: 16px;
}

.message.user {
  display: flex;
  justify-content: flex-end;
}

.message.ai {
  display: flex;
  justify-content: flex-start;
}

.message-content {
  max-width: 80%;
}

.user-message {
  background: #1890ff;
  color: white;
  padding: 12px 16px;
  border-radius: 18px 18px 4px 18px;
  word-wrap: break-word;
}

.ai-message {
  background: #f5f5f5;
  padding: 12px 16px;
  border-radius: 18px 18px 18px 4px;
  border: 1px solid #e8e8e8;
}

.ai-label {
  font-size: 12px;
  color: #1890ff;
  margin-bottom: 8px;
  font-weight: 600;
}

.ai-content {
  color: #262626;
  line-height: 1.6;
  word-wrap: break-word;
}

/* 结构化响应样式 */
.structured-response {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.step-section {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 12px;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #495057;
  margin-bottom: 8px;
}

.step-icon {
  font-size: 16px;
}

.step-content {
  color: #6c757d;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-line;
}

.file-section {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 6px;
  padding: 8px 12px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-icon {
  font-size: 16px;
}

.file-name {
  font-weight: 600;
  color: #856404;
}

.file-path {
  color: #6c757d;
  font-size: 12px;
}

.description-section {
  background: #d1ecf1;
  border: 1px solid #bee5eb;
  border-radius: 6px;
  padding: 12px;
}

.description-section p {
  margin: 0;
  color: #0c5460;
}

.text-section {
  color: #495057;
  line-height: 1.5;
  white-space: pre-line;
}

/* 输入区域 */
.input-section {
  border-top: 1px solid #f0f0f0;
  padding: 16px;
  background: white;
}

.input-container {
  position: relative;
}

.message-input {
  border-radius: 8px;
  border: 1px solid #d9d9d9;
  padding: 12px 60px 12px 12px;
  resize: none;
}

.input-actions {
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  align-items: center;
}

.send-btn {
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

/* 右侧预览区域 */
.preview-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

.preview-header {
  padding: 16px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
  text-align: center;
}

.preview-title {
  font-weight: 600;
  color: #262626;
}

.preview-content {
  flex: 1;
  position: relative;
  background: white;
}

.preview-placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-content {
  text-align: center;
  color: #8c8c8c;
}

.placeholder-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .chat-content {
    flex-direction: column;
  }
  
  .preview-section {
    height: 400px;
  }
}

@media (max-width: 768px) {
  .chat-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .app-title {
    font-size: 18px;
  }
  
  .message-content {
    max-width: 90%;
  }
}
</style>