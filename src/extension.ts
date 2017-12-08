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
                // Get the selected text
                let text = doc.getText(editor.selection);
                // If the line ends with a comma it's probably a js object
                const firstLine = text.split('\n')[0].trim();
                if (firstLine[firstLine.length - 1] === ',') {
                    const reReHyphenKey = /([A-Z])/g;
                    const reValue = /:\s*["']?([\w-(),\s.%#"'!]*)["'],?[\n\r]/g;
                    // Replace capital letters with hyphens and lowercase letters
                    text = text.replace(reReHyphenKey, (m, p1) => {
                        return "-" + p1.toLowerCase();
                    });
                    // Remove the quotes and remove string escaping
                    text = text.replace(reValue, (m, p1) => {
                        return ': ' + p1.replace(/([\\])/g,'') + ';\n'
                    });
                } else {
                    const reDeHyphenKey = /-(\w)(.*:)/g;
                    const reValue = /:\s*["']?([\w-(),\s.%#"'!]*)["']?;?[\n\r]/g;
                    // Replace hyphens and the next letter with an uppercase letter
                    while (text.search(reDeHyphenKey) !== -1) {
                        text = text.replace(reDeHyphenKey, (m, p1, p2) => {
                            return p1.toUpperCase() + p2;
                        });
                    }
                    // Surround the value with quotes and escape any quotes in the value
                    text = text.replace(reValue, (m, p1) => {
                        return ': "' + p1.replace(/([\"\'])/g,'\\'+'$1') + '",\n'
                    });
                }
                editor.edit((builder) => {builder.replace(editor.selection, text)});
            }
        }
    }

    dispose() {
    }
}
