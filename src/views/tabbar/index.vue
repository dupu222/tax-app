<template>
  <div class="home">
    <div class="home-page">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </div>

    <div class="tabbar">
      <van-tabbar v-model="active" :fixed="false" :border="false" :safe-area-inset-bottom="false" @change="onChange">
        <van-tabbar-item v-for="item in tabbarList" :key="item.path" :name="item.path">
          <template #icon="props">
            <div class="tabbar-item">
              <img :src="props.active ? item.imgactive : item.img" alt="" />
              <div class="tabbar-item-text" :class="{ 'is-active': props.active }">{{ item.text }}</div>
            </div>
          </template>
        </van-tabbar-item>
      </van-tabbar>
    </div>
  </div>
</template>

<script setup>
import { onUpdated, ref } from 'vue';
import { useRouter } from 'vue-router';
import homeImg from '@/assets/tabbar/home.png';
import homeActiveImg from '@/assets/tabbar/home-active.png';
import todoImg from '@/assets/tabbar/todo.svg';
import todoActiveImg from '@/assets/tabbar/todo-active.svg';
import handleCheckImg from '@/assets/tabbar/handle-check.svg';
import handleCheckActiveImg from '@/assets/tabbar/handle-check-active.svg';
import messageImg from '@/assets/tabbar/message.svg';
import messageActiveImg from '@/assets/tabbar/message-active.svg';
import myImg from '@/assets/tabbar/my.png';
import myActiveImg from '@/assets/tabbar/my-active.png';

const router = useRouter();

const resolveActive = () => {
  const path = window.location.hash.substring(1) || '/home';
  if (path === '/service') return '/handle-tax';
  return path;
};

const active = ref(resolveActive());
const tabbarList = ref([
  {
    path: '/home',
    img: homeImg,
    imgactive: homeActiveImg,
    text: '首页',
  },
  {
    path: '/todo',
    img: todoImg,
    imgactive: todoActiveImg,
    text: '待办',
  },
  {
    path: '/handle-tax',
    img: handleCheckImg,
    imgactive: handleCheckActiveImg,
    text: '办&查',
  },
  {
    path: '/message',
    img: messageImg,
    imgactive: messageActiveImg,
    text: '消息',
  },
  {
    path: '/my',
    img: myImg,
    imgactive: myActiveImg,
    text: '我的',
  },
]);

const onChange = (path) => {
  router.replace(path);
};

onUpdated(() => {
  active.value = resolveActive();
});
</script>

<style scoped lang="scss">
.home {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: #f3f7fc;

  .home-page {
    flex: 1;
    width: 100%;
    overflow: overlay;
  }

  .tabbar {
    position: absolute;
    right: 12px;
    bottom: calc(10px + env(safe-area-inset-bottom, 0px));
    left: 12px;
    z-index: 40;
    height: 56px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.55);
    border: 1px solid rgba(255, 255, 255, 0.72);
    border-radius: 28px;
    box-shadow: 0 8px 24px rgba(20, 50, 90, 0.16);
    -webkit-backdrop-filter: saturate(180%) blur(22px);
    backdrop-filter: saturate(180%) blur(22px);
    isolation: isolate;

    .tabbar-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      img {
        width: 24px;
        height: 24px;
        object-fit: contain;
      }

      .tabbar-item-text {
        margin-top: 3px;
        color: #4b5563;
        font-size: 11px;
        transform: scale(0.96);
      }

      .is-active {
        color: #3d8bff;
        font-weight: 600;
      }
    }
  }
}

:deep(.van-tabbar) {
  height: 100%;
  background: transparent;
  box-shadow: none;
  --van-tabbar-background: transparent;
  --van-tabbar-item-active-background: transparent;
}

:deep(.van-tabbar::after) {
  display: none;
}

:deep(.van-tabbar--fixed) {
  position: relative;
  height: 100%;
}

:deep(.van-tabbar-item__icon) {
  margin-bottom: 0;
}

:deep(.van-tabbar-item),
:deep(.van-tabbar-item--active) {
  background: transparent;
}

:deep(.van-tabbar-item) {
  padding: 4px 0 0;
}
</style>
