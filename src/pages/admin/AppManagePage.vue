<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { 
  listAppVoByPageByAdmin, 
  deleteAppByAdmin, 
  updateAppByAdmin,
  getAppVoByIdByAdmin 
} from '@/api/appController'
import { useLoginUserStore } from '@/stores/loginUser'

const router = useRouter()
const loginUserStore = useLoginUserStore()

// 表格数据
const apps = ref<API.AppVO[]>([])
const loading = ref(false)
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  pageSizeOptions: ['10', '20', '50', '100']
})

// 搜索表单
const searchForm = ref({
  appName: '',
  userId: undefined as number | undefined,
  codeGenType: '',
  priority: undefined as number | undefined
})

// 编辑模态框
const editModalVisible = ref(false)
const editForm = ref({
  id: '' as string | number,
  appName: '',
  cover: '',
  priority: 0
})
const editLoading = ref(false)

// 表格列定义
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 80,
  },
  {
    title: '应用名称',
    dataIndex: 'appName',
    key: 'appName',
    ellipsis: true,
  },
  {
    title: '创建者',
    dataIndex: ['user', 'userName'],
    key: 'userName',
    width: 120,
  },
  {
    title: '应用类型',
    dataIndex: 'codeGenType',
    key: 'codeGenType',
    width: 100,
  },
  {
    title: '优先级',
    dataIndex: 'priority',
    key: 'priority',
    width: 80,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 180,
    customRender: ({ text }: { text: string }) => {
      return new Date(text).toLocaleString()
    }
  },
  {
    title: '部署状态',
    key: 'deployStatus',
    width: 100,
    customRender: ({ record }: { record: API.AppVO }) => {
      return record.deployedTime ? '已部署' : '未部署'
    }
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
    fixed: 'right' as const,
  },
]

