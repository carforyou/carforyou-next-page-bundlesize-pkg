import path from "path"
import fs from "fs"
import bytes from "bytes"
// eslint-disable-next-line import/no-internal-modules
import compressedSize from "bundlesize/src/compressed-size"

import { BundleSizeConfig } from "./index"

export const writeNewConfigFile = (
  oldConfig: BundleSizeConfig,
  delta: string,
  maxSize: string,
  buildDir: string
) => {
  try {
    const newConfig = updateConfigurationWithNewBundleSizes(
      oldConfig,
      delta,
      maxSize
    )
    fs.writeFileSync(
      path.join(buildDir, "bundlesize.json"),
      JSON.stringify(newConfig)
    )
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log("Cannot create new config file", error)
  }
}

export const getPreviousConfig = (
  buildDir: string,
  fileName?: string
): BundleSizeConfig => {
  const emptyBundleSizeConfig: BundleSizeConfig = { files: [] }
  if (!fileName) {
    // eslint-disable-next-line no-console
    console.log("No config file specified... using maxSize as default")
    return emptyBundleSizeConfig
  }
  try {
    const config = fs.readFileSync(path.join(buildDir, fileName)).toString()
    return JSON.parse(config)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(
      "Previous config file not existing or invalid JSON format... using maxSize as default"
    )
    return emptyBundleSizeConfig
  }
}

const updateConfigurationWithNewBundleSizes = (
  config: BundleSizeConfig,
  delta: string,
  maxSize: string
): BundleSizeConfig => {
  const newConfig = config.files.map((file) => {
    const sizeInBytes = compressedSize(
      fs.readFileSync(file.path, "utf8"),
      "gzip"
    )
    const deltaInBytes = bytes(delta)
    const maxSizeInBytes = bytes(maxSize)

    return {
      path: file.path,
      maxSize: bytes(
        sizeInBytes < maxSizeInBytes
          ? sizeInBytes + deltaInBytes
          : sizeInBytes + 100 // magic number 100 is to prevent failing if it's exactly the same size
      ),
    }
  })
  return {
    files: newConfig,
  }
}
