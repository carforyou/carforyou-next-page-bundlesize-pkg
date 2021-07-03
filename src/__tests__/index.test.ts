import fs from "fs"

import run from "../index"

describe("cli", () => {
  it("produces config with correct files and sizes", () => {
    const mockExit = jest.spyOn(process, "exit").mockImplementation()
    run([
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
    expect(mockExit).toHaveBeenCalledWith(0)
  })

  it("produces concatenated bundle file", () => {
    const mockExit = jest.spyOn(process, "exit").mockImplementation()
    run([
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
    expect(mockExit).toHaveBeenCalledWith(0)
  })

  it("fails when bundles are larger than the limit", () => {
    const mockExit = jest.spyOn(process, "exit").mockImplementation()
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
})
