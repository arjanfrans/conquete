import * as esbuild from 'esbuild';
import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const serve = process.argv.includes('--serve');
const outdir = join(root, 'dist');

await rm(outdir, { recursive: true, force: true });
await mkdir(outdir, { recursive: true });
await cp(join(root, 'public'), outdir, { recursive: true });

const options = {
    absWorkingDir: root,
    entryPoints: ['src/main.ts'],
    bundle: true,
    format: 'esm',
    target: 'es2022',
    platform: 'browser',
    outdir,
    sourcemap: serve,
    minify: !serve,
    alias: {
        conquete: '../lib/index.js',
        events: './src/shims/events.cjs',
        url: './src/shims/url.cjs'
    },
    define: {
        'process.env.NODE_ENV': serve ? '"development"' : '"production"',
        'process.env.DEBUG': 'undefined'
    },
    logLevel: 'info'
};

if (serve) {
    const context = await esbuild.context(options);

    await context.watch();
    await context.serve({ servedir: outdir, port: 8080 });
} else {
    await esbuild.build(options);
}
