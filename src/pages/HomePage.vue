<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { addApp, listMyAppVoByPage, listGoodAppVoByPage } from '@/api/appController'
import { useLoginUserStore } from '@/stores/loginUser'

const router = useRouter()
const loginUserStore = useLoginUserStore()

// 表单数据
const promptForm = ref({
  initPrompt: ''
})

// 我的应用列表
const myApps = ref<API.AppVO[]>([])
const myAppsLoading = ref(false)
const myAppsPagination = ref({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: false,
  showQuickJumper: true,
})

// 精选应用列表
const goodApps = ref<API.AppVO[]>([])
const goodAppsLoading = ref(false)
const goodAppsPagination = ref({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: false,
  showQuickJumper: true,
})

// 搜索关键词
const myAppsSearchText = ref('')
const goodAppsSearchText = ref('')

// 创建应用
const createApp = async () => {
  if (!promptForm.value.initPrompt.trim()) {
    message.error('请输入应用描述')
    return
  }

  if (!loginUserStore.loginUser.id) {
    message.error('请先登录')
    router.push('/user/login')
    return
  }

  try {
    const res = await addApp({
      initPrompt: promptForm.value.initPrompt
    })
    
    if (res.data.code === 0 && res.data.data) {
      message.success('应用创建成功')
      // 跳转到对话页面
      router.push(`/app/chat/${res.data.data}`)
    } else {
      message.error('创建失败：' + res.data.message)
    }
  } catch (error) {
    message.error('创建失败，请重试')
  }
}

// 加载我的应用
const loadMyApps = async (page = 1, searchText = '') => {
  if (!loginUserStore.loginUser.id) {
    return
  }

  myAppsLoading.value = true
  try {
    const res = await listMyAppVoByPage({
      pageNum: page,
      pageSize: myAppsPagination.value.pageSize,
      appName: searchText,
      sortField: 'createTime',
      sortOrder: 'desc'
    })

    if (res.data.code === 0 && res.data.data) {
      myApps.value = res.data.data.records || []
      myAppsPagination.value.total = res.data.data.totalRow || 0
      myAppsPagination.value.current = page
    }
  } catch (error) {
    message.error('加载我的应用失败')
  } finally {
    myAppsLoading.value = false
  }
}

// 加载精选应用
const loadGoodApps = async (page = 1, searchText = '') => {
  goodAppsLoading.value = true
  try {
    const res = await listGoodAppVoByPage({
      pageNum: page,
      pageSize: goodAppsPagination.value.pageSize,
      appName: searchText,
      sortField: 'priority',
      sortOrder: 'desc'
    })

    if (res.data.code === 0 && res.data.data) {
      goodApps.value = res.data.data.records || []
      goodAppsPagination.value.total = res.data.data.totalRow || 0
      goodAppsPagination.value.current = page
    }
  } catch (error) {
    message.error('加载精选应用失败')
  } finally {
    goodAppsLoading.value = false
  }
}

// 搜索我的应用
const searchMyApps = () => {
  loadMyApps(1, myAppsSearchText.value)
}

// 搜索精选应用
const searchGoodApps = () => {
  loadGoodApps(1, goodAppsSearchText.value)
}

// 分页变化处理
const handleMyAppsPageChange = (page: number) => {
  loadMyApps(page, myAppsSearchText.value)
}

const handleGoodAppsPageChange = (page: number) => {
  loadGoodApps(page, goodAppsSearchText.value)
}

// 查看应用详情
const viewApp = (app: API.AppVO) => {
  router.push(`/app/detail/${app.id}`)
}

// 进入对话页面
const chatWithApp = (app: API.AppVO) => {
  router.push(`/app/chat/${app.id}`)
}

onMounted(() => {
  loadMyApps()
  loadGoodApps()
})
</script>

