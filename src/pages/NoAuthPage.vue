<template>
  <div class="no-auth-container">
    <!-- <img src="@/assets/no-auth.png" alt="无权限" class="no-auth-img" /> -->
    <h2 class="no-auth-code">401</h2>
    <h2>无权限访问</h2>

    <p>您没有权限访问该页面，请联系管理员获取权限。</p>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.no-auth-container {
  text-align: center;
  padding: 60px 20px;
}
.no-auth-code {
  font-size: 72px;
  font-weight: bold;
  color: #ff4d4f;
  margin-bottom: 12px;
  letter-spacing: 8px;
}
h2 {
  color: #ff4d4f;
  margin-bottom: 12px;
}
p {
  color: #888;
  margin-bottom: 24px;
}
</style>
