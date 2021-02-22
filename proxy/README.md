# Adlib Cloud App Proxy

API Proxy for Ex Libris Cloud Apps

## Introduction
This Lambda function provides an API proxy for use by Ex Libris Cloud Apps to access external APIs via a proxy. The API can be hosted on AWS infrastructure.

## Features
* CORS support
* Validation of Cloud App [authentication token](https://developers.exlibrisgroup.com/cloudapps/docs/api/events-service/#getAuthToken)
* Ability to limit allowed Cloud Apps and institutions (see [Configuration](#configuration) below)
* Proxy of API request and response

## Deployment to AWS
To deploy to AWS, follow the steps below. (These instructions assume you have an [AWS account](https://aws.amazon.com/), and that the [AWS CLI is installed](https://aws.amazon.com/cli/) and [configured](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html).

1. Clone repository
```
$ git clone https://github.com/ExLibrisGroup/alma-adlib
```
2. Install dependencies
```
$ cd alma-adlib/proxy/dependencies/nodejs/ && npm install && cd ../../
```
3. Create a `.npmrc` file with the following content:
```
s3_bucket_name = BUCKET_NAME # Name of bucket in your AWS account to upload the assets to
region = eu-central-1 # Region to deploy to
cloud_formation_stack_name = CloudAppProxy # Stack name
allowed_apps =  # Optional list of allowed apps
allowed_inst_codes =  # Optional list of allowed institution codes
```
4. Run the following to deploy the CloudFormation template. The output will include the URL of the proxy. 
```
$ npm run deploy
```
5. The host and authentication ([basic authentication string](https://www.blitter.se/utils/basic-authentication-header-generator/)) are provided by one of two methods:
   * The following environment variables: `PROXY_HOST` and `PROXY_AUTH`
   * The following header values: `X-Proxy-Host` and `X-Proxy-Auth`

Don't forget to add the proxy URL to the [`contentSecurity` section of the manifest](https://developers.exlibrisgroup.com/cloudapps/docs/manifest/).

## Configuration
The following optional environment variables are supported in the Lambda function. They can also be set in the `.npmrc` file as described above.
* `CLOUDAPP_AUTHORIZER_ALLOWED_APPS`: Comma separated list of allowed Cloud App IDs (Github username/repository name, e.g. ExLibrisGroup/alma-hathitrust-availability)
* `CLOUDAPP_AUTHORIZER_ALLOWED_INST_CODES`: Comma separated list of allowed institution codes (e.g. 01MYUNI_INST1, 01MYUNI_INST2)

## Usage
To use the proxy once it's deployed, contruct the HTTP request with the `X-Proxy-Host` and optional `X-Proxy-Auth` headers as described above and provide a valid Cloud App authorization token. 

For example:
```
$ curl -v \
-H 'X-Proxy-Host: apps01.ext.exlibrisgroup.com' \
-H 'Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImV4bGhlcC0wMSJ9...' \
https://api-ap.exldevnetwork.net/proxy/apps.json

< HTTP/2 200 
< access-control-allow-origin: *
< accept-ranges: bytes
< access-control-allow-methods: GET, POST, PUT, DELETE, OPTIONS
< access-control-allow-headers: authorization, content-type, x-proxy-host, x-proxy-auth

[
   {

   }
]
```

