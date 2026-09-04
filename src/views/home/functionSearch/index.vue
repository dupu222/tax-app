<template>
  <NavbarPage label="搜索">
    <div class="search-page">
      <van-search v-model="keyword" placeholder="请输入想搜索的功能/服务" autofocus />
      <div v-if="filtered.length" class="result-list">
        <div v-for="item in filtered" :key="item.title" class="result-item" @click="goItem(item)">
          <span>{{ item.title }}</span>
          <van-icon name="arrow" />
        </div>
      </div>
      <van-empty v-else description="未找到相关功能" />
    </div>
  </NavbarPage>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { SEARCH_FUNCTIONS } from '@/views/tabbar/home/home-data';

const router = useRouter();
const keyword = ref('');

const filtered = computed(() => {
  const key = keyword.value.trim();
  if (!key) return SEARCH_FUNCTIONS;
  return SEARCH_FUNCTIONS.filter((item) => item.title.includes(key));
});

const goItem = (item) => {
  if (item.routeName === 'EmptyPage') {
    router.push({ name: 'EmptyPage', query: { title: item.title } });
    return;
  }
  router.push({ name: item.routeName });
};
</script>

<style scoped lang="scss">
.search-page {
  min-height: 100%;
  background: #f3f7fc;
}

.result-list {
  margin: 8px 12px;
  overflow: hidden;
  background: #fff;
  border-radius: 12px;
}

.result-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  color: #1f2937;
  font-size: 15px;
  border-bottom: 1px solid #f3f4f6;

  &:last-child {
    border-bottom: 0;
  }

  .van-icon {
    color: #c0c4cc;
  }
}
</style>
