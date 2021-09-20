const fs = require('fs').promises;
const path = require('path');
const { spawnSync } = require('child_process');

const PACKAGE_JSON = './package.json';

const preparePackage = async (fullDir) => {
  const packagePath = path.join(fullDir, PACKAGE_JSON);
  const package = JSON.parse(await fs.readFile(packagePath, 'utf-8'));
  delete package.types;
  package.main = package.main.replace(/^build\//, '').replace('.js', '.ts');
  await fs.writeFile(packagePath, JSON.stringify(package, null, 4), 'utf-8');

  for (const [inputPath, outputPath] of Object.entries(package.browser || {})) {
    const fullInputPath = path.join(fullDir, inputPath);
    try {
      await fs.stat(fullInputPath);
    } catch (error) {
      continue;
    }
    const relativeOutputPath = path.relative(
      inputPath.replace('index.ts', ''),
      outputPath.replace('index.ts', ''),
    );
    await fs.writeFile(
      fullInputPath,
      `export * from "./${relativeOutputPath}"`,
    );
  }
};

const scanDir = async (inputDir) => {
  const dirs = await fs.readdir(inputDir);
  for (const dir of dirs) {
    const fullDir = path.join(inputDir, dir);
    const stat = await fs.stat(fullDir);
    if (!stat.isDirectory()) continue;
    await preparePackage(fullDir);
  }
};

const main = async () => {
  await fs.rm('./src/opentelemetry-js/packages/template', {
    recursive: true,
    force: true,
  });
  spawnSync('npm', ['run', 'version'], { cwd: './src/opentelemetry-js-api' });
  await scanDir('./src/opentelemetry-js/packages');
  await scanDir('./src/opentelemetry-js-contrib/plugins/web');
  await preparePackage('./src/opentelemetry-js-api');
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
