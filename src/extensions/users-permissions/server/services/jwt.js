'use strict';

/**
 * Jwt.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

const _ = require('lodash');
const jwt = require('jsonwebtoken');

module.exports = ({ strapi }) => ({
  getToken(ctx) {
    let token;
    
    if (ctx.request && ctx.request.header && !ctx.request.header.authorization) {
      const token = ctx.cookies.get('token');
      
      if (token) {
         ctx.request.header.authorization = 'Bearer ' + token;
      }
   }

    if (ctx.request && ctx.request.header && ctx.request.header.authorization) {
      const parts = ctx.request.header.authorization.split(/\s+/);

      if (parts[0].toLowerCase() !== 'bearer' || parts.length !== 2) {
        return null;
      }

      token = parts[1];
    } else {
      return null;
    }

    return this.verify(token);
  },

  issue(payload, jwtOptions = {}) {
    _.defaults(jwtOptions, strapi.config.get('plugin.users-permissions.jwt'));
    return jwt.sign(
      _.clone(payload.toJSON ? payload.toJSON() : payload),
      strapi.config.get('plugin.users-permissions.jwtSecret'),
      jwtOptions
    );
  },

  verify(token, ctx) {
    return new Promise(function (resolve, reject) {
      jwt.verify(token, strapi.config.get('plugin.users-permissions.jwtSecret'), {}, function (
        err,
        tokenPayload = {}
      ) {
        if (err) {
          ctx.cookies.set('token', null, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: process.env.NODE_ENV === 'development' ? 'None' : 'Lax',
            maxAge: 1000 * 60 * 60 * 24 * 14, // 14 Day Age
            domain: process.env.NODE_ENV === 'development' ? 'localhost' : strapi.config.server.appDomain,
          });

          ctx.send({
            message: 'Successfully destroyed session',
          });

          return reject(new Error('Invalid token.'));
        }
        resolve(tokenPayload);
      });
    });
  },
});
