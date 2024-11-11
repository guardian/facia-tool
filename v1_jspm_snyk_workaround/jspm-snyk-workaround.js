const fs = require("fs");

const outputDirName = "result"
const outputPath = `${outputDirName}/package.json`;

const packageJson = JSON.parse(String(fs.readFileSync("../package.json")));

const jspmDependencies = Object.fromEntries(
    Object.values(packageJson.jspm.dependencies) // values because we don't care about what JSPM called them (i.e. the keys)
    .filter(_ => !_.includes("systemjs"))
    .map(jspmDepString => {
        const [source, nameAtVersion] = jspmDepString.split(":");
        const [name, version] = nameAtVersion.split("@");
        const finalVersion = name.endsWith("panda-session") ? `v${version}` : version;
        return [
            name.split("/").slice(-1), // last part (e.g. 'fastselect' if 'dbrekalo/fastselect')
            source === "github" ? `git+https://github.com/${name}.git#${finalVersion}` : finalVersion
        ]
    })
);

const newPackageJson = {
    ...packageJson,
    dependencies: {
        ...packageJson.dependencies,
        ...jspmDependencies
    }
};

fs.mkdirSync(outputDirName, {recursive: true});
fs.writeFileSync(outputPath, JSON.stringify(newPackageJson, null, 2));

console.log(`Wrote alternate package.json for V1 to v1_jspm_workaround/${outputPath} , which surfaces the JSPM dependencies`)
