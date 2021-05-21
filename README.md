# mock-sso

Simple and stupid mock for an OAUTH2 Ip.

### Installation

    npm install -g mock-sso

### Basic Usage

    $ mock-sso
    mock-sso listening on 0.0.0.0:5000

## Docker

    docker build -t mock-sso .
    docker run -e PORT=5000 --name sso mock-sso


