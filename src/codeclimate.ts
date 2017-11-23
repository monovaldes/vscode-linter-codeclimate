// src/features/codeclimate.ts
'use strict';

import * as path from 'path';
import * as cp from 'child_process';
import ChildProcess = cp.ChildProcess;

import * as vscode from 'vscode';

export default class CodeClimateLintingProvider{
  
  private diagnosticCollection: vscode.DiagnosticCollection;

  public dispose(): void {
		this.diagnosticCollection.clear();
    this.diagnosticCollection.dispose();
  }
  
  public activate(subscriptions: vscode.Disposable[]) {
    subscriptions.push(this);
    this.diagnosticCollection = vscode.languages.createDiagnosticCollection();

    vscode.workspace.onDidOpenTextDocument(this.doCClint, this, subscriptions);
		vscode.workspace.onDidCloseTextDocument((textDocument)=> {
			this.diagnosticCollection.delete(textDocument.uri);
		}, null, subscriptions);
    vscode.workspace.onDidSaveTextDocument(this.doCClint, this);
    vscode.workspace.textDocuments.forEach(this.doCClint, this);
  }

  private doCClint() {
    const conf = vscode.workspace.getConfiguration();
    if (!('linter_codeclimate' in conf && conf.linter_codeclimate.enabled) || vscode.window.activeTextEditor === null) { return; }
    const textDocument = vscode.window.activeTextEditor.document;

    let decoded = ''
    let diagnostics: vscode.Diagnostic[] = [];
    const exec_path = path.relative(vscode.workspace.rootPath, textDocument.fileName);
    const exec_str = `codeclimate analyze -f json ${exec_path}`
    let out = ''
    try {
      out = cp.execSync(exec_str, {cwd: vscode.workspace.rootPath}).toString();
    } catch (error) {
      console.log(`Codeclimate Extension Execution Failed:\n${error}`)
    }
    JSON.parse(out).forEach( item => {
      try {
        if ('severity' in item) {
          let severity = item.severity.toLowerCase() === "minor" ? vscode.DiagnosticSeverity.Warning : vscode.DiagnosticSeverity.Error;
          let message = `[codeclimate/${item.engine_name} - ${item.categories.toString()}] ${item.description}`;
          if (item.check_name === "similar-code") {
            message += '\nFiles:\n';
            item.other_locations.forEach( it => {
              message += ` ${it.path} [${it.lines.begin}-${it.lines.end}]\n`
            })
          }
          const loc = item.location
          let range = null;
          if ('positions' in loc) {
            range = new vscode.Range(item.location.positions.begin.line - 1, item.location.positions.begin.column -1, item.location.positions.begin.line - 1, 80);
          } else if ('lines' in loc) {
            range = new vscode.Range(item.location.lines.begin - 1, 0, item.location.lines.begin - 1, 80);
          }
          let diagnostic = new vscode.Diagnostic(range, message, severity);
          diagnostics.push(diagnostic);
        }
      } catch (error) {
        console.log(error);
      }
    });
    this.diagnosticCollection.set(textDocument.uri, diagnostics);
  }
}