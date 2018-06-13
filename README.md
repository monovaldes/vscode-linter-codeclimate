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

Initial release!

### 0.0.7

- Async calls to the codeclimate containers
- Avoid multiple scans over the same file

-----------------------------------------------------------------------------------------------------------