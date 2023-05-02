module.exports = {
  globals: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    "ts-jest": {
      tsConfig: "tsconfig.json",
      diagnostics: false,
    },
  },
  testPathIgnorePatterns: ["<rootDir>/pkg/"],
  moduleFileExtensions: ["ts", "js", "json", "node"],
  testMatch: ["**/__tests__/**/*.test.(t|j)s"],
  preset: "ts-jest",
}
