<template>
  <Header>
    <div>待办</div>
  </Header>
  <div class="empty-wrap">
    <img src="@/assets/service/empty-closed.png" alt="" />
    <div class="title">暂无待办事项</div>
    <div class="desc">汇算申报、资料补正等待办会显示在这里</div>
  </div>
</template>

<script setup>
import Header from '@/components/Header/index.vue';
</script>

<style scoped lang="scss">
.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 120px;

  img {
    width: 156px;
    height: 136px;
    object-fit: contain;
  }

  .title {
    margin-top: 8px;
    color: #1f2937;
    font-size: 15px;
  }

  .desc {
    margin-top: 6px;
    color: #9aa3b2;
    font-size: 13px;
  }
}
</style>
