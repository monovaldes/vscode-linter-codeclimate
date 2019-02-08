# linter-codeclimate README

This linter works as an extension to integrate CodeClimate CLI into VSCode. It calls the "codeclimate analyze" command over opened and saved files in your workspace.

## Requirements

CodeClimate CLI container, engines, and executable installed in your system:
ref: https://github.com/codeclimate/codeclimate

## Extension Settings

This extension is disabled by default.

To enable it do so in workspace settings:
{
  (...)
  "linter_codeclimate.enabled": true
}

## Release Notes
### 0.0.1
- Initial release

### 0.0.6
- fixed rubocop error location display

### 0.0.8
- correctly forked linting process

### 0.0.9
- added TypeScript Support
- allows non-workspaced file check (as long as filedir has others +rx permissions)

### 0.0.10
- updated because of security reasons
-----------------------------------------------------------------------------------------------------------