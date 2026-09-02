import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const sourceFont = process.argv[2];
const outputFont = resolve(
  process.argv[3] ?? 'app/fonts/noto-sans-sc-spark-v1.woff2',
);

if (!sourceFont) {
  console.error(
    'Usage: node scripts/subset-noto-font.mjs /path/to/NotoSansSC-VF.otf [output.woff2]',
  );
  process.exit(1);
}

const sourceFiles = process.argv.slice(4);
if (sourceFiles.length === 0) {
  sourceFiles.push(
    'app/page.tsx',
    'app/layout.tsx',
    'public/rank/index.html',
    'public/rank/rank.js',
  );
}
const sourceText = sourceFiles
  .map((file) => readFileSync(file, 'utf8'))
  .join('\n');
const glyphs = [
  ...new Set(
    Array.from(sourceText).filter((character) => character.codePointAt(0) > 127),
  ),
]
  .sort((left, right) => left.codePointAt(0) - right.codePointAt(0))
  .join('');

const temporaryDirectory = mkdtempSync(join(tmpdir(), 'spark-font-'));
const glyphFile = join(temporaryDirectory, 'glyphs.txt');
writeFileSync(glyphFile, glyphs);

const result = spawnSync(
  'pyftsubset',
  [
    resolve(sourceFont),
    `--text-file=${glyphFile}`,
    `--output-file=${outputFont}`,
    '--flavor=woff2',
    '--layout-features=*',
    '--glyph-names',
    '--symbol-cmap',
    '--legacy-cmap',
    '--notdef-glyph',
    '--notdef-outline',
    '--recommended-glyphs',
    '--name-IDs=*',
    '--name-legacy',
    '--name-languages=*',
  ],
  { stdio: 'inherit' },
);

rmSync(temporaryDirectory, { recursive: true, force: true });

if (result.error) {
  console.error(
    'Unable to run pyftsubset. Install fonttools and brotli first.',
  );
  throw result.error;
}

if (result.status !== 0) process.exit(result.status ?? 1);

console.log(
  `Generated ${outputFont} with ${Array.from(glyphs).length} non-ASCII characters.`,
);
