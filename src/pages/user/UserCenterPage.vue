<template>
  <div id="userCenterPage">
    <a-card title="个人中心" class="user-center-card">
      <!-- 用户信息展示区域 -->
      <div class="user-info-section">
        <div class="avatar-section">
          <div class="avatar-container">
            <a-avatar :size="80" :src="userInfo.userAvatar || undefined">
              {{ userInfo.userName?.charAt(0) || 'U' }}
            </a-avatar>
            <a-button
              type="link"
              size="small"
              class="upload-avatar-btn"
              @click="handleUploadAvatar"
              disabled
            >
              上传头像（开发中）
            </a-button>
          </div>
          <div class="user-basic-info">
            <h3>{{ userInfo.userName || '未设置昵称' }}</h3>
            <p class="user-account">账号：{{ userInfo.userAccount }}</p>
            <p class="user-role">角色：{{ userInfo.userRole || '普通用户' }}</p>
          </div>
        </div>
      </div>

      <a-divider />

      <!-- 编辑用户信息表单 -->
      <div class="edit-section">
        <h4>编辑个人信息</h4>
        <a-form
          :model="formState"
          :label-col="{ span: 4 }"
          :wrapper-col="{ span: 16 }"
          @finish="handleUpdateUser"
        >
          <a-form-item label="用户账号">
            <a-input v-model:value="formState.userAccount" disabled />
          </a-form-item>

          <a-form-item
            label="用户昵称"
            name="userName"
            :rules="[{ required: true, message: '请输入用户昵称' }]"
          >
            <a-input v-model:value="formState.userName" placeholder="请输入用户昵称" />
          </a-form-item>

          <a-form-item label="用户头像" name="userAvatar">
            <a-input-group compact>
              <a-input
                v-model:value="formState.userAvatar"
                placeholder="请输入头像URL或上传头像文件"
                style="width: calc(100% - 100px)"
              />
              <a-button @click="handleUploadAvatar" disabled style="width: 100px">
                上传头像
              </a-button>
            </a-input-group>
            <div class="avatar-preview" v-if="formState.userAvatar">
              <a-avatar :size="40" :src="formState.userAvatar">
                {{ formState.userName?.charAt(0) || 'U' }}
              </a-avatar>
              <span class="preview-text">头像预览</span>
            </div>
            <div class="upload-tips">
              <a-typography-text type="secondary" style="font-size: 12px">
                支持 JPG、PNG 格式，文件大小不超过 2MB
              </a-typography-text>
            </div>
          </a-form-item>

          <a-form-item label="个人简介" name="userProfile">
            <a-textarea
              v-model:value="formState.userProfile"
              placeholder="请输入个人简介"
              :rows="4"
              :maxlength="200"
              show-count
            />
          </a-form-item>

          <a-form-item :wrapper-col="{ offset: 4, span: 16 }">
            <a-space>
              <a-button type="primary" html-type="submit" :loading="updateLoading">
                保存修改
              </a-button>
              <a-button @click="resetForm"> 重置 </a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </div>

      <a-divider />

      <!-- 密码修改区域 -->
      <div class="password-section">
        <h4>密码管理</h4>
        <a-form :label-col="{ span: 4 }" :wrapper-col="{ span: 16 }">
          <a-form-item label="当前密码">
            <a-input-password placeholder="请输入当前密码" disabled />
          </a-form-item>
          <a-form-item label="新密码">
            <a-input-password placeholder="请输入新密码" disabled />
          </a-form-item>
          <a-form-item label="确认密码">
            <a-input-password placeholder="请再次输入新密码" disabled />
          </a-form-item>
          <a-form-item :wrapper-col="{ offset: 4, span: 16 }">
            <a-button type="primary" disabled> 修改密码（功能开发中） </a-button>
          </a-form-item>
        </a-form>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, watch } from 'vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { getLoginUser, updateUser } from '@/api/userController'
import { useLoginUserStore } from '@/stores/loginUser'

// 用户信息展示 - 使用 UserVO 模型
const userInfo = ref<API.UserVO>({})
const updateLoading = ref(false)

// 表单状态 - 基于 UserVO 构造
const formState = reactive<API.UserVO>({
  id: undefined,
  userAccount: '',
  userName: '',
  userAvatar: '',
  userProfile: '',
  userRole: '',
  createTime: '',
})

// 构造更新请求对象
const buildUpdateRequest = (): API.UserUpdateRequest => {
  return {
    id: formState.id,
    userName: formState.userName,
    userAvatar: formState.userAvatar,
    userProfile: formState.userProfile,
  }
}

const router = useRouter()
const loginUserStore = useLoginUserStore()

/**
 * 检查用户登录状态
 */
