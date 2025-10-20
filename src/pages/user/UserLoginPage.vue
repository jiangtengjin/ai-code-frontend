<template>
  <div id="userLoginPage">
    <h2 class="title">AI 应用生成 - 用户登录</h2>
    <div class="desc">不写一行代码，生成完整应用</div>
    <a-form :model="formState" name="basic" autocomplete="off" @finish="handleSubmit">
      <a-form-item name="userAccount" :rules="[{ required: true, message: '请输入账号' }]">
        <a-input v-model:value="formState.userAccount" placeholder="请输入账号" />
      </a-form-item>
      <a-form-item
        name="userPassword"
        :rules="[
          { required: true, message: '请输入密码' },
          { min: 8, message: '密码不能小于 8 位' },
        ]"
      >
        <a-input-password v-model:value="formState.userPassword" placeholder="请输入密码" />
      </a-form-item>
      <!-- 图形验证码：输入框与图片同一行，约 7:3 比例（24 列中 17:7） -->
      <a-form-item name="imageCode" :rules="[{ required: true, message: '请输入验证码' }, { len: 6, message: '验证码错误', trigger: 'blur' }]">
        <a-row :gutter="8" align="middle">
          <a-col :span="17">
            <a-input
              v-model:value="formState.imageCode"
              placeholder="请输入验证码"
              style="width: 100%"
            />
          </a-col>
          <a-col :span="7">
            <img
              :src="captchaImg"
              alt="验证码"
              style="width: 100%; height: 36px; border: 1px solid #eee; border-radius: 4px; cursor: pointer; object-fit: cover"
              @click="onRefreshCaptcha"
            />
          </a-col>
        </a-row>
      </a-form-item>
      <div class="tips">
        没有账号？
        <RouterLink to="/user/register">去注册</RouterLink>
      </div>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%">登录</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/loginUser.ts'
import { userLogin } from '@/api/userController.ts'
import { getCode } from '@/api/captchaController.ts'
import { message } from 'ant-design-vue'
import { reactive, ref, onMounted } from 'vue'

const router = useRouter()
const loginUserStore = useLoginUserStore()

const formState = reactive<API.UserLoginRequest>({
  userAccount: '',
  userPassword: '',
  imageCode: '',
})

/**
 * 图形验证码相关状态
 */
const captchaImg = ref<string>('')
const captchaUuid = ref<string>('')
const imageCode = ref<string>('')

/**
 * 加载/刷新验证码
 */
const loadCaptcha = async () => {
  try {
    const res = await getCode()
    const data = res?.data?.data
    const code = res?.data?.code

    // 限流或未获取到数据的处理
    if (code === 42900 || !data) {
      const msg = res?.data?.message || '获取验证码过于频繁，请稍后再试'
      message.error(msg)
      return
    }

    captchaUuid.value = data?.uuid ?? ''
    // 后端返回 Base64（不含 data:image 前缀），这里补齐前缀用于显示
    captchaImg.value = data?.img ? `data:image/jpg;base64,${data.img}` : ''
  } catch (e) {
    message.error('获取验证码失败')
  }
}
const onRefreshCaptcha = () => {
  loadCaptcha()
}

// 首次进入页面时加载验证码
onMounted(() => {
  loadCaptcha()
})

/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: API.UserLoginRequest) => {
  // 将图形验证码参数并入提交体
  values.uuid = captchaUuid.value
  values.imageCode = formState.imageCode

  if (!values.uuid || !values.imageCode) {
    message.error('请完成验证码校验')
    return
  }

  const res = await userLogin(values)
  // 登录成功，把登录态保存到全局状态中
  if (res.data.code === 0 && res.data.data) {
    await loginUserStore.fetchLoginUser()
    message.success('登录成功')
    router.push({
      path: '/',
      replace: true,
    })
  } else {
    message.error('登录失败，' + res.data.message)
  }
}
</script>

<style scoped>
#userLoginPage {
  max-width: 360px;
  margin: 0 auto;
}

.title {
  text-align: center;
  margin-bottom: 16px;
}

.desc {
  text-align: center;
  color: #bbb;
  margin-bottom: 16px;
}

.tips {
  margin-bottom: 16px;
  color: #bbb;
  font-size: 13px;
  text-align: right;
}
</style>
