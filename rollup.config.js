
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import babel from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';
import { terser } from "rollup-plugin-terser";
import serve from "rollup-plugin-serve";

const dev = process.env.ROLLUP_WATCH;

const serveOptions = {
    contentBase: ["./dist"],
    host: "0.0.0.0",
    port: 5000,
    allowCrossOrigin: true,
    headers: {
        "Access-Control-Allow-Origin": "*",
    },
};

const plugins = [
    typescript({
        declaration: false,
    }),
    nodeResolve(),
    commonjs(),
    json(),
    babel({
        exclude: 'node_modules/**',
        babelHelpers: "bundled"
    }),
    ...(dev ? [serve(serveOptions)] : [terser()]),
];

export default [
    {
        input: 'src/index.ts',
        output: {
            file: "dist/minimalist.js",
            format: 'es',
        },
        plugins,
    },
];