<template>
  <NavbarPage :label="$route.query?.title">
    <div class="tax-preference">
      <div class="empty fcc-c">
        <img src="@/assets/service/empty-closed.png" alt="" />
        <div class="text">页面空空如也</div>
      </div>
    </div>
  </NavbarPage>
</template>

<script setup></script>

<style scoped lang="scss">
.tax-preference {
  position: relative;
  height: 100%;
  .empty {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -100%);
    img {
      width: 156px;
      height: 136px;
      object-fit: contain;
    }
    .text {
      margin-top: 6px;
      font-size: 15px;
    }
  }
}
</style>
