// src/features/codeclimate.ts
'use strict';

import * as path from 'path';
import * as cp from 'child_process';
import * as vscode from 'vscode';

export default class CodeClimateLintingProvider{
  
  private diagnosticCollection: vscode.DiagnosticCollection;

  public dispose(): void {
		this.diagnosticCollection.clear();
    this.diagnosticCollection.dispose();
  }

  private activeDocuments = [];

  private completeTask(fileName) {
    var index = this.activeDocuments.indexOf(fileName);
    if (index > -1) {
      this.activeDocuments.splice(index, 1);
    }
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

  private lintCCStreamItem(item, textDocument, diagnostics) {
    try {
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
    } catch (error) {
      console.log(error);
      this.completeTask(textDocument.fileName);
    }
  }

  private doCClint() {
    const conf = vscode.workspace.getConfiguration();
    if (!('linter_codeclimate' in conf && conf.linter_codeclimate.enabled) || vscode.window.activeTextEditor === null ) { return; }
    const textDocument = vscode.window.activeTextEditor.document;

    if(this.activeDocuments.indexOf(textDocument.fileName) !== -1 ) return;
    this.activeDocuments.push(textDocument.fileName);

    let diagnostics: vscode.Diagnostic[] = [];
    const cwd = vscode.workspace.rootPath || path.dirname(textDocument.fileName);
    const exec_path = path.relative(cwd, textDocument.fileName);
    let resultStream = ''
    try {
      const ls = cp.spawn('codeclimate', ['analyze', '-f', 'json', exec_path], { cwd: cwd, detached: true, stdio: [ 'ignore', 'pipe', 'pipe' ] });

      ls.stdout.on('data', (data) => { resultStream += data; });
      
      ls.stderr.on('data', (data) => { console.log(`Codeclimate Extension Execution Failed:\n${data}`) });
      
      ls.on('close', () => {
        if (resultStream !== '') {
          JSON.parse(resultStream).forEach( item => { if ('severity' in item) { this.lintCCStreamItem(item, textDocument, diagnostics) } });
          this.diagnosticCollection.set(textDocument.uri, diagnostics);
        }
        this.completeTask(textDocument.fileName);
      });
    } catch (error) {
      console.log(`Codeclimate Extension Execution Failed:\n${error}`)
      this.completeTask(textDocument.fileName);
    }
    
  }
}