import { createHash } from 'node:crypto';
import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { brotliCompressSync, constants, gzipSync } from 'node:zlib';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { transformWithOxc } from 'vite';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const clientBuild = join(projectRoot, 'dist/client');
const outputDirectory = join(projectRoot, 'dist-static');

if (basename(outputDirectory) !== 'dist-static') {
  throw new Error(
    `Refusing to clear unexpected output path: ${outputDirectory}`,
  );
}

rmSync(outputDirectory, { recursive: true, force: true });
mkdirSync(outputDirectory, { recursive: true });

const pageSource = readFileSync(join(projectRoot, 'app/page.tsx'), 'utf8');
const transformedPage = await transformWithOxc(pageSource, 'app/page.tsx', {
  lang: 'tsx',
});
const temporaryPageModule = join(projectRoot, `.spark-page-${process.pid}.mjs`);
writeFileSync(temporaryPageModule, transformedPage.code);
const { default: Home } = await import(pathToFileURL(temporaryPageModule).href);
rmSync(temporaryPageModule, { force: true });

const pageMarkup = renderToStaticMarkup(createElement(Home));
const cssDirectory = join(clientBuild, '_next/static/css');
const cssFiles = readdirSync(cssDirectory).filter((file) =>
  file.endsWith('.css'),
);
if (cssFiles.length !== 1) {
  throw new Error(
    `Expected one compiled stylesheet, found ${cssFiles.length}.`,
  );
}

const css = readFileSync(join(cssDirectory, cssFiles[0]));
const cssHash = createHash('sha256').update(css).digest('hex').slice(0, 10);
const cssFilename = `site.${cssHash}.css`;
const assetsDirectory = join(outputDirectory, 'assets');
mkdirSync(assetsDirectory, { recursive: true });
writeFileSync(join(assetsDirectory, cssFilename), css);

const copyDirectoryFiles = (
  sourceDirectory,
  destinationDirectory,
  filter = () => true,
) => {
  mkdirSync(destinationDirectory, { recursive: true });
  for (const file of readdirSync(sourceDirectory)) {
    if (!filter(file)) continue;
    copyFileSync(join(sourceDirectory, file), join(destinationDirectory, file));
  }
};

copyDirectoryFiles(
  join(projectRoot, 'app/fonts'),
  join(outputDirectory, 'fonts'),
  (file) =>
    file.endsWith('.woff2') || file === 'OFL.txt' || file === 'README.md',
);
copyDirectoryFiles(
  join(projectRoot, 'public/studios'),
  join(outputDirectory, 'studios'),
  (file) => file.endsWith('.webp'),
);
copyDirectoryFiles(
  join(projectRoot, 'public/brand'),
  join(outputDirectory, 'brand'),
  (file) => file.endsWith('.svg') || file.endsWith('.png'),
);
copyFileSync(
  join(projectRoot, 'public/favicon.svg'),
  join(outputDirectory, 'favicon.svg'),
);
copyFileSync(
  join(projectRoot, 'public/og.png'),
  join(outputDirectory, 'og.png'),
);

const title = '光点计划 IV｜让对系统的好奇，有地方发生。';
const description =
  '光点计划 IV：OS 方向以 rCore 为学习材料，RDMA 方向以 RDMA101 为学习材料。';
const siteOrigin = (process.env.SITE_URL ?? 'https://csinfra.cn').replace(
  /\/$/,
  '',
);

const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title}</title>
    <meta name="description" content="${description}">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="zh_CN">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${siteOrigin}/og.png">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${siteOrigin}/og.png">
    <link rel="icon" href="/favicon.svg?v=3" type="image/svg+xml">
    <link rel="preload" href="/fonts/google-sans-flex-latin-v1.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="/fonts/noto-sans-sc-spark-v1.woff2?v=2" as="font" type="font/woff2" crossorigin>
    <style>
      @font-face { font-family: "Spark Google Sans Flex"; src: url("/fonts/google-sans-flex-latin-v1.woff2") format("woff2"); font-style: normal; font-weight: 100 1000; font-display: swap; }
      @font-face { font-family: "Spark Noto Sans SC"; src: url("/fonts/noto-sans-sc-spark-v1.woff2?v=2") format("woff2"); font-style: normal; font-weight: 100 900; font-display: swap; }
      @font-face { font-family: "Spark Geist Mono"; src: url("/fonts/geist-mono-latin-v1.woff2") format("woff2"); font-style: normal; font-weight: 100 900; font-display: swap; }
      :root { --font-google-sans-flex: "Spark Google Sans Flex"; --font-noto-sans-sc: "Spark Noto Sans SC"; --font-geist-mono: "Spark Geist Mono"; }
    </style>
    <link rel="stylesheet" href="/assets/${cssFilename}">
  </head>
  <body class="antialiased">${pageMarkup}</body>
