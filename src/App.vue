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
} from "naive-ui";
import { PhonePortraitOutline, Reload } from "@vicons/ionicons5";
import { devices, currentDevice, refreshDevices } from "./hooks/useDevices";
import FileList from "./components/FileList.vue";

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
  // {
  //   label: '舞，舞，舞',
  //   key: 'dance-dance-dance',
  //   icon: renderIcon(BookIcon),
  //   children: [
  //     {
  //       type: 'group',
  //       label: '人物',
  //       key: 'people',
  //       children: [
  //         {
  //           label: '叙事者',
  //           key: 'narrator',
  //           icon: renderIcon(PersonIcon)
  //         },
  //         {
  //           label: '羊男',
  //           key: 'sheep-man',
  //           icon: renderIcon(PersonIcon)
  //         }
  //       ]
  //     },
  //     {
  //       label: '饮品',
  //       key: 'beverage',
  //       icon: renderIcon(WineIcon),
  //       children: [
  //         {
  //           label: '威士忌',
  //           key: 'whisky'
  //         }
  //       ]
  //     },
  //     {
  //       label: '食物',
  //       key: 'food',
  //       children: [
  //         {
  //           label: '三明治',
  //           key: 'sandwich'
  //         }
  //       ]
  //     },
  //     {
  //       label: '过去增多，未来减少',
  //       key: 'the-past-increases-the-future-recedes'
  //     }
  //   ]
  // }
]);
const expandedKeys = ref<string[]>(["devices"]);

refreshDevices();
</script>

<template>
  <NConfigProvider :locale="zhCN" :date-locale="dateZhCN" :theme="theme">
    <NMessageProvider>
      <div style="position: relative; height: 100vh">
        <NLayout position="absolute" has-sider>
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
          <NLayout>
            <NLayoutHeader
              position="absolute"
              :style="{ height: `${headerHeight}px`, padding: '0 14px' }"
            >
              <NFlex
                justify="space-between"
                align="center"
                style="height: 100%"
              >
                <div />
                <NButton quaternary @click="refreshDevices">
                  <template #icon>
                    <NIcon :component="Reload" />
                  </template>
                </NButton>
              </NFlex>
            </NLayoutHeader>
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
            <NLayoutFooter
              position="absolute"
              :style="{ bottom: '0', height: '64px' }"
            >
              成府路
            </NLayoutFooter>
          </NLayout>
        </NLayout>
      </div>
    </NMessageProvider>
  </NConfigProvider>
</template>
