<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useLoginUserStore } from '@/stores/loginUser'
import { addApp, listMyAppVoByPage, listGoodAppVoByPage } from '@/api/appController'
import AppGrid from '@/components/AppGrid.vue'

const router = useRouter()
const loginUserStore = useLoginUserStore()

// 用户提示词
const userPrompt = ref('')
const creating = ref(false)

// 我的应用数据
const myApps = ref<API.AppVO[]>([])
const myAppsPage = reactive({
  current: 1,
  pageSize: 8,
  total: 0,
})

// 精选应用数据
const featuredApps = ref<API.AppVO[]>([])
const featuredAppsPage = reactive({
  current: 1,
  pageSize: 8,
  total: 0,
})

// 设置提示词
const setPrompt = (prompt: string) => {
  userPrompt.value = prompt
}

// 创建应用
const createApp = async () => {
  if (!userPrompt.value.trim()) {
    message.warning('请输入应用描述')
    return
  }

  if (!loginUserStore.loginUser.id) {
    message.warning('请先登录')
    await router.push('/user/login')
    return
  }

  creating.value = true
  try {
    const res = await addApp({
      initPrompt: userPrompt.value.trim(),
    })

    if (res.data.code === 0 && res.data.data) {
      message.success('应用创建成功')
      // 跳转到对话页面，确保ID是字符串类型
      const appId = String(res.data.data)
      await router.push(`/app/chat/${appId}`)
    } else {
      message.error('创建失败：' + res.data.message)
    }
  } catch (error) {
    console.error('创建应用失败：', error)
    message.error('创建失败，请重试')
  } finally {
    creating.value = false
  }
}

// 加载我的应用
const loadMyApps = async () => {
  if (!loginUserStore.loginUser.id) {
    return
  }

  try {
    const res = await listMyAppVoByPage({
      pageNum: myAppsPage.current,
      pageSize: myAppsPage.pageSize,
      sortField: 'createTime',
      sortOrder: 'desc',
    })

    if (res.data.code === 0 && res.data.data) {
      myApps.value = res.data.data.records || []
      myAppsPage.total = res.data.data.totalRow || 0
    }
  } catch (error) {
    console.error('加载我的应用失败：', error)
  }
}

// 加载精选应用
const loadFeaturedApps = async () => {
  try {
    const res = await listGoodAppVoByPage({
      pageNum: featuredAppsPage.current,
      pageSize: featuredAppsPage.pageSize,
      sortField: 'createTime',
      sortOrder: 'desc',
    })

    if (res.data.code === 0 && res.data.data) {
      featuredApps.value = res.data.data.records || []
      featuredAppsPage.total = res.data.data.totalRow || 0
    }
  } catch (error) {
    console.error('加载精选应用失败：', error)
  }
}

// 页面加载时获取数据
onMounted(() => {
  loadMyApps()
  loadFeaturedApps()
})
</script>

