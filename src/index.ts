import yargs from "yargs"
import path from "path"
import fs from "fs"
import { execSync } from "child_process"

interface Args {
  maxSize: string
  buildDir: string
}

interface Manifest {
  pages: {
    [pageName: string]: string[]
  }
  [key: string]: Record<string, unknown>
}

const concatenatePageBundles = ({
  buildDir,
  manifest,
}: {
  buildDir: string
  manifest: Manifest
}): string[] =>
  Object.keys(manifest.pages).map((page) => {
    const firstLoadChunks = Array.from(
      new Set([...manifest.pages["/_app"], ...manifest.pages[page]])
    )
      .filter((chunk) => chunk.match(/\.js$/))
      .map((chunk) => path.join(buildDir, chunk))

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
}: {
  pageBundles: string[]
  maxSize: string
}): string => {
  const config = {
    files: pageBundles.map((pageBundle) => ({
      path: pageBundle,
      maxSize: maxSize,
    })),
  }
  return JSON.stringify(config)
}

export default function run() {
  try {
    const args = yargs.argv as unknown as Args
    const maxSize = args.maxSize || "200 kB"
    const buildDir = args.buildDir || ".next"

    const manifestFile = path.join(buildDir, "build-manifest.json")
    const manifest = JSON.parse(fs.readFileSync(manifestFile).toString())

    const pageBundles = concatenatePageBundles({ buildDir, manifest })
    const config = generateBundleSizeConfig({ pageBundles, maxSize })
    const configFile = path.join(buildDir, "next-page-bundlesize.config.json")
    fs.writeFileSync(configFile, config)

    execSync(`npx bundlesize --config=${configFile}`, { stdio: "inherit" })
    process.exit(0)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err)
    process.exit(1)
  }
}
