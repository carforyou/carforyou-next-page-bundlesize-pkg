import fs from "fs"

import run from "../index"

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

  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  it("produces config with correct files and sizes", () => {
    run(validRunConfig)

    const config = fs
      .readFileSync("./src/__tests__/.next/next-page-bundlesize.config.json")
      .toString()
    expect(config).toMatchSnapshot()
    expect(mockExit).toHaveBeenCalledWith(0)
  })

  it("produces concatenated bundle file", () => {
    run(validRunConfig)

    const page = fs
      .readFileSync("./src/__tests__/.next/.bundlesize_")
      .toString()
    expect(page).toMatchSnapshot()
    expect(mockExit).toHaveBeenCalledWith(0)
  })

  it("fails when bundles are larger than the limit", () => {
    run([
      "jest",
      "./node_modules/.bin/jest",
      "--maxSize",
      "1 b",
      "--buildDir",
      "./src/__tests__/.next",
    ])
    expect(mockExit).toHaveBeenCalledWith(1)
  })

  it("uses the previous config if defined", () => {
    run([...validRunConfig, "--previousConfigFileName", "master-config.json"])

    const updatedConfig = fs
      .readFileSync("./src/__tests__/.next/new-master-config.json")
      .toString()
    expect(updatedConfig).toMatchSnapshot()
  })

  it("adds a delta to the new config if defined", () => {
    run([
      ...validRunConfig,
      "--previousConfigFileName",
      "master-config.json",
      "--targetSize",
      2,
      "--delta",
      10,
    ])

    const updatedConfig = fs
      .readFileSync("./src/__tests__/.next/new-master-config.json")
      .toString()
    expect(updatedConfig).toMatchSnapshot()
  })

  it("uses the targetSize if the page is smaller than that", () => {
    run([
      ...validRunConfig,
      "--previousConfigFileName",
      "master-config.json",
      "--targetSize",
      130,
    ])

    const updatedConfig = fs
      .readFileSync("./src/__tests__/.next/new-master-config.json")
      .toString()
    expect(updatedConfig).toMatchSnapshot()
  })
})
