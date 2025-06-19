<script setup lang="ts">
import { DropdownOption, NDropdown, NIcon, useMessage } from "naive-ui";
import type { FileItem } from "../types/file-item";
import { computed, h, nextTick, ref, shallowRef } from "vue";
import { open } from "@tauri-apps/plugin-dialog";
import { SaveOutline, DuplicateOutline } from "@vicons/ionicons5";
import { adbCommand } from "../utils/adb";
import { currentDevice } from "../hooks/useDevices";

const emit = defineEmits<{
  (e: "refresh-path", path: string): void;
}>();

const x = ref(0);
const y = ref(0);
const show = ref(false);
const fileItem = shallowRef<FileItem | null>(null);

const options = computed<DropdownOption[]>(() => [
  {
    label: "导出",
    key: "save",
    icon: () => h(NIcon, null, { default: () => h(SaveOutline) }),
  },
  {
    label: "上传",
    key: "upload",
    icon: () => h(NIcon, null, { default: () => h(DuplicateOutline) }),
    show: fileItem.value?.type === "directory",
  },
]);
const onClickoutside = () => {
  show.value = false;
};

const message = useMessage();
const onSelect = (key: string) => {
  switch (key) {
    case "save":
      open({
        multiple: false,
        directory: true,
      }).then((path) => {
        adbCommand([
          "-s",
          currentDevice.value,
          "pull",
          fileItem.value.name,
          path,
        ]).then(() => {
          message.success(
            "保存成功，路径：" + path + "/" + fileItem.value.basename,
          );
        });
      });
      break;
    case "upload":
      open({
        multiple: false,
        directory: false,
      }).then((path) => {
        adbCommand([
          "-s",
          currentDevice.value,
          "push",
          path,
          fileItem.value.name,
        ]).then(() => {
          message.success("上传成功，路径：" + fileItem.value.name);
          emit("refresh-path", fileItem.value.name);
        });
      });
  }
};

defineExpose({
  open: (e: MouseEvent, data: FileItem) => {
    show.value = false;
    nextTick(() => {
      fileItem.value = data;
      x.value = e.clientX;
      y.value = e.clientY;
      show.value = true;
    });
  },
});
</script>

<template>
  <NDropdown :x :y :show :options :on-clickoutside @select="onSelect" />
</template>
