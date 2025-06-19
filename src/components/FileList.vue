<script setup lang="ts">
import { ref, watch, h, computed, MaybeRef, unref } from "vue";
import { NDataTable, type DataTableColumns, NPopover } from "naive-ui";
import { currentDevice } from "../hooks/useDevices";
import { currentPath } from "../hooks/useFileList";
import type { FileItem } from "../types/file-item";
import FileListContextmenu from "./FileListContextmenu.vue";
import { getCurrentDeviceFileList, resolveCommandPath } from "../utils/adb";

/** 当前路径的文件列表 */
const currentPathFileList = ref<FileItem[]>([]);

watch(
  currentDevice,
  async (newDevice) => {
    if (newDevice === "") {
      return;
    }
    currentPath.value = "/";
    currentPathFileList.value = await getCurrentDeviceFileList(
      resolveCommandPath(currentPath.value),
    );
  },
  { immediate: true },
);

const columns: DataTableColumns = [
  { type: "selection" },
  {
    title: "文件名",
    key: "basename",
    render: (row) =>
      h(
        NPopover,
        { trigger: "hover" },
        {
          default: () => h("span", row.link),
          trigger: () => h("span", row.basename),
        },
      ),
    ellipsis: true,
    resizable: true,
  },
  {
    title: "文件类型",
    key: "type",
    width: 100,
    ellipsis: true,
    resizable: true,
  },
  {
    title: "文件大小",
    key: "size",
    width: 100,
    ellipsis: true,
    resizable: true,
  },
  {
    title: "修改时间",
    key: "time",
    width: 120,
    ellipsis: true,
    resizable: true,
  },
];

const onLoad = async (row: FileItem) => {
  if (row.isDirectory) {
    row.children = await getCurrentDeviceFileList(resolveCommandPath(row.name));
  }
};

const containerRef = ref<HTMLElement | null>(null);
/** 表格高度 */
const tableHeight = computed(() => containerRef.value?.clientHeight);

const contextmenuRef = ref<InstanceType<typeof FileListContextmenu> | null>(
  null,
);

const rowProps = (row: FileItem) => {
  return {
    onContextmenu(e: MouseEvent) {
      e.preventDefault();
      contextmenuRef.value?.open(e, row);
    },
  };
};

const findFileItem = (
  path: string,
  baseFileList: MaybeRef<FileItem[]> = currentPathFileList,
) => {
  const fileList = unref(baseFileList);
  const target = fileList.find((item) => path.startsWith(item.name));

  if (target) {
    if (target.name === path) {
      return target;
    }
    return findFileItem(path, target?.children);
  }

  return null;
};

const onRefreshPath = async (path: string) => {
  const target = findFileItem(path);
  console.debug("[FileList] target", target);
  if (target) {
    target.children = await getCurrentDeviceFileList(
      resolveCommandPath(target.name),
    );
  }
};
</script>

<template>
  <div ref="containerRef" style="position: absolute; inset: 0">
    <NDataTable
      size="small"
      striped
      :max-height="tableHeight"
      :columns
      :data="currentPathFileList"
      :cascade="false"
      allow-checking-not-loaded
      :row-key="(row) => row.name"
      :row-props
      @load="onLoad"
    />
    <FileListContextmenu ref="contextmenuRef" @refresh-path="onRefreshPath" />
  </div>
</template>
