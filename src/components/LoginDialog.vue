<template>
  <el-dialog
    v-model="dialogVisible"
    title="登录"
    width="400px"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <el-form
      :model="loginForm"
      ref="formRef"
      :rules="rules"
      label-width="80px"
      @keyup.enter="handleSubmit"
    >
      <el-form-item label="用户名" prop="username">
        <el-input
          v-model="loginForm.username"
          placeholder="请输入用户名"
          :prefix-icon="User"
        />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input
          v-model="loginForm.password"
          type="password"
          placeholder="请输入密码"
          :prefix-icon="Lock"
          show-password
        />
      </el-form-item>
      <el-form-item>
        <el-checkbox v-model="loginForm.rememberMe">记住我</el-checkbox>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="loading">
        登录
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import { User, Lock } from "@element-plus/icons-vue";
// import type { FormInstance, FormRules } from 'element-plus'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["update:visible"]);

// 表单ref
const formRef = ref();
// 加载状态
const loading = ref(false);
// 控制对话框显示
const dialogVisible = ref(props.visible);

// 表单数据
const loginForm = reactive({
  username: "",
  password: "",
  rememberMe: false,
});

// 表单验证规则
const rules =
  reactive <
  FormRules >
  {
    username: [
      { required: true, message: "请输入用户名", trigger: "blur" },
      {
        min: 3,
        max: 20,
        message: "长度在 3 到 20 个字符之间",
        trigger: "blur",
      },
    ],
    password: [
      { required: true, message: "请输入密码", trigger: "blur" },
      {
        min: 6,
        max: 20,
        message: "长度在 6 到 20 个字符之间",
        trigger: "blur",
      },
    ],
  };

// 监听visible属性变化
watch(
  () => props.visible,
  (newVal) => {
    dialogVisible.value = newVal;
  }
);

// 监听对话框关闭
watch(dialogVisible, (newVal) => {
  emit("update:visible", newVal);
  if (!newVal) {
    // 重置表单
    formRef.value?.resetFields();
  }
});

// 取消按钮处理
const handleCancel = () => {
  dialogVisible.value = false;
};

// 提交表单处理
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    loading.value = true;
    await formRef.value.validate();

    // TODO: 实现登录逻辑
    console.log("表单数据:", loginForm);

    dialogVisible.value = false;
  } catch (error) {
    console.error("表单验证失败:", error);
  } finally {
    loading.value = false;
  }
};
</script>