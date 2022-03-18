import { build } from 'esbuild';

const conf = {
    entryPoints: [ 'src/index.ts' ],
    outbase: 'src',
    bundle: true,
    sourcemap: true,
    minify: true,
    platform: 'node',
    target: [ 'esnext' ],
    external: [ 'react', 'react-dom' ],
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