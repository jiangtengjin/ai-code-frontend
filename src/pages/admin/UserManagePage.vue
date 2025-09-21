<template>
  <div id="userManagePage">
    <!-- 搜索表单 -->
    <a-form layout="inline" :model="searchParams" @finish="doSearch">
      <a-form-item label="账号">
        <a-input v-model:value="searchParams.userAccount" placeholder="输入账号" />
      </a-form-item>
      <a-form-item label="用户名">
        <a-input v-model:value="searchParams.userName" placeholder="输入用户名" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">搜索</a-button>
      </a-form-item>
    </a-form>
    <a-divider />
    <!-- 表格 -->
    <a-table
      :columns="columns"
      :data-source="data"
      :pagination="pagination"
      @change="doTableChange"
    >
      <template #headerCell="{ column }">
        <template v-if="column.key === 'name'">
          <span>
            <smile-outlined />
            Name
          </span>
        </template>
      </template>

      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'userAvatar'">
          <a-image :src="record.userAvatar" :width="120" />
        </template>
        <template v-else-if="column.dataIndex === 'userRole'">
          <div v-if="record.userRole === 'admin'">
            <a-tag color="green">管理员</a-tag>
          </div>
          <div v-else>
            <a-tag color="blue">普通用户</a-tag>
          </div>
        </template>
        <template v-else-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button type="primary" @click="openEditModal(record)">编辑</a-button>
            <!-- 使用 PopConfirm 组件进行删除确认 -->
            <PopConfirm
              title="确定要删除此用户吗？"
              okText="是"
              cancelText="否"
              @confirm="doDelete(record.id)"
            >
              <a-button danger>删除</a-button>
            </PopConfirm>
          </a-space>
        </template>
      </template>
    </a-table>
    <!-- 编辑用户对话框 -->
    <a-modal
      v-model:open="editModalVisible"
      title="编辑用户"
      @ok="handleEditOk"
      @cancel="handleEditCancel"
      :confirm-loading="editLoading"
    >
      <a-divider />
      <a-form :model="editForm" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-form-item label="用户名" name="userName">
          <a-input v-model:value="editForm.userName" />
        </a-form-item>
        <a-form-item label="头像" name="userAvatar">
          <a-upload
            v-model:value="editForm.userAvatar"
            name="avatar"
            list-type="picture-card"
            @change="handleChange"
          >
            <img v-if="editForm.userAvatar" :src="editForm.userAvatar" alt="avatar" />
            <div v-else>
              <loading-outlined v-if="loading"></loading-outlined>
              <plus-outlined v-else></plus-outlined>
              <div class="ant-upload-text">上传头像</div>
            </div>
          </a-upload>
        </a-form-item>
        <a-form-item label="简介" name="userProfile">
          <a-input v-model:value="editForm.userProfile" />
        </a-form-item>
        <a-form-item label="角色" name="userRole">
          <a-select v-model:value="editForm.userRole">
            <a-select-option value="admin">管理员</a-select-option>
            <a-select-option value="user">普通用户</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import { listUserVoByPage, deleteUser, updateUser } from '@/api/userController.ts'
import PopConfirm from '@/components/PopConfirm.vue'
import dayjs from 'dayjs'

const columns = [
  {
    title: 'id',
    dataIndex: 'id',
  },
  {
    title: '账号',
    dataIndex: 'userAccount',
  },
  {
    title: '用户名',
    dataIndex: 'userName',
  },
  {
    title: '头像',
    dataIndex: 'userAvatar',
  },
  {
    title: '简介',
    dataIndex: 'userProfile',
  },
  {
    title: '用户角色',
    dataIndex: 'userRole',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
  },
  {
    title: '操作',
    key: 'action',
  },
]

const loading = ref<boolean>(false)
const labelCol = { style: { width: '50px' } }
const wrapperCol = { span: 20 }

// 数据
const data = ref<API.UserVO[]>([])
const total = ref(0)

// 搜索条件
const searchParams = reactive<API.UserQueryRequest>({
  pageNum: 1,
  pageSize: 10,
})

// 分页参数
const pagination = computed(() => {
  return {
    current: searchParams.pageNum ?? 1,
    pageSize: searchParams.pageSize ?? 10,
    total: total.value,
    showSizeChanger: true,
    showTotal: (total: number) => `共 ${total} 条`,
  }
})

// 表格变化处理
const doTableChange = (page: any) => {
  searchParams.pageNum = page.current
  searchParams.pageSize = page.pageSize
  fetchData()
}

// 获取数据
const fetchData = async () => {
  const res = await listUserVoByPage({
    ...searchParams,
  })
  if (res.data.data) {
    data.value = res.data.data.records ?? []
    total.value = res.data.data.totalRow ?? 0
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
}

// 获取数据
const doSearch = () => {
  // 重置页码
  searchParams.pageNum = 1
  fetchData()
}

// 删除数据
const doDelete = async (id: string) => {
  if (!id) {
    return
  }
  const res = await deleteUser({ id })
  if (res.data.code === 0) {
    message.success('删除成功')
    // 刷新数据
    fetchData()
  } else {
    message.error('删除失败')
  }
}

// 编辑相关
const editModalVisible = ref<boolean>(false)
const editLoading = ref<boolean>(false)
const editForm = reactive<API.UserUpdateRequest>({
  id: '',
  userName: '',
  userAvatar: '',
  userProfile: '',
  userRole: '',
})

const openEditModal = (record: any) => {
  editForm.id = record.id
  editForm.userName = record.userName
  editForm.userAvatar = record.userAvatar
  editForm.userProfile = record.userProfile
  editForm.userRole = record.userRole
  editModalVisible.value = true
}

const handleEditOk = async () => {
  editLoading.value = true
  const res = await updateUser({ ...editForm })
  editLoading.value = false
  if (res.data.code === 0) {
    message.success('编辑成功')
    editModalVisible.value = false
    fetchData()
  } else {
    message.error('编辑失败，' + res.data.message)
  }
}

const handleEditCancel = () => {
  editModalVisible.value = false
}

// 上传头像
const handleChange = (info: any) => {
  message.warning('上传头像功能暂未实现')
}

// 页面加载时请求一次
onMounted(() => {
  fetchData()
})
</script>

