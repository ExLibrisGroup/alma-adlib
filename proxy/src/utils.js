const cors = ( response, event ) => {
  if (!response.headers) response.headers = {};
  response.headers['access-control-allow-origin'] = getOrigin(event);
  response.headers['access-control-allow-credentials'] = 'true';
  response.headers['access-control-allow-headers'] = 'authorization, content-type, x-proxy-host, x-proxy-auth';
  response.headers['access-control-allow-methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
  return response;
}

const responses = {
  success: body => ({ statusCode: 200, body: JSON.stringify(body) }),
  unauthorized: () => ({ statusCode: 401, body: JSON.stringify('Unauthorized') }),
  notfound: () => ({ statusCode: 404, body: JSON.stringify('Not Found') }),
  error: msg => ({ statusCode: 400, body: JSON.stringify(msg) }),
}

const getOrigin = event => event.headers.origin || event.headers.Origin || '*';

const fixEvent = event => {
  /* Lower case headers */
  Object.keys(event.headers).forEach(h=>{
    if (h!=h.toLowerCase()) {
      event.headers[h.toLowerCase()] = event.headers[h];
      delete event.headers[h];
    }
  })
  /* Fix route */
  event.routeKey = event.routeKey.replace(/[<>]/g, function (c) {
    switch (c) {
        case '<': return '{';
        case '>': return '}';
    }
  });
}

module.exports = { cors, responses, fixEvent };