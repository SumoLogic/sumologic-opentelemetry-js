const fs = require("fs").promises;
const path = require("path");

const PACKAGE_JSON = "./package.json";

const scanDir = async (inputDit) => {
  const dirs = await fs.readdir(inputDit);
  for (const dir of dirs) {
    const fullDir = path.join(inputDit, dir);
    const stat = await fs.stat(fullDir);
    if (!stat.isDirectory()) continue;
    const packagePath = path.join(fullDir, PACKAGE_JSON);
    const package = JSON.parse(await fs.readFile(packagePath, "utf-8"));
    delete package.types;
    package.main = package.main.replace(/^build\//, "").replace(".js", ".ts");
    await fs.writeFile(packagePath, JSON.stringify(package, null, 4), "utf-8");

    for (const [inputPath, outputPath] of Object.entries(
      package.browser || {}
    )) {
      const fullInputPath = path.join(fullDir, inputPath);
      try {
        await fs.stat(fullInputPath);
      } catch (error) {
        continue;
      }
      const relativeOutputPath = path.relative(
        inputPath.replace("index.ts", ""),
        outputPath.replace("index.ts", "")
      );
      await fs.writeFile(
        fullInputPath,
        `export * from "./${relativeOutputPath}"`
      );
    }
  }
};

const main = async () => {
  await scanDir("./src/opentelemetry-js/packages");
  await scanDir("./src/opentelemetry-js-contrib/plugins/web");
};

main();