const checkLoginStatus = () => {
  const currentUser = loginUserStore.loginUser
  // 检查用户是否已登录（有ID且不是默认的"未登录"状态）
  if (!currentUser.id || currentUser.userName === '未登录') {
    message.warning('请先登录后再访问用户中心')
    router.push('/user/login')
    return false
  }
  return true
}

/**
 * 获取用户信息
 */
const fetchUserInfo = async () => {
  try {
    const res = await getLoginUser()
    if (res.data.code === 0 && res.data.data) {
      const loginUserData = res.data.data
      // 转换 LoginUserVO 到 UserVO 用于展示
      userInfo.value = {
        id: loginUserData.id,
        userAccount: loginUserData.userAccount,
        userName: loginUserData.userName,
        userAvatar: loginUserData.userAvatar,
        userProfile: loginUserData.userProfile,
        userRole: loginUserData.userRole,
        createTime: loginUserData.createTime,
      }
      
      // 填充表单 - 使用 UserVO 数据
      Object.assign(formState, {
        id: userInfo.value.id,
        userAccount: userInfo.value.userAccount || '',
        userName: userInfo.value.userName || '',
        userAvatar: userInfo.value.userAvatar || '',
        userProfile: userInfo.value.userProfile || '',
        userRole: userInfo.value.userRole || '',
        createTime: userInfo.value.createTime || '',
      })
    } else {
      message.error('获取用户信息失败：' + res.data.message)
    }
  } catch (error) {
    message.error('获取用户信息失败')
    console.error('获取用户信息失败:', error)
  }
}

/**
 * 更新用户信息
 */
const handleUpdateUser = async () => {
  if (!formState.id) {
    message.error('用户ID不存在')
    return
  }

  updateLoading.value = true
  try {
    // 构造更新请求对象
    const updateRequest = buildUpdateRequest()
    const res = await updateUser(updateRequest)
    
    if (res.data.code === 0) {
      message.success('更新成功')
      // 重新获取用户信息
      await fetchUserInfo()
      // 更新全局状态
      await loginUserStore.fetchLoginUser()
    } else {
      message.error('更新失败：' + res.data.message)
    }
  } catch (error) {
    message.error('更新失败')
    console.error('更新用户信息失败:', error)
  } finally {
    updateLoading.value = false
  }
}

/**
 * 重置表单
 */
const resetForm = () => {
  // 从 UserVO 重置表单数据
  Object.assign(formState, {
    id: userInfo.value.id,
    userAccount: userInfo.value.userAccount || '',
    userName: userInfo.value.userName || '',
    userAvatar: userInfo.value.userAvatar || '',
    userProfile: userInfo.value.userProfile || '',
    userRole: userInfo.value.userRole || '',
    createTime: userInfo.value.createTime || '',
  })
  message.info('表单已重置')
}

/**
 * 上传头像（预留接口）
 */
const handleUploadAvatar = () => {
  message.info('头像上传功能正在开发中，敬请期待！')
  // TODO: 实现头像上传功能
  // 1. 打开文件选择对话框
  // 2. 验证文件格式和大小
  // 3. 调用上传接口
  // 4. 更新头像URL
}

// 组件挂载时检查登录状态并获取用户信息
onMounted(async () => {
  // 先尝试获取最新的登录用户信息
  await loginUserStore.fetchLoginUser()
  
  // 检查登录状态
  if (checkLoginStatus()) {
    await fetchUserInfo()
  }
})

// 监听登录状态变化
watch(
  () => loginUserStore.loginUser,
  (newUser) => {
    // 如果用户登出了，重定向到登录页
    if (!newUser.id || newUser.userName === '未登录') {
      message.info('登录状态已失效，请重新登录')
      router.push('/user/login')
    }
  },
  { deep: true }
)
</script>

<style scoped>
#userCenterPage {
  max-width: 800px;
  margin: 20px auto;
  padding: 0 16px;
}

.user-center-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-info-section {
  margin-bottom: 24px;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.upload-avatar-btn {
  font-size: 12px;
  padding: 0;
  height: auto;
}

.user-basic-info h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
}

.user-account,
.user-role {
  margin: 4px 0;
  color: #666;
  font-size: 14px;
}

.edit-section h4,
.password-section h4 {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.avatar-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 8px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.preview-text {
  font-size: 12px;
  color: #666;
}

.upload-tips {
  margin-top: 4px;
}

.password-section {
  background-color: #fafafa;
  padding: 16px;
  border-radius: 6px;
}

.password-section .ant-form-item {
  margin-bottom: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  #userCenterPage {
    margin: 10px;
    padding: 0 8px;
  }

  .avatar-section {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .avatar-container {
    margin-bottom: 12px;
  }

  .ant-form-item-label {
    text-align: left !important;
  }
}
</style>
