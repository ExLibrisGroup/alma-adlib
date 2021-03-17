const jwt = require('jsonwebtoken');
const algorithm = process.env.CLOUDAPP_AUTHORIZER_ALGORITHM || 'RS256';
const ignoreExpiration = (process.env.CLOUDAPP_AUTHORIZER_IGNORE_EXPIRATION=='true');
const allowedApps = process.env.CLOUDAPP_AUTHORIZER_ALLOWED_APPS;
const allowedInstCodes = process.env.CLOUDAPP_AUTHORIZER_ALLOWED_INST_CODES;
const issuer = 'https://apps01.ext.exlibrisgroup.com/auth';

module.exports.auth = header => {
  try {
    return verify(header);
  } catch (e) {
    console.log('invalid token', e.message);
    return false;
  }
}

const verify = auth => {
  if (!auth) return false;
  const tokenParts = auth.split(' ');
  const tokenValue = tokenParts[1];

  if (!(tokenParts[0].toLowerCase() === 'bearer' && tokenValue)) {
    throw new Error('No token');
  }
  const publicKey = require('fs').readFileSync(__dirname + '/public-key.pem');
  const audience = allowedApps && allowedApps.toLowerCase().split(',')
    .map(v => new RegExp(`ExlCloudApp:(?:!~)?${v.trim()}`));
  const verified = jwt.verify(tokenValue, publicKey, { ignoreExpiration, algorithm, audience, issuer });

  /* Verify Inst Code */
  if (allowedInstCodes && 
    !allowedInstCodes.toUpperCase().split(',').map(v=>v.trim()).includes(verified.inst_code)) {
    throw new Error('Invalid Inst Code.');
  }

  return verified;
}