</html>
`;

const writeCompressed = (file, content) => {
  const bytes = Buffer.isBuffer(content) ? content : Buffer.from(content);
  writeFileSync(file, bytes);
  writeFileSync(`${file}.gz`, gzipSync(bytes, { level: 9 }));
  writeFileSync(
    `${file}.br`,
    brotliCompressSync(bytes, {
      params: { [constants.BROTLI_PARAM_QUALITY]: 11 },
    }),
  );
};

writeCompressed(join(outputDirectory, 'index.html'), html);
writeCompressed(join(assetsDirectory, cssFilename), css);

const rankSourceDirectory = join(projectRoot, 'public/rank');
const rankOutputDirectory = join(outputDirectory, 'rank');
const rankAssetsDirectory = join(rankOutputDirectory, 'assets');
mkdirSync(rankAssetsDirectory, { recursive: true });

const sharedShellCss = readFileSync(join(projectRoot, 'app/site-shell.css'));
const rankCss = Buffer.concat([
  sharedShellCss,
  Buffer.from('\n'),
  readFileSync(join(rankSourceDirectory, 'rank.css')),
]);
const rankScript = readFileSync(join(rankSourceDirectory, 'rank.js'));
const rankCssHash = createHash('sha256')
  .update(rankCss)
  .digest('hex')
  .slice(0, 10);
const rankScriptHash = createHash('sha256')
  .update(rankScript)
  .digest('hex')
  .slice(0, 10);
const rankCssFilename = `rank.${rankCssHash}.css`;
const rankScriptFilename = `rank.${rankScriptHash}.js`;
const rankHtml = readFileSync(join(rankSourceDirectory, 'index.html'), 'utf8')
  .replace('__RANK_CSS__', `/rank/assets/${rankCssFilename}`)
  .replace('__RANK_JS__', `/rank/assets/${rankScriptFilename}`);

writeCompressed(join(rankOutputDirectory, 'index.html'), rankHtml);
writeCompressed(join(rankAssetsDirectory, rankCssFilename), rankCss);
writeCompressed(join(rankAssetsDirectory, rankScriptFilename), rankScript);

const campSourceDirectory = join(projectRoot, 'public/camp');
const campOutputDirectory = join(outputDirectory, 'camp');
const campAssetsDirectory = join(campOutputDirectory, 'assets');
mkdirSync(campAssetsDirectory, { recursive: true });

const campCss = Buffer.concat([
  sharedShellCss,
  Buffer.from('\n'),
  readFileSync(join(campSourceDirectory, 'camp.css')),
]);
const campScript = readFileSync(join(campSourceDirectory, 'camp.js'));
const campCssHash = createHash('sha256')
  .update(campCss)
  .digest('hex')
  .slice(0, 10);
const campScriptHash = createHash('sha256')
  .update(campScript)
  .digest('hex')
  .slice(0, 10);
const campCssFilename = `camp.${campCssHash}.css`;
const campScriptFilename = `camp.${campScriptHash}.js`;
const campHtml = readFileSync(join(campSourceDirectory, 'index.html'), 'utf8')
  .replace('__CAMP_CSS__', `/camp/assets/${campCssFilename}`)
  .replace('__CAMP_JS__', `/camp/assets/${campScriptFilename}`);

writeCompressed(join(campOutputDirectory, 'index.html'), campHtml);
writeCompressed(join(campAssetsDirectory, campCssFilename), campCss);
writeCompressed(join(campAssetsDirectory, campScriptFilename), campScript);

writeFileSync(
  join(outputDirectory, '_headers'),
  `/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n/rank/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n/rank/index.html\n  Cache-Control: public, max-age=300, must-revalidate\n/camp/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n/camp/index.html\n  Cache-Control: public, max-age=300, must-revalidate\n/fonts/*\n  Cache-Control: public, max-age=31536000, immutable\n/studios/*\n  Cache-Control: public, max-age=31536000, immutable\n/favicon.svg\n  Cache-Control: public, max-age=31536000, immutable\n/og.png\n  Cache-Control: public, max-age=86400\n/index.html\n  Cache-Control: public, max-age=300, must-revalidate\n`,
);

const htmlBytes = statSync(join(outputDirectory, 'index.html')).size;
const htmlBrotliBytes = statSync(join(outputDirectory, 'index.html.br')).size;
const cssBytes = statSync(join(assetsDirectory, cssFilename)).size;
const cssBrotliBytes = statSync(
  join(assetsDirectory, `${cssFilename}.br`),
).size;
const rankScriptBytes = statSync(
  join(rankAssetsDirectory, rankScriptFilename),
).size;
const rankScriptBrotliBytes = statSync(
  join(rankAssetsDirectory, `${rankScriptFilename}.br`),
).size;
const campScriptBytes = statSync(
  join(campAssetsDirectory, campScriptFilename),
).size;
const campScriptBrotliBytes = statSync(
  join(campAssetsDirectory, `${campScriptFilename}.br`),
).size;

console.log(
  `Static build complete: homepage HTML ${htmlBytes} B (${htmlBrotliBytes} B Brotli), CSS ${cssBytes} B (${cssBrotliBytes} B Brotli), 0 B homepage JavaScript; rank JavaScript ${rankScriptBytes} B (${rankScriptBrotliBytes} B Brotli); camp JavaScript ${campScriptBytes} B (${campScriptBrotliBytes} B Brotli).`,
);
