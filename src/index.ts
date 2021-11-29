import { parse } from "yargs"
import path from "path"
import fs from "fs"
import { execSync } from "child_process"
import {
  downloadPreviousConfig,
  updateConfigurationWithNewBundleSizes,
  getMaxSize,
  uploadNewConfig,
} from "./compareHandler"

interface Args {
  maxSize: string
  buildDir: string
  delta?: number
}

interface Manifest {
  pages: {
    [pageName: string]: string[]
  }
  [key: string]: Record<string, string | string[]>
}

export interface BundleSizeConfig {
  files: Array<{
    path: string
    maxSize: string
  }>
}

const combineAppAndPageChunks = (manifest: Manifest, page: string) =>
  Array.from(
    new Set([...manifest.pages["/_app"], ...manifest.pages[page]])
  ).filter((chunk) => chunk.match(/\.js$/))

const concatenatePageBundles = ({
  buildDir,
  manifest,
}: {
  buildDir: string
  manifest: Manifest
}): string[] =>
  Object.keys(manifest.pages).map((page) => {
    const firstLoadChunks = combineAppAndPageChunks(manifest, page).map(
      (chunk) => path.join(buildDir, chunk)
    )

    const outFile = path.join(
      buildDir,
      `.bundlesize${page.replace(/[/]/g, "_").replace(/[[\]]/g, "-")}`
    )

    fs.writeFileSync(outFile, "")
    firstLoadChunks.forEach((chunk) => {
      const chunkContent = fs.readFileSync(chunk)
      fs.appendFileSync(outFile, chunkContent)
    })

    return outFile
  })

const generateBundleSizeConfig = ({
  pageBundles,
  maxSize,
  previousConfiguration,
}: {
  pageBundles: string[]
  maxSize: string
  previousConfiguration: BundleSizeConfig
}): BundleSizeConfig => {
  return {
    files: pageBundles.map((pageBundleName) => ({
      path: pageBundleName,
      maxSize: getMaxSize(pageBundleName, maxSize, previousConfiguration),
    })),
  }
}

const extractArgs = (args) => {
  const parsedArgs = parse(args) as unknown as Args
  const maxSize = parsedArgs.maxSize || "200 kB"
  const buildDir = parsedArgs.buildDir || ".next"
  const delta = parsedArgs.delta || 0

  return {
    maxSize,
    buildDir,
    delta,
  }
}

export default async function run(args) {
  try {
    const branch = process.env.CIRCLE_BRANCH
    const s3Bucket = process.env.BUNDLESIZE_S3_BUCKET
    const s3Key = process.env.BUNDLESIZE_S3_KEY

    const { maxSize, buildDir, delta } = extractArgs(args)
    const manifestFile = path.join(buildDir, "build-manifest.json")
    const manifest = JSON.parse(fs.readFileSync(manifestFile).toString())

    const pageBundles = concatenatePageBundles({ buildDir, manifest })
    const previousConfiguration = await downloadPreviousConfig(s3Bucket, s3Key)
    const config = generateBundleSizeConfig({
      pageBundles,
      maxSize,
      previousConfiguration,
    })
    const configFile = path.join(buildDir, "next-page-bundlesize.config.json")
    fs.writeFileSync(configFile, JSON.stringify(config))

    execSync(`npx bundlesize --config=${configFile}`, { stdio: "inherit" })

    // TODO: fail when upload failed
    // TODO: uncomment
    //if (branch === "master" && s3Bucket && s3Key) {
    if (s3Bucket && s3Key) {
      const newConfig = updateConfigurationWithNewBundleSizes(config, delta)
      uploadNewConfig(newConfig, s3Bucket, s3Key)
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err)
    process.exit(1)
  }

  process.exit(0)
}
