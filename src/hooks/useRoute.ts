import type { FileItem } from "@/types/file-item";
import { computed, ref, watch } from "vue";
import { currentDevice } from "./useDevices";
import { getCurrentDeviceFileList, resolveCommandPath } from "@/utils/adb";

/** 历史记录 */
export const history = ref<string[]>([]);

/** 当前历史记录索引 */
const currentIndex = ref(0);

/** 是否正在加载文件列表 */
export const loadingFileList = ref(false);

/** 当前路径 */
export const currentPath = computed(
  () => history.value[currentIndex.value] || "",
);
watch(currentPath, (newPath) => {
  if (newPath) {
    loadingFileList.value = true;
    getCurrentDeviceFileList(resolveCommandPath(newPath))
      .then((res) => {
        currentPathFileList.value = res;
      })
      .finally(() => {
        loadingFileList.value = false;
      });
  }
});

/** 当前路径的文件列表 */
export const currentPathFileList = ref<FileItem[]>([]);

export const pushHistory = (path: string) => {
  history.value = history.value.slice(0, currentIndex.value + 1);
  history.value.push(path);
  currentIndex.value++;
};

export const canBackHistory = computed(() => currentIndex.value > 0);

export const backHistory = () => {
  if (canBackHistory.value) {
    currentIndex.value--;
  }
};

export const canForwardHistory = computed(
  () => currentIndex.value < history.value.length - 1,
);

export const forwardHistory = () => {
  if (canForwardHistory.value) {
    currentIndex.value++;
  }
};

export const refreshHistory = async (path: string) => {
  history.value = [path];
  currentIndex.value = 0;
};

watch(
  currentDevice,
  async (newDevice) => {
    if (newDevice === "") {
      currentPathFileList.value = [];
      currentIndex.value = 0;
      history.value = [];
      return;
    }
    refreshHistory("/");
  },
  { immediate: true },
);
