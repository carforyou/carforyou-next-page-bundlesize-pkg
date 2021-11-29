import { BundleSizeConfig } from "./index"
import fs from "fs"
const compressedSize = require("bundlesize/src/compressed-size")
import { S3 } from "aws-sdk"

/** On all branches (fetch master config file) **/
export const downloadPreviousConfig = async (
  s3Bucket: string,
  s3Key: string
): Promise<BundleSizeConfig> => {
  console.log("download previous config...", s3Bucket, s3Key)
  if (!(s3Bucket && s3Key)) {
    return null
  }
  let config = null
  new S3().getObject({ Bucket: s3Bucket, Key: s3Key }, (err, data) => {
    if (err) {
      throw err
    } else {
      console.log(data)
      config = data
    }
  })
  return config
}

/** Only master **/
export const uploadNewConfig = (
  newConfig: BundleSizeConfig,
  s3Bucket: string,
  s3Key: string
) => {
  console.log("uploading...")
  console.log(newConfig)
  new S3().upload(
    {
      ACL: "private",
      Bucket: s3Bucket,
      Key: s3Key,
      Body: JSON.stringify(newConfig),
    },
    (err) => {
      if (err) {
        throw err
      } else {
        // eslint-disable-next-line no-console
        console.info(
          "Successfully uploaded new bundlesize master configuration"
        )
      }
    }
  )
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
  return oldPageConfig && oldPageConfig.maxSize
    ? oldPageConfig.maxSize
    : fallbackSize
}
