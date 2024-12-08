import * as fs from "fs/promises";
import * as path from "path";
import { undot } from "./strings";
import { BladeProp, PhpVariable } from "../interfaces/php";
import { GlobPattern, workspace } from "vscode";

export async function fileContainsVariable(
    filePath: string,
    variableName: string
): Promise<boolean | null | undefined> {
    const fileContents = await fs.readFile(filePath, { encoding: "utf-8" });

    return fileContents.includes(variableName);
}

export async function getVariablesFromClassFile(filePath: string) {
    const fileContents = await fs.readFile(filePath, { encoding: "utf-8" });

    return Array.from(fileContents.matchAll(/public\s*(\w*)\s*\$(\w+)/g)).map(
        (val) => new PhpVariable(val[1], val[2] ?? null)
    );
}

export async function getPropsFromBladeFile(filePath: string): Promise<BladeProp[]> {

    const fileContents = await fs.readFile(filePath, { encoding: 'utf-8' });

    const rawProps = /@props\(\[\s*([\'\w,\s=>\[\]\.\\\:\(\)\_\"]+)\]\)/gm.exec(fileContents);

    if (rawProps !== null) {

        try {
            if (rawProps[1].includes(",")) {
                const propsArray = rawProps[1]
                    .split(/,(?=\w*\s*')/)
                    .filter((string) => string !== '');

                let bladeProps = propsArray.map((prop) => {
                    return BladeProp.fromRawPropString(prop);
                });

                return bladeProps;
            } else {
                return [BladeProp.fromRawPropString(rawProps[1])];
            }
        } catch (error) {
            console.error(error);
            console.info(rawProps, filePath);
        }

    }

    return Promise.resolve([]);
}

export function pathFromDot(string: string): string {
    return undot(string).join(path.sep);
}

export async function getBladeComponentFiles() {
    const config = workspace.getConfiguration("blade-components");
    const pattern = config.get<GlobPattern>("blade-components-paths") ?? "**/resources/views/components/**/*.blade.php";

    return await workspace.findFiles(pattern,"**/vendor/**");
}

export async function getClassComponentFiles() {
  const config = workspace.getConfiguration("blade-components");
  const pattern = config.get<GlobPattern>("class-components-paths") ?? "**/View/Components/**/*.php";

  return await workspace.findFiles(pattern,"**/vendor/**");
}

export function nameToPath(path: string): string {
  const config = workspace.getConfiguration("blade-components");
  const gotoFolderPrefix = config.get<GlobPattern>("goto-folder") ?? "/resources/views/components/";

  return `${gotoFolderPrefix}${path.replace(/\./g, "/")}.blade.php`;
}

export function nameToIndexPath(path: string): string {
  const config = workspace.getConfiguration("blade-components");
  const gotoFolderPrefix = config.get<GlobPattern>("goto-folder") ?? "/resources/views/components/";

  return `${gotoFolderPrefix}${path.replace(/\./g, "/")}/index.blade.php`;
}