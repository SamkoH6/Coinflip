import { dirname } from "path"
import { fileURLToPath } from "url"
import { FlatCompat } from "@eslint/eslintrc"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
    baseDirectory: __dirname,
})

const eslintConfig = [
    // Extend Next defaults + Prettier recommended
    ...compat.extends(
        "next/core-web-vitals",
        "next/typescript",
        "plugin:prettier/recommended",
    ),
    {
        ignores: [
            "node_modules/**",
            ".next/**",
            "out/**",
            "build/**",
            "next-env.d.ts",
        ],
        rules: {
            // optional tweaks if you want to enforce Prettier strictly:
            "prettier/prettier": "error",
        },
    },
]

export default eslintConfig