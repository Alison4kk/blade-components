import { Disposable, ExtensionContext, commands, languages, window, workspace } from "vscode";
import TagsProvider from "./providers/TagsProvider";
import AttributesProvider from "./providers/AttributesProvider";
import { updateComponentCache } from "./functions/cache";
import HoverProvider from "./providers/hoverProvider";
import LinkProvider from "./providers/linkProvider";

export function activate(context: ExtensionContext) {
  updateComponentCache(context);


  const config = workspace.getConfiguration("blade-components");
  const languagesToEnable = config.get<string[]>("languages", ["blade"]);

  const registerLanguages = languagesToEnable ?? ["blade"];
  const newSubscriptions = [];

  for (const language of registerLanguages) {
    newSubscriptions.push(
      languages.registerCompletionItemProvider(
        language,
        new TagsProvider(context),
        "x"
      ),

      languages.registerCompletionItemProvider(
        language,
        new AttributesProvider(context),
        ":"
      )
    );

    let hover = languages.registerHoverProvider(language, new HoverProvider());
    newSubscriptions.push(hover);

  }
  context.subscriptions.push(...newSubscriptions);

  commands.registerCommand('blade-components.refreshCache', () => {
    updateComponentCache(context);
  });

  // let link = languages.registerDocumentLinkProvider(
  //   "blade",
  //   new LinkProvider()
  // );

  console.log("blade-components activated");
}

// this method is called when your extension is deactivated
export function deactivate(context: ExtensionContext) {
  console.log("blade-components deactivated");
}
