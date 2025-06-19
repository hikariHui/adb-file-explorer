import { ref, watch } from "vue";
import { adbCommand } from "../utils/adb";

/** 当前连接的设备 */
export const currentDevice = ref("");

/** 当前连接的设备列表 */
export const devices = ref<{ id: string; name: string }[]>([]);
watch(
  devices,
  (newDevices) => {
    if (newDevices.some((device) => device.id === currentDevice.value)) {
      return;
    }
    if (newDevices.length > 0) {
      currentDevice.value = newDevices[0].id;
      return;
    }
    currentDevice.value = "";
  },
  { deep: true },
);

/** 刷新设备列表 */
export const refreshDevices = async () => {
  const result = await adbCommand(["devices"]);
  const devicesList = result
    .split("\n")
    .filter((line) => line.trim() !== "")
    .slice(1);
  devices.value = devicesList.map((device) => {
    const [id, name] = device.split("\t");
    return {
      id,
      name,
    };
  });
};
