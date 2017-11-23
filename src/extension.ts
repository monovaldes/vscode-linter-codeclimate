import * as vscode from 'vscode'; 

import CodeClimateLintingProvider from './codeclimate';

export function activate(context: vscode.ExtensionContext) {
  let linter = new CodeClimateLintingProvider();	
  linter.activate(context.subscriptions);
}