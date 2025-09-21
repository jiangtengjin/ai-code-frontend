<template>
  <a-modal
    v-model:open="props.visible"
    :title="props.title"
    :confirm-loading="props.loading"
    @ok="onOk"
    @cancel="onCancel"
  >
    <a-form :model="form" label-col="{ span: 5 }" wrapper-col="{ span: 16 }">
      <template v-for="field in fields" :key="field.prop">
        <a-form-item :label="field.label" :name="field.prop">
          <template v-if="field.type === 'input'">
            <a-input v-model:value="form[field.prop]" />
          </template>
          <template v-else-if="field.type === 'select'">
            <a-select v-model:value="form[field.prop]">
              <a-select-option v-for="opt in field.options" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </a-select-option>
            </a-select>
          </template>
        </a-form-item>
      </template>
    </a-form>
  </a-modal>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  visible: Boolean,
  title: String,
  loading: Boolean,
  form: Object,
  fields: Array,
})

const emits = defineEmits(['update:visible', 'ok', 'cancel'])

const onOk = () => {
  emits('ok')
}
const onCancel = () => {
  emits('update:visible', false)
  emits('cancel')
}
</script>
