<template>
  <div id="tabbar-home" class="home-page">
    <div class="home-header">
      <div class="search-row">
        <div class="search-bar" @click="goSearch">
          <van-icon name="search" class="search-icon" />
          <span>请输入想搜索的功能/服务</span>
        </div>
        <img class="scan-icon" :src="HOME_ASSETS.scan" alt="扫一扫" @click="onScan" />
      </div>
    </div>

    <div class="ticker" @click="openPage('通知公告')">
      <img class="ticker-bell" :src="HOME_ASSETS.bell" alt="" />
      <div class="ticker-mask">
        <div class="ticker-track">
          <span>{{ NOTICE_TEXT }}</span>
          <span>{{ NOTICE_TEXT }}</span>
        </div>
      </div>
    </div>

    <div
      class="hero-card"
      :style="{ backgroundImage: `url(${HOME_ASSETS.hero})` }"
      @click="openPage('2025综合所得年度汇算')"
    >
      <div class="hero-copy">
        <div class="hero-title">2025综合所得年度汇算</div>
        <div class="hero-desc">已于6月30日结束，您可进入本专题页查看记录或补办年度汇算</div>
        <div class="hero-btn">进入专题页</div>
      </div>
    </div>

    <div class="section-head">重点服务推荐</div>
    <div class="deduct-card" :style="{ backgroundImage: `url(${HOME_ASSETS.deductBg})` }">
      <div class="deduct-top">
        <div class="deduct-name">
          <img :src="HOME_ASSETS.fire" alt="" />
          <span>专项附加扣除</span>
        </div>
        <div class="deduct-policy" @click.stop="openPage('专项附加扣除政策')">相关政策 &gt;</div>
      </div>
      <div class="deduct-tip">若符合条件，您可点击下方填报</div>
      <div class="deduct-bar">
        <div class="deduct-people">
          <img :src="HOME_ASSETS.avatarA" alt="" />
          <img :src="HOME_ASSETS.avatarB" alt="" />
          <span>超1亿人参与</span>
        </div>
        <div class="deduct-action" @click.stop="openPage('专项附加扣除填报')">我要填报</div>
      </div>
    </div>

    <div class="quick-scroll">
      <div
        v-for="card in QUICK_CARDS"
        :key="card.id"
        class="quick-card"
        :class="`quick-card--${card.tone}`"
        @click="goCard(card)"
      >
        <img :src="card.icon" alt="" />
        <div class="quick-title">{{ card.title }}</div>
        <div class="quick-desc">{{ card.desc }}</div>
        <div class="quick-action">{{ card.action }}</div>
      </div>
    </div>

    <div class="promo-banner" @click="openPage('专项附加扣除标准')">
      <div class="promo-copy">
        <div class="promo-kicker">一老一小</div>
        <div class="promo-title">三项专项附加扣除标准提高啦</div>
        <div class="promo-tags">
          <span>赡养老人</span>
          <span>3岁以下婴幼儿照护</span>
          <span>子女教育</span>
        </div>
      </div>
      <img :src="HOME_ASSETS.oldYoung" alt="" />
    </div>

    <div class="news-panel">
      <div class="news-tabs">
        <div
          v-for="tab in NEWS_TABS"
          :key="tab.key"
          class="news-tab"
          :class="{ 'news-tab--active': newsKey === tab.key }"
          @click="newsKey = tab.key"
        >
          {{ tab.label }}
        </div>
      </div>
      <div
        v-for="item in currentNews"
        :key="item.id"
        class="news-item"
        :class="{ 'news-item--left': item.side === 'left' }"
        @click="openPage(item.title)"
      >
        <div class="news-text">
          <div class="news-title">{{ item.title }}</div>
          <div class="news-date">
            <van-icon name="clock-o" />
            <span>{{ item.date }}</span>
          </div>
        </div>
        <img :src="item.image" alt="" />
      </div>
    </div>

    <div class="memory-banner" @click="openPage('2025个税记忆')">
      <div>
        <div class="memory-title">2025个税记忆</div>
        <div class="memory-desc">回顾这一年的纳税足迹</div>
      </div>
      <img :src="HOME_ASSETS.taxMemory" alt="" />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { getHotQuestion } from '@/api/home';
import { HOME_ASSETS, NEWS_MAP, NEWS_TABS, NOTICE_TEXT, QUICK_CARDS } from './home-data';

const router = useRouter();
const newsKey = ref('warning');
const newsMap = ref({ ...NEWS_MAP });

const currentNews = computed(() => newsMap.value[newsKey.value] || []);

const openPage = (title) => {
  router.push({ name: 'EmptyPage', query: { title } });
};