// 加载应用列表
const loadApps = async (page = 1, pageSize = pagination.value.pageSize) => {
  loading.value = true
  try {
    const res = await listAppVoByPageByAdmin({
      pageNum: page,
      pageSize,
      ...searchForm.value,
      sortField: 'createTime',
      sortOrder: 'desc'
    })

    if (res.data.code === 0 && res.data.data) {
      apps.value = res.data.data.records || []
      pagination.value.total = res.data.data.totalRow || 0
      pagination.value.current = page
      pagination.value.pageSize = pageSize
    } else {
      message.error('加载失败：' + res.data.message)
    }
  } catch (error) {
    message.error('加载失败，请重试')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  loadApps(1)
}

// 重置搜索
const handleReset = () => {
  searchForm.value = {
    appName: '',
    userId: undefined,
    codeGenType: '',
    priority: undefined
  }
  loadApps(1)
}

// 分页变化
const handleTableChange = (pag: any) => {
  loadApps(pag.current, pag.pageSize)
}

// 查看详情
const viewDetail = (record: API.AppVO) => {
  router.push(`/app/detail/${record.id}`)
}

// 编辑应用
const editApp = async (record: API.AppVO) => {
  try {
    const res = await getAppVoByIdByAdmin({ id: record.id as any })
    if (res.data.code === 0 && res.data.data) {
      editForm.value = {
        id: res.data.data.id as any,
        appName: res.data.data.appName || '',
        cover: res.data.data.cover || '',
        priority: res.data.data.priority || 0
      }
      editModalVisible.value = true
    } else {
      message.error('获取应用信息失败：' + res.data.message)
    }
  } catch (error) {
    message.error('获取应用信息失败')
  }
}

// 保存编辑
const handleEditSave = async () => {
  editLoading.value = true
  try {
    const res = await updateAppByAdmin(editForm.value)
    if (res.data.code === 0) {
      message.success('更新成功')
      editModalVisible.value = false
      loadApps(pagination.value.current)
    } else {
      message.error('更新失败：' + res.data.message)
    }
  } catch (error) {
    message.error('更新失败，请重试')
  } finally {
    editLoading.value = false
  }
}

// 删除应用
const deleteApp = async (record: API.AppVO) => {
  try {
    const res = await deleteAppByAdmin({ id: record.id as any })
    if (res.data.code === 0) {
      message.success('删除成功')
      loadApps(pagination.value.current)
    } else {
      message.error('删除失败：' + res.data.message)
    }
  } catch (error) {
    message.error('删除失败，请重试')
  }
}

// 设为精选
const setFeatured = async (record: API.AppVO) => {
  try {
    const res = await updateAppByAdmin({
      id: record.id as any,
      appName: record.appName,
      cover: record.cover,
      priority: 99
    })
    if (res.data.code === 0) {
      message.success('设为精选成功')
      loadApps(pagination.value.current)
    } else {
      message.error('设为精选失败：' + res.data.message)
    }
  } catch (error) {
    message.error('设为精选失败，请重试')
  }
}

onMounted(() => {
  // 检查管理员权限
  if (loginUserStore.loginUser.userRole !== 'admin') {
    message.error('您没有权限访问此页面')
    router.push('/')
    return
  }
  
  loadApps()
})
</script>

<template>
  <div class="app-manage-page">
    <div class="page-header">
      <h1 class="page-title">应用管理</h1>
    </div>

    <!-- 搜索表单 -->
    <a-card class="search-card" title="搜索条件">
      <a-form
        :model="searchForm"
        layout="inline"
        @finish="handleSearch"
      >
        <a-form-item label="应用名称" name="appName">
          <a-input
            v-model:value="searchForm.appName"
            placeholder="请输入应用名称"
            style="width: 200px"
          />
        </a-form-item>

        <a-form-item label="用户ID" name="userId">
          <a-input-number
            v-model:value="searchForm.userId"
            placeholder="请输入用户ID"
            style="width: 200px"
          />
        </a-form-item>

        <a-form-item label="应用类型" name="codeGenType">
          <a-input
            v-model:value="searchForm.codeGenType"
            placeholder="请输入应用类型"
            style="width: 200px"
          />
        </a-form-item>

        <a-form-item label="优先级" name="priority">
          <a-input-number
            v-model:value="searchForm.priority"
            placeholder="请输入优先级"
            style="width: 200px"
          />
        </a-form-item>

        <a-form-item>
          <a-space>
            <a-button type="primary" html-type="submit">
              搜索
            </a-button>
            <a-button @click="handleReset">
              重置
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 应用列表 -->
    <a-card class="table-card" title="应用列表">
      <a-table
        :columns="columns"
        :data-source="apps"
        :loading="loading"
        :pagination="pagination"
        :scroll="{ x: 1200 }"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="viewDetail(record)">
                查看
              </a-button>
              <a-button type="link" size="small" @click="editApp(record)">
                编辑
              </a-button>
              <a-popconfirm
                title="确定要删除这个应用吗？"
                ok-text="确定"
                cancel-text="取消"
                @confirm="deleteApp(record)"
              >
                <a-button type="link" size="small" danger>
                  删除
                </a-button>
              </a-popconfirm>
              <a-popconfirm
                title="确定要设为精选吗？"
                ok-text="确定"
                cancel-text="取消"
                @confirm="setFeatured(record)"
              >
                <a-button type="link" size="small">
                  精选
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 编辑模态框 -->
    <a-modal
      v-model:open="editModalVisible"
      title="编辑应用"
      :confirm-loading="editLoading"
      @ok="handleEditSave"
    >
      <a-form
        :model="editForm"
        layout="vertical"
      >
        <a-form-item
          label="应用名称"
          name="appName"
          :rules="[{ required: true, message: '请输入应用名称' }]"
        >
          <a-input v-model:value="editForm.appName" />
        </a-form-item>

        <a-form-item label="应用封面" name="cover">
          <a-input v-model:value="editForm.cover" placeholder="请输入封面图片URL" />
        </a-form-item>

        <a-form-item
          label="优先级"
          name="priority"
          :rules="[{ required: true, message: '请输入优先级' }]"
        >
          <a-input-number
            v-model:value="editForm.priority"
            :min="0"
            :max="999"
            style="width: 100%"
          />
          <div class="form-tip">
            优先级越高，在精选列表中排序越靠前。设置为99表示精选应用。
          </div>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<style scoped>
.app-manage-page {
  padding: 0 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: #262626;
}

.search-card {
  margin-bottom: 24px;
}

.table-card {
  margin-bottom: 24px;
}

.form-tip {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 4px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-manage-page {
    padding: 0 12px;
  }
}
</style>