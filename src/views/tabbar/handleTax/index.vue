<template>
  <Header>
    <div>办&amp;查</div>
  </Header>
  <div class="page-body">
    <div v-for="(item, index) in sortList" :key="`${item.type}-${item.modeClassify}-${index}`" class="main">
      <div class="main-title">
        <div class="main-line"></div>
        <div class="main-text">{{ item.modeClassify }}</div>
      </div>
      <div class="main-sort">
        <div
          v-for="val in item.list"
          :key="`${item.modeClassify}-${val.sortOrder}`"
          class="sort-box"
          @click="goPage(item, val)"
        >
          <img class="sort-logo" :src="val.icon" alt="" />
          <div class="sort-text">{{ val.title }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Header from '@/components/Header/index.vue';
import { usePublicStore } from '@/store/modules/public';

const router = useRouter();
const sortList = ref([]);
const publicStore = usePublicStore();

const sortInit = async () => {
  const tax = await publicStore.action_tax_icons({ type: 2 });
  const query = await publicStore.action_tax_icons({ type: 3 });
  sortList.value = [...(tax || []), ...(query || [])];
};
sortInit();

const goPage = (item, val) => {
  let routerName = '';
  const titleName = val.title;
  switch (item.modeClassify) {
    case '证明开具':
      routerName = val.sortOrder === '1' ? 'HtRecordsOpener' : 'EmptyPage';
      break;
    case '申报信息查询':
      if (val.sortOrder === '1') {
        routerName = 'DeclarationQuery';
      } else if (val.sortOrder === '3') {
        routerName = 'TaxDeatilsSearch';
      } else {
        routerName = 'EmptyPage';
      }
      break;
    default:
      routerName = 'EmptyPage';
      break;
  }
  const routerInfo = {
    name: routerName || '',
  };
  if (routerName === 'BlankLoading' || routerName === 'EmptyPage') routerInfo.query = { title: titleName };
  router.push(routerInfo);
};
</script>

<style scoped lang="scss">
.page-body {
  padding-bottom: 16px;
}

.main {
  margin-bottom: 11px;
  background-color: #fff;

  .main-title {
    display: flex;
    align-items: center;
    padding: 12px;
    border-bottom: 1px solid rgba(238, 237, 237, 0.6);

    .main-line {
      width: 4px;
      height: 17px;
      margin-right: 9px;
      background: #4981ff;
      border-radius: 466px;
    }

    .main-text {
      color: #282828;
      font-size: 14px;
      font-weight: bold;
      letter-spacing: 0.08em;
    }
  }

  .main-sort {
    display: flex;
    flex-wrap: wrap;
    height: 100%;
    padding: 20px 0 10px;

    .sort-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 33.33%;

      .sort-logo {
        width: 48px;
        height: 48px;
        margin-bottom: 6px;
        object-fit: contain;
      }

      .sort-text {
        width: 77px;
        height: 33px;
        margin-bottom: 14px;
        color: #3d3d3d;
        font-size: 12px;
        line-height: 17px;
        text-align: center;
      }
    }
  }
}
</style>
