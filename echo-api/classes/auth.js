const cLoader = require("./configLoader");
const config = new cLoader().getCfg();
const jwt = require('njwt');
const crypto = require('crypto');

// class to make authentication to the api
class Auth {
  constructor() {
    this.tokens = {};
  }

  rand(count, options) {
    var crypto = require('crypto');
    var buf = crypto.randomBytes(count);

    switch (options.type) {
      case 'Array':
        return [].slice.call(buf);
      case 'Buffer':
        return buf;
      case 'Uint8Array':
        var arr = new Uint8Array(count);
        for (var i = 0; i < count; ++i) { arr[i] = buf.readUInt8(i) }
        return arr;
      default:
        console.error(options.type + " is unsupported.");
        return null;
    }
  }

  _compare(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') return false;
    var mismatch = a.length === b.length ? 0 : 1;
    if (mismatch) b = a;
    for (var i = 0, il = a.length; i < il; ++i) mismatch |= (a.charCodeAt(i) ^ b.charCodeAt(i));
    return mismatch === 0;
  };

  // generate JWT token
  generateJWTToken(user) {
    // Create a highly random byte array of 256 bytes.
    // this will be the signing key for the JWT token
    var key = this.rand(256, { type: 'Buffer' });

    // Create a new token claims
    var claims = {
      iss: "https://echo.kuricki.com/api",
      sub: user,
      scope: "self"
    }

    // Sign the token with the key
    var jwtData = jwt.create(claims, key);
    // expiration if needed
    jwtData.setExpiration(new Date().getTime() + (30*24*60*60*1000));
    // nbf if needed
    // jwtData.setNotBefore(new Date().getTime() + (60*60*1000));
    // compact the token
    var token = jwtData.compact();
    console.log("JWT token for user", user, "generated");
    this.tokens[token] = { user, key };
    return token;
  }

  revokeToken(token) {
    if (this.tokens[token]) {
      delete this.tokens[token];
      return true;
    }
    return false;
  }

  revokeTokenFromUser(user) {
    for (let token in this.tokens) {
      if (this.tokens[token].user === user) {
        delete this.tokens[token];
      }
    }
  }

  // check if a token is valid
  checkToken(req, res) {
    if (config.env === "dev") return { scope: "self" };
    const token = req.headers.authorization;
    if (!this.tokens[token]) return false;
    try {
      const keyBuffer = Buffer.from(this.tokens[token].key);
      const requestData = jwt.verify(token, keyBuffer);
      return requestData.body;
    } catch (e) {
      console.error(e);
      res.status(401).send({ message: "Unauthorized" });
      return false;
    }
  }

  // get the user id from a token
  getUserId(token) {
    if (!this.tokens[token]) return false;
    try {
      const keyBuffer = Buffer.from(this.tokens[token].key);
      const requestData = jwt.verify(token, keyBuffer);
      return requestData.body.sub;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}

module.exports = Auth;