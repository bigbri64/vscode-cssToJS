import { window, commands, Disposable, ExtensionContext, TextDocument } from 'vscode';

// This method is called when your extension is activated. Activation is
// controlled by the activation events defined in package.json.
export function activate(context: ExtensionContext) {

    let cssToJS = new CSSToJS();

    let disposable = commands.registerCommand('extension.convertCSS', () => {
        cssToJS.convertCSS();
    });
    context.subscriptions.push(cssToJS);
    context.subscriptions.push(disposable);
}

class CSSToJS {

    public convertCSS() {

        let editor = window.activeTextEditor;
        if (editor) {
            let doc = editor.document;
            if (doc) {
                let text = doc.getText(editor.selection);
                console.log(text)
                const reDeHyphenKey = /-(\w)(.*:)/g;
                const reValue = /:\s*["']?([\w-(),\s.%#"']*)["']?;?/g;
                text = text.replace(reDeHyphenKey, (m, p1, p2) => {
                    return p1.toUpperCase() + p2;
                });
                text = text.replace(reValue, (m, p1) => {
                    return ': "' + p1.replace(/([\"\'])/g,'\\'+'$1') + '",'
                });
                console.log(text);
                editor.edit((builder) => {builder.replace(editor.selection, text)});
            }
        }
    }

    dispose() {
    }
}
