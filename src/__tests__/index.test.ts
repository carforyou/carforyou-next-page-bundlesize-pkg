import fs from "fs"

import run from "../index"

describe("cli", () => {
  it("produces config with correct files and sizes", async () => {
    const mockExit = jest.spyOn(process, "exit").mockImplementation()
    await run([
      "jest",
      "./node_modules/.bin/jest",
      "--maxSize",
      "1 kB",
      "--buildDir",
      "./src/__tests__/.next",
    ])

    const config = fs
      .readFileSync("./src/__tests__/.next/next-page-bundlesize.config.json")
      .toString()
    expect(config).toMatchSnapshot()
    await expect(mockExit).toHaveBeenCalledWith(0)
  })

  it("produces concatenated bundle file", async () => {
    const mockExit = jest.spyOn(process, "exit").mockImplementation()
    await run([
      "jest",
      "./node_modules/.bin/jest",
      "--maxSize",
      "1 kB",
      "--buildDir",
      "./src/__tests__/.next",
    ])

    const page = fs
      .readFileSync("./src/__tests__/.next/.bundlesize_")
      .toString()
    expect(page).toMatchSnapshot()
    await expect(mockExit).toHaveBeenCalledWith(0)
  })

  it("fails when bundles are larger than the limit", async () => {
    const mockExit = jest.spyOn(process, "exit").mockImplementation()
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
})
