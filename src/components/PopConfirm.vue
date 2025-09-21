<template>
  <a-popconfirm
    :title="title"
    :ok-text="okText"
    :cancel-text="cancelText"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  >
    <slot>
      <a href="#">操作</a>
    </slot>
  </a-popconfirm>
</template>

<script lang="ts" setup>
import { message } from 'ant-design-vue'
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: '确定要执行此操作吗？',
  },
  okText: {
    type: String,
    default: '确定',
  },
  cancelText: {
    type: String,
    default: '取消',
  },
  successMsg: {
    type: String,
    default: '操作已确认',
  },
  cancelMsg: {
    type: String,
    default: '操作已取消',
  },
})

const emits = defineEmits(['confirm', 'cancel'])

const handleConfirm = (e: MouseEvent) => {
  message.success(props.successMsg)
  emits('confirm', e)
}

const handleCancel = (e: MouseEvent) => {
  message.error(props.cancelMsg)
  emits('cancel', e)
}
</script>
