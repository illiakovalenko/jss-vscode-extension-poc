// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { window, workspace, commands, ExtensionContext } from "vscode";
import path from "path";
import { setup } from "@sitecore-jss/sitecore-jss-dev-tools";

// https://miro.com/app/board/uXjVM17z-bk=/

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "iki-poc" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = commands.registerCommand("iki-poc.helloWorld", async () => {
    // The code you place here will be executed every time your command is executed
    // Display a message box to the user

    const options: {
      label: string;
      description: string;
      exec: (context: ExtensionContext) => Promise<void>;
    }[] = [
      {
        label: "jss setup",
        description: "",
        exec: async (context) => {
          const instanceType = await window.showQuickPick(
            ["Local machine", "Network share"],
            {
              title:
                "Is your Sitecore instance on this machine or accessible via network share?",
              ignoreFocusOut: true,
            }
          );

          let instancePath;

          if (instanceType === "Local machine") {
            instancePath = await window.showInputBox({
              placeHolder: "c:\\inetpub\\wwwroot\\my.siteco.re",
              prompt: "Path to the Sitecore folder",
              validateInput(value) {
                if (!/[A-z]/.test(value)) {
                  return "Invalid input";
                }
              },
              ignoreFocusOut: true,
            });
          }

          const layoutServiceHost = await window.showInputBox({
            placeHolder: "http://myapp.local.siteco.re",
            prompt:
              "Sitecore hostname (see /sitecore/config; ensure added to hosts)",
            validateInput(value) {
              if (!/^https?:\/\/(.*)/.test(value)) {
                return "Invalid input. Must start with http(s)";
              }
            },
            ignoreFocusOut: true,
          });

          const deployUrl = await window.showInputBox({
            placeHolder: `${layoutServiceHost}/sitecore/api/jss/import`,
            value: `${layoutServiceHost}/sitecore/api/jss/import`,
            prompt: "Sitecore import service URL",
            validateInput(value) {
              if (!/^https?:\/\/(.*)/.test(value)) {
                return "Invalid input. Must start with http(s)";
              }
            },
            ignoreFocusOut: true,
          });

          const apiKey = await window.showInputBox({
            placeHolder: `{110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9}`,
            prompt: "Sitecore API Key (ID of API key item)",
            validateInput(value) {
              if (
                !/^{?[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}}?$/i.test(
                  value
                )
              ) {
                return "Invalid API Key. Should be a GUID / Sitecore Item ID";
              }
            },
            ignoreFocusOut: true,
          });

          let deploySecret = await window.showInputBox({
            prompt:
              "Please enter your deployment secret (32+ random chars; or press enter to generate one)",
            validateInput(value) {
              if (!/^(.{32,}|)$/.test(value)) {
                return "Invalid secret. Should be blank or at least 32 random characters";
              }
            },
            ignoreFocusOut: true,
          });

          if (!deploySecret) {
            deploySecret =
              Math.random().toString(36).substring(2, 15) +
              Math.random().toString(36).substring(2, 15) +
              Math.random().toString(36).substring(2, 15) +
              Math.random().toString(36).substring(2, 15);
          }

          const configFile = path.join(__dirname, "..", "scjssconfig.json");

          setup(false, path.join(__dirname, "..", "scjssconfig.json"), {
            layoutServiceHost,
            apiKey,
            deploySecret,
            deployUrl,
            instancePath,
          });

          workspace.openTextDocument(configFile).then((doc) => {
            window.showTextDocument(doc);
          });
        },
      },
      {
        label: "jss deploy items",
        description: "",
        exec: async (context) => {},
      },
      {
        label: "jss deploy app",
        description: "",
        exec: async (context) => {},
      },
      {
        label: "jss scaffold",
        description: "",
        exec: async (context) => {},
      },
      {
        label: "jss start",
        description: "",
        exec: async (context) => {},
      },
    ];

    const quickPick = window.createQuickPick();
    quickPick.items = options.map((option) => ({
      label: option.label,
      description: option.description,
    }));
    quickPick.onDidChangeSelection((selection) => {
      if (selection[0]) {
        const option = options.find(
          (option) => option.label === selection[0].label
        );
        option && option.exec(context).catch(console.error);
        quickPick.dispose();
      }
    });
    quickPick.onDidHide(() => quickPick.dispose());
    quickPick.show();
  });

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}


