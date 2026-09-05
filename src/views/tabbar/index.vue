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
              <div class="tabbar-icon">
                <img :src="props.active ? item.imgactive : item.img" alt="" />
                <span v-if="item.badge" class="tabbar-badge">{{ item.badge > 99 ? '99+' : item.badge }}</span>
              </div>
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
import homeImg from '@/assets/tabbar/home.svg';
import homeActiveImg from '@/assets/tabbar/home-active.svg';
import todoImg from '@/assets/tabbar/todo.svg';
import todoActiveImg from '@/assets/tabbar/todo-active.svg';
import handleCheckImg from '@/assets/tabbar/handle-check.svg';
import handleCheckActiveImg from '@/assets/tabbar/handle-check-active.svg';
import messageImg from '@/assets/tabbar/message.svg';
import messageActiveImg from '@/assets/tabbar/message-active.svg';
import myImg from '@/assets/tabbar/my.svg';
import myActiveImg from '@/assets/tabbar/my-active.svg';

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
    right: 14px;
    bottom: calc(22px + env(safe-area-inset-bottom, 0px));
    left: 14px;
    z-index: 40;
    height: 66px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.72);
    border: 1px solid rgba(255, 255, 255, 0.8);
    border-radius: 33px;
    box-shadow: 0 6px 24px rgba(20, 50, 90, 0.1);
    -webkit-backdrop-filter: saturate(180%) blur(22px);
    backdrop-filter: saturate(180%) blur(22px);
    isolation: isolate;

    .tabbar-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .tabbar-icon {
        position: relative;
        width: 26px;
        height: 26px;
      }

      img {
        display: block;
        width: 26px;
        height: 26px;
        object-fit: contain;
      }

      .tabbar-badge {
        position: absolute;
        top: -7px;
        right: -11px;
        box-sizing: border-box;
        min-width: 17px;
        height: 17px;
        padding: 0 4px;
        color: #fff;
        font-size: 10px;
        font-weight: 600;
        line-height: 17px;
        text-align: center;
        background: #f04438;
        border: 1.5px solid #fff;
        border-radius: 9px;
      }

      .tabbar-item-text {
        margin-top: 5px;
        color: #2b2f36;
        font-size: 12px;
        line-height: 14px;
      }

      .is-active {
        color: #3b7ff3;
        font-weight: 500;
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
  padding: 2px 0 0;
}
</style>
