require('dotenv').config();
const utils = require('./utils');
const { auth } = require('./authorizer/index');
const fetch = require('node-fetch');

const handler = async (event, context) => {
  let result;
  if (event.requestContext && event.requestContext.http.method == 'OPTIONS') {
    result = { statusCode: 204 };
    return utils.cors(result, event);
  }
  /* Validate token */
  const token = auth(event.headers.authorization);
  if (!token) {
    result = utils.responses.unauthorized();
    return utils.cors(result, event);
  }

  const PROXY_HOST = process.env.PROXY_HOST || event.headers['x-proxy-host'];
  const PROXY_AUTH = process.env.PROXY_AUTH || event.headers['x-proxy-auth'];
  let customRequestHeader;
  try {
    if ( event.headers ) {
      customRequestHeader = event.headers;
    }
    if (PROXY_AUTH) customRequestHeader['authorization'] = `Basic ${PROXY_AUTH}`;
    customRequestHeader['host'] = PROXY_HOST;
    const params = {
      method: event.requestContext.http.method,
      headers: customRequestHeader,
      body: event.body
    };
    const url = `https://${PROXY_HOST}${event.rawPath}?${event.rawQueryString}`;
    const response = await fetch(url, params);
    const textResponse = await response.text();
    let responseHeaders = {};
    for (const [key, value] of response.headers.entries()) {
      if (key != 'content-encoding') {
        responseHeaders[key] = value;
      }
    }
    result = {
      statusCode: response.status, 
      body: textResponse,
      headers: responseHeaders
    }
  } catch (e) {
    console.error('error', e);
    result = utils.responses.error(e.message);
  }
  return utils.cors(result, event);
};


module.exports = { handler };