import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { delimiter, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { exportPmetrics } from '../src/lib/lego/pmetrics.js';

const executable = process.env.PMETRICS_RSCRIPT || resolve(
  process.cwd(), '..', '..', '.tools', 'R-4.6.1', 'bin',
  process.platform === 'win32' ? 'Rscript.exe' : 'Rscript'
);

if (!existsSync(executable)) {
  console.error(`Pmetrics Rscript not found: ${executable}`);
  process.exit(1);
}

const spec = {
  version: 3,
  nodes: [{ id: 1, kind: 'central', name: 'Central', vol: 30, dose: 100, inputType: 'bolus', tlag: 0 }],
  edges: [{ from: 1, to: 'OUT', kinetics: 'first_order', k: 0.2 }],
  covariates: [],
  population: {
    iivVariances: { k_Central_e: 0.1 },
    residualError: { type: 'proportional', proportional: 0.15, additive: 0 }
  }
};

const exported = exportPmetrics({
  spec,
  parameters: [
    { name: 'k_Central_e', value: 0.2 },
    { name: 'v_Central', value: 30 }
  ],
  secondary: [
    'k_Central_e = TV_k_Central_e',
    'v_Central = TV_v_Central'
  ],
  equations: { Central: '-k_Central_e * Central' },
  observed: 'Central'
});

assert.equal(exported.issue, '');
const lesson = readFileSync('src/content/chapters/08c_pmetrics-nonparametric.md', 'utf8');
const lessonModel = [...lesson.matchAll(/```r\s*([\s\S]*?)```/g)].find(match => match[1].includes('PM_model$new'))[1].split('dat <-')[0];
const rCode = `${exported.code}
model <- PM_model$new(pmetrics_definition)

# Execute the exported model, not only its constructor. For a 100-unit IV bolus,
# Ke = 0.2 /h and V = 30 L, C(t) = 100 * exp(-0.2*t) / 30.
template <- PM_data$new(data.frame(
  id = 1,
  time = c(0, 1, 2, 4, 8, 12),
  dose = c(100, rep(NA_real_, 5)),
  input = c(1, rep(NA_integer_, 5)),
  out = c(NA_real_, rep(0, 5))
), quiet = TRUE)
theta <- matrix(
  c(0.2, 30),
  nrow = 1,
  dimnames = list(NULL, c("TV_k_Central_e", "TV_v_Central"))
)
simulation <- model$sim(data = template, theta = theta, quiet = TRUE)
expected <- 100 * exp(-0.2 * simulation$time) / 30
cat("PMETRICS_NATIVE_MAX_DELTA=", max(abs(simulation$out - expected)), "\\n")
stopifnot(
  is.data.frame(simulation),
  nrow(simulation) == 5,
  max(abs(simulation$out - expected)) < 1e-5
)

# Complete examples from the official NPAG and NPAG_cov tutorial chapters.
tutorial_two <- PM_model$new(
  pri = list(
    Ka = ab(0.1, 0.9), Ke = ab(0.001, 0.1), K23 = ab(0, 5),
    K32 = ab(0, 5), V0 = ab(30, 120), lag1 = ab(0, 4)
  ),
  cov = list(
    wt = interp(), africa = interp("none"), age = interp(),
    gender = interp("none"), height = interp()
  ),
  eqn = function(){ two_comp_bolus },
  lag = function(){ lag[1] = lag1 },
  out = function(){
    V = V0 * (wt/70)
    Y[1] = X[2]/V
  },
  err = list(proportional(5, c(0.02, 0.05, -0.0002, 0)))
)
tutorial_three <- PM_model$new(
  pri = list(
    Ka = ab(0.1, 0.9), Ke = ab(0.001, 0.1), V0 = ab(30, 120),
    K23 = ab(0.001, 0.5), K24 = ab(0.001, 0.5),
    K32 = ab(0.001, 0.5), K42 = ab(0.001, 0.5), lag1 = ab(0, 4)
  ),
  cov = list(wt = interp()),
  eqn = function(){ three_comp_bolus },
  lag = function(){ lag[1] = lag1 },
  out = function(){
    V = V0 * (wt/70)
    Y[1] = X[2]/V
  },
  err = list(proportional(5, c(0.02, 0.05, -0.0002, 0)))
)
stopifnot(
  inherits(model, "PM_model"),
  inherits(tutorial_two, "PM_model"),
  inherits(tutorial_three, "PM_model")
)
cat("PMETRICS_NATIVE_COMPILE_OK\\n")
cat("PMETRICS_NATIVE_SIMULATION_OK\\n")

${lessonModel}
lesson_sim <- mod$sim(data = template,
  theta = matrix(c(0.2, 30), nrow = 1, dimnames = list(NULL, c("ke", "v"))), quiet = TRUE)
stopifnot(max(abs(lesson_sim$out - 100 * exp(-0.2 * lesson_sim$time) / 30)) < 1e-5)
cat("PMETRICS_COURSE_EXAMPLE_OK\\n")
`;
const oldLibrary = resolve(process.env.LOCALAPPDATA || '', 'R', 'win-library', '4.4');
const newLibrary = resolve(process.cwd(), '..', '..', '.tools', 'R-4.6.1', 'library');
const localAppData = resolve(process.cwd(), '..', '..', '.tools', 'appdata');
mkdirSync(localAppData, { recursive: true });
const result = spawnSync(executable, ['-'], {
  input: rCode,
  encoding: 'utf8',
  env: {
    ...process.env,
    APPDATA: localAppData,
    R_LIBS_USER: [newLibrary, process.env.R_LIBS_USER || oldLibrary].join(delimiter)
  },
  timeout: 120_000
});

if (result.error) throw result.error;
if (result.status !== 0) {
  console.error(result.stdout);
  console.error(result.stderr);
  process.exit(result.status ?? 1);
}
assert.match(result.stdout, /PMETRICS_NATIVE_COMPILE_OK/);
assert.match(result.stdout, /PMETRICS_NATIVE_SIMULATION_OK/);
assert.match(result.stdout, /PMETRICS_COURSE_EXAMPLE_OK/);
console.log('Pmetrics compiled and simulated the exported model and course example, and compiled the complete tutorial library models successfully.');
