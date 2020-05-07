# mock-sso

Simple and stupid mock for an OAUTH2 Ip.

### Installation

    npm install -g mock-sso


### Basic Usage

    $ mock-sso
    mock-sso listening on 0.0.0.0:5000

### Understanding the options

    $ mock-sso -d 

This will dump the config as it will be used. Try this ...
 
    $ mock-sso -d -e different@example.com


### Saving your config

    $ mock-sso -e email@example.com -c contact@example.com -d > saved-config.json

### Reusing saved config

    $ mock-sso saved-config.json -d


### Help

    $ mock-sso --help

    mock-sso [options] [saved_config_file]
    version: 0.0.10

    -p  (Optional) Port number - defaults to 5000

    -h  (Optional) Host address - defaults to 0.0.0.0

    -e  (Optional) SSO email address. Defaults to value from config

    -c  (Optional) SSO contact email address

    -b  (Optional) Sets user email and user contact_email to the provided value

    -i (Optional) GUID for the SSO user. Will default to a new GUID if missing.

    -d (Optional) Dump config based on switches and any config files and exit

    saved_config_file (Optional) a json file containing the relevant settings





