<template>
  <h1>home</h1>
  <span>{{ user.token }}</span>
</template>


<script setup>
import { useUserStore } from "@/store/user.js";
const user = useUserStore();
</script>