const goSearch = () => {
  router.push({ name: 'FunctionSearch' });
};

const onScan = () => {
  showToast('扫一扫功能即将开放');
};

const goCard = (card) => {
  if (card.routeName === 'EmptyPage') {
    router.push({ name: 'EmptyPage', query: { title: card.title } });
    return;
  }
  router.push({ name: card.routeName });
};

onMounted(async () => {
  try {
    const hotQuestion = await getHotQuestion();
    const list = hotQuestion?.result?.list || [];
    if (!list.length) return;
    newsMap.value = {
      ...newsMap.value,
      hot: list.map((item, index) => ({
        id: item.id || `hot-${index}`,
        title: item.title,
        date: item.date || '2025-03-01',
        image: '/seed/home-v2/news-hot-1.png',
        side: 'right',
      })),
    };
  } catch {
    // 首页静态资讯兜底
  }
});
</script>

<style scoped lang="scss">
.home-page {
  height: 100%;
  padding: 0 0 24px;
  overflow: auto;
  background: linear-gradient(
    180deg,
    #3e7af0 0,
    #4b82f4 48px,
    #5b92f6 96px,
    #6fa4f8 132px,
    #b7d0ff 176px,
    #f4f6fa 236px,
    #f4f6fa 100%
  );
  -webkit-overflow-scrolling: touch;
}

.home-header {
  position: sticky;
  top: 0;
  z-index: 20;
  padding: 10px 16px 8px;
  background: linear-gradient(180deg, #3e7af0 0%, #4b82f4 100%);
}

.search-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-bar {
  display: flex;
  flex: 1;
  align-items: center;
  height: 36px;
  padding: 0 14px;
  color: #9aa3b2;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.78);
  border-radius: 18px;
  box-shadow: none;

  .search-icon {
    margin-right: 8px;
    font-size: 16px;
    color: #b0b7c3;
  }
}

.scan-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

.ticker {
  display: flex;
  align-items: center;
  height: 32px;
  margin: 0 16px 12px;
  padding: 0 12px;
  overflow: hidden;
  background: #fff6dd;
  border-radius: 16px;

  .ticker-bell {
    width: 15px;
    height: 15px;
    margin-right: 8px;
    object-fit: contain;
  }
}

.ticker-mask {
  flex: 1;
  overflow: hidden;
}

.ticker-track {
  display: flex;
  gap: 48px;
  width: max-content;
  color: #e0932f;
  font-size: 13px;
  white-space: nowrap;
  animation: ticker 14s linear infinite;
}

.hero-card {
  display: flex;
  align-items: center;
  margin: 0 16px 16px;
  padding: 16px 18px 16px 16px;
  min-height: 140px;
  overflow: hidden;
  background-color: #d4e9ff;
  background-repeat: no-repeat;
  background-position: right center;
  background-size: 100% 100%;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(90, 140, 200, 0.12);
}

.hero-copy {
  position: relative;
  z-index: 1;
  flex: 1;
  max-width: 58%;
  min-width: 0;
}

.hero-title {
  color: #1f2937;
  font-size: 18px;
  font-weight: 700;
  line-height: 26px;
}

.hero-desc {
  margin: 8px 0 14px;
  color: #8b93a0;
  font-size: 12px;
  line-height: 18px;
}

.hero-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  padding: 0 20px;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  line-height: 30px;
  background: #3d8bff;
  border-radius: 999px;
}

.section-head {
  padding: 0 16px 10px;
  color: #1f2937;
  font-size: 16px;
  font-weight: 700;
}

.deduct-card {
  margin: 0 16px 14px;
  padding: 16px 14px 14px;
  overflow: hidden;
  color: #fff;
  background-color: #4ea2ff;
  background-repeat: no-repeat;
  background-position: center top;
  background-size: cover;
  border-radius: 16px;
  box-shadow: 0 10px 18px rgba(47, 124, 255, 0.22);
}

.deduct-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.deduct-name {
  display: flex;
  align-items: center;
  font-size: 15px;
  font-weight: 600;

  img {
    width: 18px;
    height: 18px;
    margin-right: 6px;
    object-fit: contain;
  }
}

.deduct-policy {
  height: 24px;
  padding: 0 10px;
  color: #fff;
  font-size: 12px;
  line-height: 24px;
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 12px;
}

.deduct-tip {
  margin: 20px 0 18px;
  font-size: 15px;
  text-align: center;
}

.deduct-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 6px 0 12px;
  background: #fff;
  border-radius: 22px;
}

