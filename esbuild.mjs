import { build } from 'esbuild';

const conf = {
    entryPoints: [ 'src/index.ts' ],
    outbase: 'src',
    bundle: true,
    sourcemap: true,
    minify: false,
    platform: 'node',
    target: [ 'esnext' ],
};

await build({
    ...conf,
    outfile: 'lib/index.cjs',
    format: 'cjs',
});

await build({
    ...conf,
    outfile: 'lib/index.mjs',
    format: 'esm',
});