import { existsSync } from "fs";
import {
  HoverProvider as BaseHoverProvider,
  Hover,
  MarkdownString,
  Position,
  TextDocument,
  Uri,
  workspace,
  ProviderResult,
} from "vscode";
import { nameToIndexPath, nameToPath } from "../functions/files";

export default class HoverProvider implements BaseHoverProvider {
  public provideHover(
    doc: TextDocument,
    position: Position
  ): ProviderResult<Hover> {
    const config = workspace.getConfiguration("blade-components");
    const regex = new RegExp(config.get<string>("goto-regex") ?? "(?<=<x-)(?!slot)[a-z.-]+");
    const range = doc.getWordRangeAtPosition(position, regex);

    if (!range) {
      return;
    }

    const componentName = doc.getText(range);
    const workspacePath = workspace.getWorkspaceFolder(doc.uri)?.uri.fsPath;
    let componentPath = nameToPath(componentName);
    
    if (!existsSync(workspacePath + componentPath)) {
      componentPath = nameToIndexPath(componentName);
      
      if (!existsSync(workspacePath + componentPath)) {
        return;
      }
    }

    const lookUpUri = `[${componentPath}](${Uri.file(
      workspacePath + componentPath
    )})`;

    return new Hover(new MarkdownString(`*${componentName}*: ${lookUpUri}`));
  }
}
