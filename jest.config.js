const nextJest = require("next/jest")

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: "./",
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jsdom",
  collectCoverageFrom: [
    // Core business logic components
    "components/navigation.tsx",
    "components/student-table.tsx",
    "components/edit-student-modal.tsx",
    "components/delete-student-modal.tsx",
    // Core utility functions
    "lib/utils.ts",
    "lib/supabase.ts",
    // Include more components for better coverage
    "components/theme-provider.tsx",
    // Exclude UI library components and pages (not core business logic)
    "!components/ui/**/*",
    "!app/**/*",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/.next/**",
    "!**/coverage/**",
    "!jest.config.js",
    "!jest.setup.js",
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testMatch: ["**/__tests__/**/*.(test|spec).(js|jsx|ts|tsx)"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(isows|@supabase/realtime-js|@supabase/supabase-js)/)",
  ],
  // Suppress console warnings during tests
  silent: false,
  verbose: false,
  // Don't fail tests on console warnings
  testEnvironmentOptions: {
    customExportConditions: ["node", "node-addons"],
  },
  // Handle test suite failures more gracefully
  testResultsProcessor: undefined,
  // Suppress specific warnings
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
