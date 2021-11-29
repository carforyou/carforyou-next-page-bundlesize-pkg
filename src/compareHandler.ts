import { BundleSizeConfig } from "./index"
import fs from "fs"
const compressedSize = require("bundlesize/src/compressed-size")

/** On all branches (fetch master config file) **/
export const downloadPreviousConfig = async (): Promise<BundleSizeConfig> => {
  return null
  /*return {
    files: [
      { path: ".next-stage-prod/.bundlesize_-language-", maxSize: "210 kB" },
    ],
  }*/
}

/** Only master **/
export const uploadNewConfig = (newConfig: BundleSizeConfig) => {
  console.log("uploading...")
  console.log(newConfig)
}

export const updateConfigurationWithNewBundleSizes = (
  config: BundleSizeConfig,
  delta: number
): BundleSizeConfig => {
  const newConfig = config.files.map((file) => {
    return {
      path: file.path,
      maxSize:
        compressedSize(fs.readFileSync(file.path, "utf8"), "gzip") + delta,
    }
  })
  return {
    files: newConfig,
  }
}

export const getMaxSize = (
  pageBundleName: string,
  fallbackSize: string,
  oldConfiguration?: BundleSizeConfig
): string => {
  if (!oldConfiguration) return fallbackSize

  const oldPageConfig = oldConfiguration.files.find(
    (page) => page.path === pageBundleName
  )
  return oldPageConfig?.maxSize ? oldPageConfig.maxSize : fallbackSize
}
