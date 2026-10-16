import { existsSync } from 'node:fs';
import { delimiter, isAbsolute, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const localRoot = resolve(process.cwd(), '..', '..', '.tools', 'R-4.6.1');
const localRscript = resolve(localRoot, 'bin', process.platform === 'win32' ? 'Rscript.exe' : 'Rscript');
const executable = process.env.PMETRICS_RSCRIPT || (existsSync(localRscript) ? localRscript : 'Rscript');
const localLibrary = resolve(localRoot, 'library');
const fallbackLibrary = resolve(process.env.LOCALAPPDATA || '', 'R', 'win-library', '4.4');
const libraries = [
  ...(existsSync(localLibrary) ? [localLibrary] : []),
  ...(process.env.R_LIBS_USER ? [process.env.R_LIBS_USER] : []),
  ...(process.platform === 'win32' && existsSync(fallbackLibrary) ? [fallbackLibrary] : [])
];
const toolchain = process.platform === 'win32'
  ? ['C:\\rtools44\\usr\\bin', 'C:\\rtools44\\x86_64-w64-mingw32.static.posix\\bin'].filter(existsSync)
  : [];

const engineRoot = process.env.MIPD_ENGINE_DIR ? resolve(process.env.MIPD_ENGINE_DIR) : resolve(process.cwd(), 'tdm-engine');
const requested = process.argv[2] || 'tdm-engine/tests/pmetrics_backend_test.R';
const script = requested.startsWith('tdm-engine/')
  ? resolve(engineRoot, requested.slice('tdm-engine/'.length))
  : (isAbsolute(requested) ? requested : resolve(process.cwd(), requested));
const result = spawnSync(executable, [script, ...process.argv.slice(3)], {
  cwd: process.env.MIPD_ENGINE_DIR ? engineRoot : process.cwd(),
  encoding: 'utf8',
	timeout: process.argv.includes('--full') ? 600_000 : 180_000,
  env: {
    ...process.env,
    ...(libraries.length ? { R_LIBS_USER: libraries.join(delimiter) } : {}),
    PATH: [...toolchain, process.env.PATH || ''].join(delimiter)
  }
});

if (result.error) throw result.error;
process.stdout.write(result.stdout || '');
process.stderr.write(result.stderr || '');
process.exit(result.status ?? 1);
