<script setup lang="ts">
import { ref, h, computed, type MaybeRef, unref } from "vue";
import { NDataTable, type DataTableColumns, NPopover } from "naive-ui";
import type { FileItem } from "../types/file-item";
import FileListContextmenu from "./FileListContextmenu.vue";
import { getCurrentDeviceFileList, resolveCommandPath } from "../utils/adb";
import {
  currentPathFileList,
  loadingFileList as loading,
  pushHistory,
} from "../hooks/useRoute";

const columns: DataTableColumns<FileItem> = [
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

const onLoad = async (_row: Record<string, unknown>) => {
  const row = _row as FileItem;
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
    ondblclick() {
      pushHistory(row.name);
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
      :loading
      allow-checking-not-loaded
      :row-key="(row) => row.name"
      :row-props
      @load="onLoad"
    />
    <FileListContextmenu ref="contextmenuRef" @refresh-path="onRefreshPath" />
  </div>
</template>
