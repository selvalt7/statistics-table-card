import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

export default [
  {
    input: ["src/stat-table-card.ts"],
    output: [
      {
        file: "dist/statistics-table-card.js",
        format: "es",
        inlineDynamicImports: true,
      },
    ],
    plugins: [
      typescript({
        declaration: false,
      }),
      nodeResolve(),
      commonjs(),
      babel({
        exclude: "node_modules/**",
        babelHelpers: "bundled",
        compact: true,
        extensions: [".js", ".ts"],
        presets: [
          [
            "@babel/env",
            {
              "modules": false,
              "targets": { node: "current" },
            },
          ],
        ],
        comments: false,
      }),
    ],
  }
]