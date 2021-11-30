import { parse } from "yargs"
import path from "path"
import fs from "fs"
import { execSync } from "child_process"

import {
  createNewConfigFile,
  getPreviousConfig,
} from "./externalConfigFileHandler"

interface Args {
  maxSize: string
  buildDir: string
  delta?: number
  previousConfigFileName?: string
  targetSize?: number
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

const getMaxSize = (
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
  const delta = (parsedArgs.delta || 2) * 1024
  const targetSize = (parsedArgs.targetSize || 130) * 1024

  return {
    maxSize,
    buildDir,
    delta,
    previousConfigFileName: parsedArgs.previousConfigFileName,
    targetSize,
  }
}

export default function run(args) {
  try {
    const { maxSize, buildDir, delta, previousConfigFileName, targetSize } =
      extractArgs(args)
    const manifestFile = path.join(buildDir, "build-manifest.json")
    const manifest = JSON.parse(fs.readFileSync(manifestFile).toString())

    const pageBundles = concatenatePageBundles({ buildDir, manifest })
    const previousConfiguration = getPreviousConfig(
      buildDir,
      previousConfigFileName
    )
    const config = generateBundleSizeConfig({
      pageBundles,
      maxSize,
      previousConfiguration,
    })
    const configFile = path.join(buildDir, "next-page-bundlesize.config.json")
    fs.writeFileSync(configFile, JSON.stringify(config))

    execSync(`npx bundlesize --config=${configFile}`, { stdio: "inherit" })

    createNewConfigFile(
      config,
      delta,
      targetSize,
      buildDir,
      previousConfigFileName
    )
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err)
    process.exit(1)
  }

  process.exit(0)
}
