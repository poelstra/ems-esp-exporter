import type { Config } from "jest";

const config: Config = {
    testEnvironment: "node",
    transform: {
        "^.+.tsx?$": ["ts-jest", {}],
    },
    roots: ["src/"],
};

export default config;
