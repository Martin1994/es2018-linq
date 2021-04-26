module.exports = {
    roots: ["<rootDir>/tests"],
    preset: "ts-jest",
    testEnvironment: "node",
    collectCoverage: true,
    coverageDirectory: "coverage",
    coverageThreshold: {
        global: {
            branches: 100,
            functions: 100,
            lines: 100,
            statements: 100
        }
    },
    testPathIgnorePatterns: [
        "/node_modules/"
    ]
};
