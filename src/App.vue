<script setup lang="ts">
import { ref, computed, type Component, h } from "vue";
import {
  NConfigProvider,
  zhCN,
  dateZhCN,
  NButton,
  useOsTheme,
  darkTheme,
  NLayout,
  NLayoutSider,
  NLayoutHeader,
  NLayoutContent,
  NLayoutFooter,
  NIcon,
  NMenu,
  NFlex,
  NMessageProvider,
  NBreadcrumb,
  NBreadcrumbItem,
} from "naive-ui";
import {
  PhonePortraitOutline,
  Reload,
  ChevronBack,
  ChevronForward,
} from "@vicons/ionicons5";
import { devices, currentDevice, refreshDevices } from "./hooks/useDevices";
import FileList from "./components/FileList.vue";
import {
  currentPath,
  backHistory,
  canBackHistory,
  canForwardHistory,
  forwardHistory,
  pushHistory,
} from "./hooks/useRoute";
import path from "path-browserify-esm";

/** 系统当前主题 */
const osThemeRef = useOsTheme();
/** 本应用主题 */
const theme = computed(() => (osThemeRef.value === "dark" ? darkTheme : null));

/** 侧边栏是否折叠 */
const inverted = ref(false);
/** 侧边栏宽度 */
const siderWidth = 240;
/** 侧边栏折叠宽度 */
const collapsedWidth = 64;
/** 顶部栏高度 */
const headerHeight = 48;

/** 渲染图标 */
function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

const menuOptions = computed(() => [
  {
    label: "当前连接设备",
    key: "devices",
    icon: renderIcon(PhonePortraitOutline),
    children: devices.value.map((device) => ({
      label: device.name,
      key: device.id,
    })),
  },
]);
const expandedKeys = ref<string[]>(["devices"]);

refreshDevices();

const currentPathName = computed(() => path.basename(currentPath.value));
const currentPathList = computed(() =>
  currentPath.value.split("/").filter((item) => item !== ""),
);
</script>

<template>
  <NConfigProvider :locale="zhCN" :date-locale="dateZhCN" :theme="theme">
    <NMessageProvider>
      <div style="position: relative; height: 100vh">
        <NLayout position="absolute" has-sider>
          <!-- 侧边栏 -->
          <NLayoutSider
            bordered
            show-trigger
            collapse-mode="width"
            :collapsed-width
            :width="siderWidth"
            :native-scrollbar="false"
            :inverted
          >
            <NMenu
              v-model:value="currentDevice"
              :expanded-keys
              :inverted
              :collapsed-width
              :collapsed-icon-size="22"
              :options="menuOptions"
            />
          </NLayoutSider>
          <!-- 主内容区 -->
          <NLayout>
            <!-- 顶部栏 -->
            <NLayoutHeader
              position="absolute"
              :style="{ height: `${headerHeight}px`, padding: '0 14px' }"
            >
              <NFlex
                justify="space-between"
                align="center"
                style="height: 100%"
              >
                <NFlex align="center">
                  <NButton
                    quaternary
                    :disabled="!canBackHistory"
                    @click="backHistory"
                  >
                    <template #icon>
                      <NIcon :component="ChevronBack" />
                    </template>
                  </NButton>
                  <NButton
                    quaternary
                    :disabled="!canForwardHistory"
                    @click="forwardHistory"
                  >
                    <template #icon>
                      <NIcon :component="ChevronForward" />
                    </template>
                  </NButton>
                  <div style="font-size: var(--n-font-size)">
                    {{ currentPathName }}
                  </div>
                </NFlex>
                <NButton quaternary @click="refreshDevices">
                  <template #icon>
                    <NIcon :component="Reload" />
                  </template>
                </NButton>
              </NFlex>
            </NLayoutHeader>
            <!-- 主内容区 -->
            <NLayoutContent
              ref="contentRef"
              position="absolute"
              :style="{
                top: `${headerHeight}px`,
                bottom: '64px',
                left: '0',
                right: '0',
              }"
            >
              <FileList />
            </NLayoutContent>
            <!-- 底部栏 -->
            <NLayoutFooter
              position="absolute"
              :style="{ bottom: '0', height: '64px', padding: '0 14px' }"
            >
              <NFlex style="height: 100%" align="center">
                <NBreadcrumb>
                  <NBreadcrumbItem @click="pushHistory('/')">/</NBreadcrumbItem>
                  <NBreadcrumbItem
                    v-for="(item, i) in currentPathList"
                    :key="i"
                    @click="
                      pushHistory(
                        `/${currentPathList.slice(0, i + 1).join('/')}`,
                      )
                    "
                  >
                    {{ item }}
                  </NBreadcrumbItem>
                </NBreadcrumb>
              </NFlex>
            </NLayoutFooter>
          </NLayout>
        </NLayout>
      </div>
    </NMessageProvider>
  </NConfigProvider>
</template>
