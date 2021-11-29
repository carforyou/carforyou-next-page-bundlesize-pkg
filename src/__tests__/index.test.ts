import fs from "fs"

import run from "../index"
import * as compareHandler from "../compareHandler"

const validRunConfig = [
  "jest",
  "./node_modules/.bin/jest",
  "--maxSize",
  "1 kB",
  "--buildDir",
  "./src/__tests__/.next",
]

describe("cli", () => {
  const mockExit = jest.spyOn(process, "exit").mockImplementation()
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    process.env = { ...OLD_ENV }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  it("produces config with correct files and sizes", async () => {
    await run(validRunConfig)

    const config = fs
      .readFileSync("./src/__tests__/.next/next-page-bundlesize.config.json")
      .toString()
    expect(config).toMatchSnapshot()
    await expect(mockExit).toHaveBeenCalledWith(0)
  })

  it("produces concatenated bundle file", async () => {
    await run(validRunConfig)

    const page = fs
      .readFileSync("./src/__tests__/.next/.bundlesize_")
      .toString()
    expect(page).toMatchSnapshot()
    await expect(mockExit).toHaveBeenCalledWith(0)
  })

  it("fails when bundles are larger than the limit", async () => {
    await run([
      "jest",
      "./node_modules/.bin/jest",
      "--maxSize",
      "1 b",
      "--buildDir",
      "./src/__tests__/.next",
    ])
    await expect(mockExit).toHaveBeenCalledWith(1)
  })

  describe("upload new config", () => {
    it("uploads the new config to an s3 bucket", async () => {
      process.env.CIRCLE_BRANCH = "master"
      process.env.BUNDLESIZE_S3_BUCKET = "bucket_url"
      process.env.BUNDLESIZE_S3_KEY = "bucket_key"
      jest.spyOn(compareHandler, "uploadNewConfig").mockImplementation()
      await run(validRunConfig)

      await expect(compareHandler.uploadNewConfig).toHaveBeenCalledWith(
        expect.objectContaining({ files: expect.any(Array) }),
        "bucket_url",
        "bucket_key"
      )
    })

    it("does not upload the new config on other branches", async () => {
      process.env.CIRCLE_BRANCH = "my_awesome_branch"
      process.env.BUNDLESIZE_S3_BUCKET = "bucket_url"
      process.env.BUNDLESIZE_S3_KEY = "bucket_key"
      jest.spyOn(compareHandler, "uploadNewConfig").mockImplementation()
      await run(validRunConfig)

      await expect(compareHandler.uploadNewConfig).not.toHaveBeenCalled()
    })

    it("does not upload the new config when the s3 bucket config is missing", async () => {
      process.env.CIRCLE_BRANCH = "my_awesome_branch"
      process.env.BUNDLESIZE_S3_KEY = "bucket_key"
      jest.spyOn(compareHandler, "uploadNewConfig").mockImplementation()
      await run(validRunConfig)

      await expect(compareHandler.uploadNewConfig).not.toHaveBeenCalled()
    })

    it("does not upload the new config when the s3 key config is missing", async () => {
      process.env.CIRCLE_BRANCH = "my_awesome_branch"
      process.env.BUNDLESIZE_S3_BUCKET = "bucket_url"
      jest.spyOn(compareHandler, "uploadNewConfig").mockImplementation()
      await run(validRunConfig)

      await expect(compareHandler.uploadNewConfig).not.toHaveBeenCalled()
    })
  })
})
