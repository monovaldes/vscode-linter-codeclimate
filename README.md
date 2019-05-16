# linter-codeclimate README

This linter works as an extension to integrate CodeClimate CLI into VSCode. It
calls the "codeclimate analyze" command over opened and saved files in your
workspace.

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

## Running inside of a Docker Container

1. Forward your `/var/run/docker.sock` into your container to allow the
  container to access your system Docker daemon. The easiest way to do this
  is to add `-v /var/run/docker.sock:/var/run/docker.sock` to your start
  options. If you are using `docker-compose`, you can add a `volume` to mount
  it as well.

2. Install Docker or the Codeclimate CLI inside of your Docker container. If
  you have a Debian based container, you can use the following:

    ```bash
    $ # Docker
    $ apt-get update \
      && apt-get install -y apt-transport-https ca-certificates curl gnupg-agent software-properties-common lsb-release \
      && curl -fsSL https://download.docker.com/linux/$(/usr/bin/lsb_release -is | tr '[:upper:]' '[:lower:]')/gpg | apt-key add - 2>&1 >/dev/null \
      && add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/$(/usr/bin/lsb_release -is | tr '[:upper:]' '[:lower:]') $(lsb_release -cs) stable" \
      && apt-get update \
      && apt-get install -y docker-ce-cli
    $ # Codeclimate CLI
    $ cd /tmp \
      && curl -L https://github.com/codeclimate/codeclimate/archive/master.tar.gz | tar xz \
      && cd codeclimate-master \
      && make install \
      && codeclimate engines:install
    ```

3. Set the `$CODECLIMATE_CODE` environment variable to the real path to your
  workspace folder. For example, if you code lives on `/home/user/dev/project`
  on the host machine and `/project` inside of your Docker container, you would
  set `$CODECLIMATE_CODE` to `/home/user/dev/project`

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

### 0.1.0

- included vscode-container support, kudos to @AngellusMortis
-----------------------------------------------------------------------------------------------------------
