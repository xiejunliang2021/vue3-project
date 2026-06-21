<template>
  <div class="profile-container">
    <div class="content">
      <h1 class="page-title">个人中心</h1>

      <div class="profile-card">
        <!-- 左侧：头像与基本信息 -->
        <div class="profile-sidebar">
          <div class="avatar-wrapper">
            <el-avatar :size="100" class="scifi-avatar">
              {{ userInitials }}
            </el-avatar>
            <div class="avatar-glow"></div>
          </div>
          <h2 class="username">{{ userInfo.username }}</h2>
          <p class="role-tag">USER</p>
        </div>

        <!-- 右侧：表单区域 -->
        <div class="profile-forms">
          <el-tabs v-model="activeTab" class="scifi-tabs">
            <!-- 基本资料 -->
            <el-tab-pane label="基本资料" name="info">
              <el-form 
                ref="infoFormRef" 
                :model="infoForm" 
                :rules="infoRules" 
                label-position="top"
                class="scifi-form"
              >
                <el-form-item label="用户名 (不可修改)" prop="username">
                  <el-input v-model="infoForm.username" disabled />
                </el-form-item>
                <el-form-item label="电子邮箱" prop="email">
                  <el-input v-model="infoForm.email" placeholder="请输入电子邮箱" />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" :loading="infoLoading" @click="handleUpdateInfo" class="scifi-btn">
                    保存修改
                  </el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <!-- 修改密码 -->
            <el-tab-pane label="修改密码" name="password">
              <el-form 
                ref="pwdFormRef" 
                :model="pwdForm" 
                :rules="pwdRules" 
                label-position="top"
                class="scifi-form"
              >
                <el-form-item label="当前密码" prop="old_password">
                  <el-input 
                    v-model="pwdForm.old_password" 
                    type="password" 
                    show-password 
                    placeholder="请输入当前密码" 
                  />
                </el-form-item>
                <el-form-item label="新密码" prop="new_password">
                  <el-input 
                    v-model="pwdForm.new_password" 
                    type="password" 
                    show-password 
                    placeholder="请输入新密码" 
                  />
                </el-form-item>
                <el-form-item label="确认新密码" prop="confirm_password">
                  <el-input 
                    v-model="pwdForm.confirm_password" 
                    type="password" 
                    show-password 
                    placeholder="请再次输入新密码" 
                  />
                </el-form-item>
                <el-form-item>
                  <el-button type="danger" :loading="pwdLoading" @click="handleChangePassword" class="scifi-btn-danger">
                    修改密码
                  </el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { updateProfile, changePassword } from '@/api/modules/auth'
import { ElMessage } from 'element-plus'

const authStore = useAuthStore()
const activeTab = ref('info')

const userInfo = computed(() => authStore.currentUser || {})
const userInitials = computed(() => (userInfo.value.username || 'U').charAt(0).toUpperCase())

// 基本资料表单
const infoFormRef = ref(null)
const infoLoading = ref(false)
const infoForm = reactive({
  username: '',
  email: ''
})
const infoRules = {
  email: [{ type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }]
}

// 密码表单
const pwdFormRef = ref(null)
const pwdLoading = ref(false)
const pwdForm = reactive({
  old_password: '',
  new_password: '',
  confirm_password: ''
})
const pwdRules = {
  old_password: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
  new_password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirm_password: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== pwdForm.new_password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 初始化数据
onMounted(() => {
  if (userInfo.value) {
    infoForm.username = userInfo.value.username
    infoForm.email = userInfo.value.email || ''
  }
})

// 更新资料逻辑
const handleUpdateInfo = async () => {
  if (!infoFormRef.value) return
  
  await infoFormRef.value.validate(async (valid) => {
    if (valid) {
      infoLoading.value = true
      try {
        const res = await updateProfile({ email: infoForm.email })
        // 更新 store 中的用户信息
        authStore.user = { ...authStore.user, ...res } // 假设 API 返回更新后的用户对象
        // 如果 API 返回的结构是 { id, username, email ... }，需要根据实际情况调整
        // 这里需要确认后端返回格式，刚才后端代码返回的是 user dict
        
        // 更新 localStorage
        localStorage.setItem('user', JSON.stringify(authStore.user))
        
        ElMessage.success('资料更新成功')
      } catch (error) {
        console.error(error)
      } finally {
        infoLoading.value = false
      }
    }
  })
}

// 修改密码逻辑
const handleChangePassword = async () => {
  if (!pwdFormRef.value) return
  
  await pwdFormRef.value.validate(async (valid) => {
    if (valid) {
      pwdLoading.value = true
      try {
        await changePassword({
          old_password: pwdForm.old_password,
          new_password: pwdForm.new_password
        })
        ElMessage.success('密码修改成功，请重新登录')
        // 登出并跳转
        authStore.logout()
        // router.push('/login') // logout action usually handles redirect or state clear
        window.location.reload() // 简单粗暴，确保状态清空
      } catch (error) {
        console.error(error)
      } finally {
        pwdLoading.value = false
      }
    }
  })
}
</script>

<style scoped>
/* 引用 Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Rajdhani:wght@300;500;700&display=swap');

.profile-container {
  min-height: 100%;
  color: #e0e0e0;
  font-family: 'Rajdhani', sans-serif;
  padding: 40px 20px; /* 减少 padding-top，因为 Header 已经占据空间 */
  display: flex;
  justify-content: center;
  align-items: flex-start; /* 改为顶部对齐 */
}

