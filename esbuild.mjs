import { compile } from '@kruining/waterlogged';

await compile([ 'esm', 'cjs' ], {
    entryPoints: [ './src/index.ts' ],
    outbase: 'src',
    outfile: 'lib/index.$formatExtension',
    bundle: true,
    sourcemap: true,
    minify: false,
    platform: 'node',
    target: [ 'esnext' ],
    external: [ 'react', 'react-dom' ],
    watch: process.argv[2] === 'watch',
});