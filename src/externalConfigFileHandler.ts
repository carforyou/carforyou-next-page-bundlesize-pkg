import path from "path"
import fs from "fs"
import bytes from "bytes"
// eslint-disable-next-line import/no-internal-modules
import compressedSize from "bundlesize/src/compressed-size"

import { BundleSizeConfig } from "./index"

export const createNewConfigFile = (
  oldConfig: BundleSizeConfig,
  delta: number,
  targetSize: number,
  buildDir: string,
  fileName?: string
) => {
  if (!fileName) {
    return null
  }
  const newConfig = updateConfigurationWithNewBundleSizes(
    oldConfig,
    delta,
    targetSize
  )
  fs.writeFileSync(
    path.join(buildDir, "new-" + fileName),
    JSON.stringify(newConfig)
  )
}

export const getPreviousConfig = (
  buildDir: string,
  fileName?: string
): BundleSizeConfig => {
  if (!fileName) {
    return null
  }
  try {
    const config = fs.readFileSync(path.join(buildDir, fileName)).toString()
    return JSON.parse(config)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(
      "Previous config file not existing or not found... using default values"
    )
    return null
  }
}

const updateConfigurationWithNewBundleSizes = (
  config: BundleSizeConfig,
  delta: number,
  targetSize: number
): BundleSizeConfig => {
  const newConfig = config.files.map((file) => {
    const size =
      compressedSize(fs.readFileSync(file.path, "utf8"), "gzip") + delta
    return {
      path: file.path,
      maxSize: bytes(size < targetSize ? targetSize : size),
    }
  })
  return {
    files: newConfig,
  }
}
