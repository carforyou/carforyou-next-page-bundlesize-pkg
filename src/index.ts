import { parse } from "yargs"
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
  [key: string]: Record<string, string | string[]>
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

export default function run(args) {
  try {
    const parsedArgs = parse(args) as unknown as Args
    const maxSize = parsedArgs.maxSize || "200 kB"
    const buildDir = parsedArgs.buildDir || ".next"

    const manifestFile = path.join(buildDir, "build-manifest.json")
    const manifest = JSON.parse(fs.readFileSync(manifestFile).toString())

    const pageBundles = concatenatePageBundles({ buildDir, manifest })
    const config = generateBundleSizeConfig({ pageBundles, maxSize })
    const configFile = path.join(buildDir, "next-page-bundlesize.config.json")
    fs.writeFileSync(configFile, config)

    execSync(`npx bundlesize --config=${configFile}`, { stdio: "inherit" })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err)
    process.exit(1)
  }

  process.exit(0)
}