.deduct-people {
  display: flex;
  align-items: center;
  color: #6b7280;
  font-size: 12px;

  img {
    width: 24px;
    height: 24px;
    object-fit: cover;
    background: #dbeafe;
    border: 1.5px solid #fff;
    border-radius: 50%;

    + img {
      margin-left: -8px;
    }
  }

  span {
    margin-left: 8px;
  }
}

.deduct-action {
  min-width: 96px;
  color: #1f2937;
  font-size: 15px;
  font-weight: 700;
  text-align: center;
  border-left: 1px solid #eef1f6;
}

.quick-scroll {
  display: flex;
  gap: 8px;
  padding: 4px 16px 16px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }
}

.quick-card {
  display: flex;
  flex: 0 0 108px;
  flex-direction: column;
  min-height: 168px;
  padding: 12px 10px 12px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 6px 16px rgba(90, 140, 200, 0.08);
  scroll-snap-align: start;

  img {
    width: 48px;
    height: 48px;
    margin-bottom: 8px;
    object-fit: contain;
    filter: drop-shadow(0 4px 6px rgba(31, 41, 55, 0.12));
  }
}

.quick-title {
  color: #1f2937;
  font-size: 14px;
  font-weight: 700;
  line-height: 20px;
}

.quick-desc {
  display: -webkit-box;
  margin-top: 4px;
  overflow: hidden;
  color: #9aa3b2;
  font-size: 11px;
  line-height: 16px;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.quick-action {
  align-self: flex-end;
  height: 24px;
  margin-top: auto;
  padding: 0 10px;
  font-size: 11px;
  line-height: 24px;
  border-radius: 12px;
}

.quick-card--blue .quick-action {
  color: #3d8bff;
  background: #e8f2ff;
}

.quick-card--purple .quick-action {
  color: #8b6cff;
  background: #f1ecff;
}

.quick-card--teal .quick-action {
  color: #14b8a6;
  background: #e7f8f5;
}

.promo-banner {
  display: flex;
  align-items: center;
  margin: 0 16px 16px;
  padding: 12px 4px 12px 16px;
  overflow: hidden;
  background: linear-gradient(90deg, #3d8bff 0%, #6cb6ff 100%);
  border-radius: 16px;

  img {
    flex-shrink: 0;
    width: 118px;
    height: 100px;
    object-fit: contain;
    object-position: right center;
    filter: drop-shadow(0 6px 10px rgba(15, 70, 160, 0.25));
  }
}

.promo-copy {
  flex: 1;
  min-width: 0;
  color: #fff;
}

.promo-kicker {
  font-size: 18px;
  font-weight: 700;
}

.promo-title {
  margin: 4px 0 8px;
  color: #ffe08a;
  font-size: 14px;
  font-weight: 700;
}

.promo-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;

  span {
    padding: 2px 6px;
    color: #fff;
    font-size: 10px;
    background: rgba(255, 255, 255, 0.18);
    border-radius: 8px;
  }
}

.news-panel {
  margin: 0 16px 16px;
}

.news-tabs {
  display: flex;
  gap: 18px;
  padding: 6px 2px 12px;
}

.news-tab {
  color: #4b5563;
  font-size: 15px;
}

.news-tab--active {
  color: #3d8bff;
  font-weight: 700;
}

.news-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  padding: 12px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 4px 12px rgba(90, 140, 200, 0.06);

  img {
    flex-shrink: 0;
    width: 96px;
    height: 70px;
    margin-left: 10px;
    object-fit: cover;
    background: #eef6ff;
    border-radius: 10px;
  }
}

.news-item--left {
  flex-direction: row-reverse;

  img {
    margin-right: 10px;
    margin-left: 0;
  }
}

.news-text {
  flex: 1;
  min-width: 0;
}

.news-title {
  color: #1f2937;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
}

.news-date {
  display: flex;
  align-items: center;
  margin-top: 10px;
  color: #9aa3b2;
  font-size: 12px;

  .van-icon {
    margin-right: 4px;
  }
}

.memory-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 16px 8px;
  padding: 10px 4px 10px 16px;
  overflow: hidden;
  background: linear-gradient(90deg, #ffe7c2 0%, #ffd18a 100%);
  border-radius: 16px;

  img {
    flex-shrink: 0;
    width: 168px;
    height: 78px;
    object-fit: contain;
    object-position: right bottom;
    filter: drop-shadow(0 2px 6px rgba(194, 65, 12, 0.12));
    mask-image: linear-gradient(90deg, transparent 0%, #000 18%, #000 100%);
    -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 18%, #000 100%);
  }
}

.memory-title {
  color: #c2410c;
  font-size: 16px;
  font-weight: 700;
}

.memory-desc {
  margin-top: 4px;
  color: #9a3412;
  font-size: 12px;
}

@keyframes ticker {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}
</style>