<template>
  <div class="home-page">
    <!-- 网站标题和描述 -->
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="title-main">一句话</span>
          <span class="title-icon">🤖</span>
          <span class="title-main">呈所想</span>
        </h1>
        <p class="hero-subtitle">与 AI 对话轻松创建应用和网站</p>
      </div>
    </div>

    <!-- 用户提示词输入框 -->
    <div class="prompt-section">
      <div class="prompt-container">
        <a-textarea
          v-model:value="promptForm.initPrompt"
          placeholder="使用 NoCode 创建一个高效的小工具，帮我计算......"
          :rows="4"
          class="prompt-input"
        />
        <div class="prompt-actions">
          <a-button type="text" size="small">
            <template #icon>
              <span>📎</span>
            </template>
            上传
          </a-button>
          <a-button type="text" size="small">
            <template #icon>
              <span>✨</span>
            </template>
            优化
          </a-button>
          <a-button 
            type="primary" 
            @click="createApp"
            class="create-btn"
          >
            <template #icon>
              <span>↗</span>
            </template>
          </a-button>
        </div>
      </div>
      
      <!-- 快捷标签 -->
      <div class="quick-tags">
        <a-tag 
          v-for="tag in ['波普风电商页面', '企业网站', '电商运营后台', '暗黑话题社区']" 
          :key="tag"
          @click="promptForm.initPrompt = tag"
          class="quick-tag"
        >
          {{ tag }}
        </a-tag>
      </div>
    </div>

    <!-- 我的应用 -->
    <div class="apps-section" v-if="loginUserStore.loginUser.id">
      <div class="section-header">
        <h2 class="section-title">我的作品</h2>
        <div class="section-actions">
          <a-input-search
            v-model:value="myAppsSearchText"
            placeholder="搜索应用"
            style="width: 200px"
            @search="searchMyApps"
          />
        </div>
      </div>
      
      <a-spin :spinning="myAppsLoading">
        <div class="apps-grid" v-if="myApps.length > 0">
          <div 
            v-for="app in myApps" 
            :key="app.id"
            class="app-card"
            @click="viewApp(app)"
          >
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
            <div class="app-info">
              <h3 class="app-name">{{ app.appName || '未命名应用' }}</h3>
              <p class="app-desc">{{ app.initPrompt }}</p>
              <div class="app-meta">
                <span class="create-time">创建于 {{ new Date(app.createTime || '').toLocaleDateString() }}</span>
              </div>
            </div>
            <div class="app-actions" @click.stop>
              <a-button type="primary" size="small" @click="chatWithApp(app)">
                继续创作
              </a-button>
            </div>
          </div>
        </div>
        
        <a-empty v-else description="暂无应用，快去创建一个吧！" />
        
        <div class="pagination-wrapper" v-if="myApps.length > 0">
          <a-pagination
            v-model:current="myAppsPagination.current"
            :total="myAppsPagination.total"
            :page-size="myAppsPagination.pageSize"
            :show-quick-jumper="myAppsPagination.showQuickJumper"
            @change="handleMyAppsPageChange"
          />
        </div>
      </a-spin>
    </div>

    <!-- 精选案例 -->
    <div class="apps-section">
      <div class="section-header">
        <h2 class="section-title">精选案例</h2>
        <div class="section-actions">
          <a-input-search
            v-model:value="goodAppsSearchText"
            placeholder="搜索应用"
            style="width: 200px"
            @search="searchGoodApps"
          />
        </div>
      </div>
      
      <a-spin :spinning="goodAppsLoading">
        <div class="apps-grid" v-if="goodApps.length > 0">
          <div 
            v-for="app in goodApps" 
            :key="app.id"
            class="app-card featured"
            @click="viewApp(app)"
          >
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
            <div class="app-info">
              <h3 class="app-name">{{ app.appName || '未命名应用' }}</h3>
              <p class="app-desc">{{ app.initPrompt }}</p>
              <div class="app-meta">
                <span class="author">{{ app.user?.userName || 'NoCode 官方' }}</span>
                <span class="app-type">{{ app.codeGenType || '网站' }}</span>
              </div>
            </div>
            <div class="app-actions" @click.stop>
              <a-button type="primary" size="small" @click="chatWithApp(app)">
                使用模板
              </a-button>
            </div>
          </div>
        </div>
        
        <a-empty v-else description="暂无精选应用" />
        
        <div class="pagination-wrapper" v-if="goodApps.length > 0">
          <a-pagination
            v-model:current="goodAppsPagination.current"
            :total="goodAppsPagination.total"
            :page-size="goodAppsPagination.pageSize"
            :show-quick-jumper="goodAppsPagination.showQuickJumper"
            @change="handleGoodAppsPageChange"
          />
        </div>
      </a-spin>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* 英雄区域 */
.hero-section {
  text-align: center;
  padding: 60px 0 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin: -24px -24px 40px -24px;
  border-radius: 0 0 20px 20px;
  color: white;
}

.hero-content {
  max-width: 600px;
  margin: 0 auto;
}

.hero-title {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.title-main {
  color: white;
}

.title-icon {
  font-size: 40px;
}

.hero-subtitle {
  font-size: 18px;
  opacity: 0.9;
  margin: 0;
}

/* 提示词输入区域 */
.prompt-section {
  margin-bottom: 60px;
}

.prompt-container {
  position: relative;
  max-width: 800px;
  margin: 0 auto 20px;
}

.prompt-input {
  border-radius: 12px;
  border: 2px solid #f0f0f0;
  font-size: 16px;
  padding: 16px 60px 16px 16px;
  transition: all 0.3s;
}

.prompt-input:hover,
.prompt-input:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.prompt-actions {
  position: absolute;
  bottom: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
  align-items: center;
}

.create-btn {
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.quick-tags {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.quick-tag {
  cursor: pointer;
  border-radius: 16px;
  padding: 4px 12px;
  transition: all 0.3s;
}

.quick-tag:hover {
  background: #1890ff;
  color: white;
  border-color: #1890ff;
}

/* 应用区域 */
.apps-section {
  margin-bottom: 60px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: #262626;
}

.apps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.app-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  cursor: pointer;
  border: 1px solid #f0f0f0;
}

.app-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.app-card.featured {
  border: 2px solid #1890ff;
}

.app-cover {
  height: 160px;
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
  font-size: 48px;
  color: #bfbfbf;
}

.app-info {
  padding: 16px;
}

.app-name {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #262626;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-desc {
  font-size: 14px;
  color: #8c8c8c;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.app-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #bfbfbf;
}

.app-actions {
  padding: 0 16px 16px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-title {
    font-size: 32px;
  }
  
  .apps-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .quick-tags {
    justify-content: flex-start;
  }
}
</style>
