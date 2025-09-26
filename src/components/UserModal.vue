<template>
  <a-modal
    v-model:open="visible"
    :title="isEdit ? '编辑用户' : '添加用户'"
    @ok="handleSubmit"
    @cancel="handleCancel"
    :confirm-loading="submitting"
    :width="600"
  >
    <a-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      layout="vertical"
    >
      <a-form-item label="用户名" name="userName">
        <a-input v-model:value="formData.userName" placeholder="请输入用户名" />
      </a-form-item>
      <a-form-item v-if="!isEdit" label="账号" name="userAccount">
        <a-input v-model:value="formData.userAccount" placeholder="请输入账号" />
      </a-form-item>
      <a-form-item label="头像" name="userAvatar">
        <a-input v-model:value="formData.userAvatar" placeholder="请输入头像URL" />
      </a-form-item>
      <a-form-item label="简介" name="userProfile">
        <a-textarea v-model:value="formData.userProfile" placeholder="请输入用户简介" :rows="3" />
      </a-form-item>
      <a-form-item label="用户角色" name="userRole">
        <a-select v-model:value="formData.userRole" placeholder="请选择用户角色">
          <a-select-option value="user">普通用户</a-select-option>
          <a-select-option value="admin">管理员</a-select-option>
        </a-select>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { message } from 'ant-design-vue'
import { addUser, updateUser } from '@/api/userController'
import type { FormInstance } from 'ant-design-vue'

interface Props {
  open: boolean
  isEdit: boolean
  userData?: API.UserVO
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  isEdit: false,
  userData: undefined
})

const emit = defineEmits<Emits>()

const visible = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()

// 表单数据
const formData = reactive<API.UserAddRequest & { id?: number }>({
  userName: '',
  userAccount: '',
  userAvatar: '',
  userProfile: '',
  userRole: 'user',
})

// 表单验证规则
const formRules = {
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  userAccount: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 4, max: 16, message: '账号长度在 4 到 16 个字符', trigger: 'blur' }
  ],
  userRole: [
    { required: true, message: '请选择用户角色', trigger: 'change' }
  ]
}

// 监听 open 属性变化
watch(() => props.open, (newVal) => {
  visible.value = newVal
  if (newVal) {
    if (props.isEdit && props.userData) {
      // 编辑模式，填充数据
      formData.id = props.userData.id
      formData.userName = props.userData.userName || ''
      formData.userAccount = props.userData.userAccount || ''
      formData.userAvatar = props.userData.userAvatar || ''
      formData.userProfile = props.userData.userProfile || ''
      formData.userRole = props.userData.userRole || 'user'
    } else {
      // 添加模式，重置表单
      resetForm()
    }
  }
})

// 监听 visible 变化，同步到父组件
watch(visible, (newVal) => {
  emit('update:open', newVal)
})

// 重置表单
const resetForm = () => {
  formData.id = undefined
  formData.userName = ''
  formData.userAccount = ''
  formData.userAvatar = ''
  formData.userProfile = ''
  formData.userRole = 'user'
}

// 处理表单提交
const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    submitting.value = true
    
    let res
    if (props.isEdit) {
      // 编辑用户（不包含账号）
      res = await updateUser({
        id: formData.id,
        userName: formData.userName,
        userAvatar: formData.userAvatar,
        userProfile: formData.userProfile,
        userRole: formData.userRole,
      })
    } else {
      // 添加用户
      res = await addUser({
        userName: formData.userName,
        userAccount: formData.userAccount,
        userAvatar: formData.userAvatar,
        userProfile: formData.userProfile,
        userRole: formData.userRole,
      })
    }
    
    if (res.data.code === 0) {
      message.success(props.isEdit ? '编辑成功' : '添加成功')
      visible.value = false
      emit('success')
    } else {
      message.error(res.data.message || (props.isEdit ? '编辑失败' : '添加失败'))
    }
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    submitting.value = false
  }
}

// 取消对话框
const handleCancel = () => {
  visible.value = false
  formRef.value?.resetFields()
}
</script>