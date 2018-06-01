const vscode = require('vscode');
const { exec } = require('child_process');

function activate(context) {
    console.log('"kombustion-vscode" has loaded');

    ["plaintext","yaml","json"].forEach(lang => {
        vscode.languages.registerCompletionItemProvider(lang, {
            provideCompletionItems(document, position, token, context) {
                if (document.lineAt(position.line).text.trim().startsWith("Type:")) {
                    return new Promise((resolve, reject) => {
                        exec('kombustion-vs-helper', (err, stdout, stderr) => {
                            if (err) {
                                deactivate();
                                reject(err);
                                return;
                            }
        
                            let returnedCompletionItems = [];
                            let doc = JSON.parse(stdout);
        
                            doc.forEach(typ => {
                                let item = new vscode.CompletionItem(typ.Name, vscode.CompletionItemKind.Snippet);
                                let insertStr = typ.Name + "\nProperties:\n";
                                let i = 1;
                                typ.Fields.forEach(field => {
                                    if (isNaN(parseInt(field.ExampleValue))) {
                                        insertStr += "\t" + field.Name + ": \"${" + i + ":" + field.ExampleValue + "}\"\n";
                                    } else {
                                        insertStr += "\t" + field.Name + ": ${" + i + ":" + field.ExampleValue + "}\n";
                                    }
                                    
                                    // TODO: Children
                                    i++;
                                });
                                item.insertText = new vscode.SnippetString(insertStr);
                                item.documentation = new vscode.MarkdownString(typ.Description);
                                returnedCompletionItems.push(item);
                            });
        
                            resolve(returnedCompletionItems);
                        });
                        exec();
                    });
                }
                return [];
            }
        });
    });
}
exports.activate = activate;

function deactivate() {
    console.log('"kombustion-vscode" has been deactivated');
}
exports.deactivate = deactivate;