.content {
  width: 100%;
  max-width: 1000px;
  /* 确保有背景色以防背景透明 */
  position: relative;
  z-index: 10;
}

.page-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 32px;
  color: #00f3ff;
  text-align: center;
  margin-bottom: 40px;
  text-shadow: 0 0 10px rgba(0, 243, 255, 0.5);
  letter-spacing: 2px;
}

.profile-card {
  display: flex;
  background: rgba(20, 20, 35, 0.8); /* 增加不透明度 */
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 243, 255, 0.2);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
  min-height: 500px;
}

.profile-sidebar {
  width: 300px;
  background: rgba(0, 0, 0, 0.2);
  border-right: 1px solid rgba(0, 243, 255, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
}

.avatar-wrapper {
  position: relative;
  margin-bottom: 20px;
}

.scifi-avatar {
  background: linear-gradient(135deg, #00f3ff, #bc13fe);
  font-family: 'Orbitron', sans-serif;
  font-size: 40px;
  color: #fff;
  border: 2px solid rgba(255, 255, 255, 0.8);
  position: relative;
  z-index: 2;
}

.avatar-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 243, 255, 0.4) 0%, transparent 70%);
  z-index: 1;
  animation: pulse 3s infinite;
}

@keyframes pulse {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
  50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.8; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
}

.username {
  font-family: 'Orbitron', sans-serif;
  font-size: 24px;
  color: #fff;
  margin-bottom: 10px;
}

.role-tag {
  background: rgba(0, 243, 255, 0.1);
  color: #00f3ff;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 14px;
  border: 1px solid rgba(0, 243, 255, 0.3);
  letter-spacing: 2px;
}

.profile-forms {
  flex: 1;
  padding: 40px;
}

/* Element Plus Customization for Sci-Fi Theme */
:deep(.el-tabs__item) {
  color: #888;
  font-family: 'Orbitron', sans-serif;
  font-size: 16px;
}

:deep(.el-tabs__item.is-active) {
  color: #00f3ff;
}

:deep(.el-tabs__active-bar) {
  background-color: #00f3ff;
  box-shadow: 0 0 10px #00f3ff;
}

:deep(.el-form-item__label) {
  color: #aaa;
  font-family: 'Rajdhani', sans-serif;
}

:deep(.el-input__wrapper) {
  background-color: rgba(0, 0, 0, 0.3);
  box-shadow: none !important;
  border: 1px solid rgba(0, 243, 255, 0.2);
  border-radius: 4px;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #00f3ff;
  box-shadow: 0 0 10px rgba(0, 243, 255, 0.2) !important;
}

:deep(.el-input__inner) {
  color: #fff;
  font-family: 'Rajdhani', sans-serif;
  letter-spacing: 1px;
}

.scifi-btn {
  width: 100%;
  background: rgba(0, 243, 255, 0.1) !important;
  border: 1px solid rgba(0, 243, 255, 0.5) !important;
  color: #00f3ff !important;
  font-family: 'Orbitron', sans-serif !important;
  letter-spacing: 2px;
  transition: all 0.3s;
  height: 40px;
  margin-top: 20px;
}

.scifi-btn:hover {
  background: rgba(0, 243, 255, 0.3) !important;
  box-shadow: 0 0 15px rgba(0, 243, 255, 0.5);
  text-shadow: 0 0 5px #00f3ff;
}

.scifi-btn-danger {
  width: 100%;
  background: rgba(255, 0, 0, 0.1) !important;
  border: 1px solid rgba(255, 0, 0, 0.5) !important;
  color: #ff4d4d !important;
  font-family: 'Orbitron', sans-serif !important;
  letter-spacing: 2px;
  transition: all 0.3s;
  height: 40px;
  margin-top: 20px;
}

.scifi-btn-danger:hover {
  background: rgba(255, 0, 0, 0.3) !important;
  box-shadow: 0 0 15px rgba(255, 0, 0, 0.5);
  text-shadow: 0 0 5px #ff4d4d;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .profile-card {
    flex-direction: column;
  }
  
  .profile-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid rgba(0, 243, 255, 0.1);
  }
}
</style>