<template>
  <div id="homePage">
    <div class="container">
      <!-- 网站标题和描述 -->
      <div class="hero-section">
        <h1 class="hero-title">AI 应用生成平台</h1>
        <p class="hero-description">一句话轻松创建网站应用</p>
      </div>

      <!-- 用户提示词输入框 -->
      <div class="input-section">
        <a-textarea
          v-model:value="userPrompt"
          placeholder="帮我创建个人博客网站"
          :rows="4"
          :maxlength="1000"
          show-count
          class="prompt-input"
        />
        <div class="input-actions">
          <a-button type="primary" size="large" @click="createApp" :loading="creating">
            <template #icon>
              <span>↑</span>
            </template>
          </a-button>
        </div>
      </div>

      <!-- 快捷按钮 -->
      <div class="quick-actions">
        <a-button
          type="default"
          @click="
            setPrompt(
              '创建一个现代化的个人博客网站，包含文章列表、详情页、分类标签、搜索功能，采用简洁的卡片式设计，支持响应式布局，配色以蓝白为主，整体风格清新文艺'
            )
          "
          >个人博客网站</a-button
        >
        <a-button
          type="default"
          @click="
            setPrompt(
              '设计一个企业官网，包含首页轮播图、公司介绍、产品展示、新闻资讯、联系我们等页面，采用商务风格设计，配色以深蓝和白色为主，布局大气专业，突出企业实力和品牌形象'
            )
          "
          >企业官网</a-button
        >
        <a-button
          type="default"
          @click="
            setPrompt(
              '开发一个在线商城网站，包含商品展示、购物车、订单管理、用户中心等功能，采用现代电商设计风格，配色温暖活泼，支持商品分类筛选、搜索、收藏等功能，界面友好易用'
            )
          "
          >在线商城</a-button
        >
        <a-button
          type="default"
          @click="
            setPrompt(
              '构建一个作品展示网站，适合设计师、摄影师等创意工作者使用，包含作品集展示、个人简介、联系方式等，采用极简主义设计风格，突出作品本身，支持图片瀑布流布局'
            )
          "
          >作品展示</a-button
        >
      </div>

      <!-- 我的作品 -->
      <div class="section">
        <h2 class="section-title">我的作品</h2>
        <AppGrid
          :apps="myApps"
          :pagination="myAppsPage"
          :show-creator="false"
          pagination-text="个应用"
          @load-more="loadMyApps"
        />
      </div>

      <!-- 精选案例 -->
      <div class="section">
        <h2 class="section-title">精选案例</h2>
        <AppGrid
          :apps="featuredApps"
          :pagination="featuredAppsPage"
          :show-creator="true"
          pagination-text="个案例"
          @load-more="loadFeaturedApps"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
#homePage {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(180deg, #f8f9ff 0%, #e8ecff 30%, #dde4ff 70%, #f0f2ff 100%);
  position: relative;
  overflow-x: hidden;
}

#homePage::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 30% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 70% 80%, rgba(99, 102, 241, 0.06) 0%, transparent 50%),
    radial-gradient(circle at 20% 60%, rgba(168, 85, 247, 0.05) 0%, transparent 40%);
  pointer-events: none;
}

#homePage > * {
  position: relative;
  z-index: 1;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 英雄区域 */
.hero-section {
  text-align: center;
  padding: 80px 0 60px;
  color: #4c1d95;
}

.hero-title {
  font-size: 56px;
  font-weight: 700;
  margin: 0 0 20px;
  line-height: 1.2;
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #a855f7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  font-size: 18px;
  margin: 0;
  opacity: 0.8;
  font-weight: 400;
  color: #6b7280;
}

/* 输入区域 */
.input-section {
  position: relative;
  margin-bottom: 32px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.prompt-input {
  border-radius: 16px;
  border: 1px solid rgba(139, 92, 246, 0.2);
  font-size: 16px;
  padding: 20px 70px 20px 20px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.1);
}

.prompt-input:focus {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(139, 92, 246, 0.4);
  box-shadow: 0 8px 30px rgba(139, 92, 246, 0.15);
  transform: translateY(-2px);
}

.input-actions {
  position: absolute;
  bottom: 16px;
  right: 16px;
  display: flex;
  align-items: center;
}

/* 快捷按钮 */
.quick-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 80px;
  flex-wrap: wrap;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
}

.quick-actions .ant-btn {
  border-radius: 20px;
  padding: 10px 20px;
  height: auto;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(139, 92, 246, 0.2);
  color: #6b7280;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(139, 92, 246, 0.08);
}

.quick-actions .ant-btn:hover {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(139, 92, 246, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.12);
  color: #4c1d95;
}

/* 区域标题 */
.section {
  margin-bottom: 80px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(139, 92, 246, 0.1);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.08);
  transition: all 0.3s ease;
}

.section:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(139, 92, 246, 0.12);
}

.section-title {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 32px;
  color: #374151;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-title {
    font-size: 40px;
  }

  .hero-description {
    font-size: 18px;
  }

  .quick-actions {
    justify-content: center;
    gap: 12px;
  }

  .quick-actions .ant-btn {
    padding: 10px 18px;
    font-size: 13px;
  }

  .section {
    padding: 30px 20px;
    margin-bottom: 60px;
  }

  .section-title {
    font-size: 28px;
  }

  .prompt-input {
    padding: 20px 70px 20px 20px;
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: 60px 0 50px;
  }

  .hero-title {
    font-size: 32px;
  }

  .hero-description {
    font-size: 16px;
  }

  .container {
    padding: 15px;
  }
}
</style>
