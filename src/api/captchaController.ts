// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 此处后端没有提供注释 GET /captcha/image/code */
export async function getCode(options?: { [key: string]: any }) {
  return request<API.BaseResponseImageCodeVO>('/captcha/image/code', {
    method: 'GET',
    ...(options || {}),
  })
}
