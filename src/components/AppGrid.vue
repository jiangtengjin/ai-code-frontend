<script setup lang="ts">
import { computed } from 'vue'
import AppCard from './AppCard.vue'

interface Props {
  apps: API.AppVO[]
  loading?: boolean
  showCreator?: boolean
  showTime?: boolean
  cardSize?: 'default' | 'large'
  pagination?: {
    current: number
    pageSize: number
    total: number
  }
  paginationText?: string
  columns?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  showCreator: true,
  showTime: true,
  cardSize: 'default',
  paginationText: '条记录',
  columns: () => ({
    xs: 1,
    sm: 2,
    md: 3,
    lg: 3,
    xl: 4
  })
})

// 定义事件
const emit = defineEmits<{
  'load-more': []
}>()

// 处理分页变化
const handlePageChange = (page: number, pageSize: number) => {
  if (props.pagination) {
    props.pagination.current = page
    props.pagination.pageSize = pageSize
  }
  emit('load-more')
}

// 计算网格样式
const gridStyle = computed(() => {
  const { columns } = props
  return {
    '--grid-cols-xs': columns.xs || 1,
    '--grid-cols-sm': columns.sm || 2,
    '--grid-cols-md': columns.md || 3,
    '--grid-cols-lg': columns.lg || 3,
    '--grid-cols-xl': columns.xl || 4,
  }
})
</script>

<template>
  <div class="app-grid-container">
    <div class="app-grid" :style="gridStyle">
      <template v-if="loading">
        <div v-for="i in 6" :key="i" class="app-card-skeleton">
          <a-skeleton-image class="skeleton-image" />
          <div class="skeleton-content">
            <a-skeleton :paragraph="{ rows: 2 }" />
          </div>
        </div>
      </template>
      
      <template v-else-if="apps.length > 0">
        <AppCard
          v-for="app in apps"
          :key="app.id"
          :app="app"
          :show-creator="showCreator"
          :show-time="showTime"
          :size="cardSize"
        />
      </template>
      
      <div v-else class="empty-state">
        <div class="empty-icon">📱</div>
        <p>暂无应用</p>
      </div>
    </div>
    
    <!-- 分页组件 -->
    <div v-if="pagination && pagination.total > 0" class="pagination-wrapper">
      <a-pagination
        :current="pagination.current"
        :page-size="pagination.pageSize"
        :total="pagination.total"
        :show-size-changer="false"
        :show-total="(total: number) => `共 ${total} ${paginationText}`"
        @change="handlePageChange"
      />
    </div>
  </div>
</template>

<style scoped>
.app-grid-container {
  display: flex;
  flex-direction: column;
  min-height: 500px; /* 设置容器最小高度 */
}

.app-grid {
  display: grid;
  grid-template-columns: repeat(var(--grid-cols-xs), 1fr);
  gap: 24px;
  flex: 1; /* 占据剩余空间 */
  align-content: start; /* 内容从顶部开始排列 */
}

@media (min-width: 576px) {
  .app-grid {
    grid-template-columns: repeat(var(--grid-cols-sm), 1fr);
  }
}

@media (min-width: 768px) {
  .app-grid {
    grid-template-columns: repeat(var(--grid-cols-md), 1fr);
  }
}

@media (min-width: 992px) {
  .app-grid {
    grid-template-columns: repeat(var(--grid-cols-lg), 1fr);
  }
}

@media (min-width: 1200px) {
  .app-grid {
    grid-template-columns: repeat(var(--grid-cols-xl), 1fr);
  }
}

.app-card-skeleton {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.skeleton-image {
  width: 100%;
  height: 180px;
}

.skeleton-content {
  padding: 16px;
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

/* 分页样式 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  flex-shrink: 0; /* 防止分页组件被压缩 */
}
</style>