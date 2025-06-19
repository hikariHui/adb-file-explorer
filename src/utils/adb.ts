import { invoke } from "@tauri-apps/api/core";
import { currentDevice } from "../hooks/useDevices";
import type { FileItem } from "../types/file-item";
import path from "path-browserify-esm";

export const adbCommand = async (args: string[]) => {
  const result: string = await invoke("adb_command", { args });
  console.debug("[adb]", args, result);
  return result;
};

/** 解析命令行路径 */
export const resolveCommandPath = (
  path: string,
  showHidden: boolean = false,
) => {
  if (!path.endsWith("/")) {
    path += "/";
  }
  if (showHidden) {
    return path + "{.,}*";
  }
  return path + "*";
};

/** 获取文件列表 */
export const getCurrentDeviceFileList = async (pathValue: string) => {
  const result: string = await adbCommand([
    "-s",
    currentDevice.value,
    "shell",
    "stat",
    "-c",
    '"%n|%F|%s|%Y|%N"',
    `${pathValue}`,
  ]);
  const files = result.split("\n").filter((line) => line.trim() !== "");
  const fileList = files.map((file) => {
    const [name, type, size, time, link] = file.split("|");
    const isDirectory = type === "directory";
    return {
      name,
      type: type as FileItem["type"],
      size,
      time,
      link,
      basename: path.basename(name),
      isDirectory: isDirectory,
      isLeaf: !isDirectory,
    };
  });
  return fileList;
};
