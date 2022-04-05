'use strict';

/**
 * Auth.js controller
 *
 * @description: A set of functions called "actions" for managing `Auth`.
 */

/* eslint-disable no-useless-escape */
const crypto = require('crypto');
const _ = require('lodash');
const utils = require('@strapi/utils');
const { getService } = require('../utils');
const {
  validateCallbackBody,
  validateRegisterBody,
  validateSendEmailConfirmationBody,
} = require('./validation/auth');

const { getAbsoluteAdminUrl, getAbsoluteServerUrl, sanitize } = utils;
const { ApplicationError, ValidationError } = utils.errors;

const emailRegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const sanitizeUser = (user, ctx) => {
  const { auth } = ctx.state;
  const userSchema = strapi.getModel('plugin::users-permissions.user');

  return sanitize.contentAPI.output(user, userSchema, { auth });
};

module.exports = {
  async callback(ctx) {
    const provider = ctx.params.provider || 'local';
    const params = ctx.request.body;

    const store = await strapi.store({ type: 'plugin', name: 'users-permissions' });

    if (provider === 'local') {
      if (!_.get(await store.get({ key: 'grant' }), 'email.enabled')) {
        throw new ApplicationError('This provider is disabled');
      }

      await validateCallbackBody(params);

      const query = { provider };

      // Check if the provided identifier is an email or not.
      const isEmail = emailRegExp.test(params.identifier);

      // Set the identifier to the appropriate query field.
      if (isEmail) {
        query.email = params.identifier.toLowerCase();
      } else {
        query.username = params.identifier;
      }

      // Check if the user exists.
      const user = await strapi.query('plugin::users-permissions.user').findOne({ where: query });

      if (!user) {
        throw new ValidationError('Invalid identifier or password');
      }

      if (
        _.get(await store.get({ key: 'advanced' }), 'email_confirmation') &&
        user.confirmed !== true
      ) {
        throw new ApplicationError('Your account email is not confirmed');
      }

      if (user.blocked === true) {
        throw new ApplicationError('Your account has been blocked by an administrator');
      }

      // The user never authenticated with the `local` provider.
      if (!user.password) {
        throw new ApplicationError(
          'This user never set a local password, please login with the provider used during account creation'
        );
      }

      const validPassword = await getService('user').validatePassword(
        params.password,
        user.password
      );

      if (!validPassword) {
        throw new ValidationError('Invalid identifier or password');
      } else {
        const token = strapi.plugins['users-permissions'].services.jwt.issue({
          id: user.id,
        });

        ctx.cookies.set('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV !== 'development',
          sameSite: process.env.NODE_ENV === 'development' ? 'None' : 'Lax',
          maxAge: 1000 * 60 * 60 * 24 * 14, // 14 Day Age
          domain: process.env.NODE_ENV === 'development' ? 'localhost' : strapi.config.server.appDomain,
        });

        ctx.send({
          user: await sanitizeUser(user, ctx),
        });
      }
    } else {
      if (!_.get(await store.get({ key: 'grant' }), [provider, 'enabled'])) {
        throw new ApplicationError('This provider is disabled');
      }

      // Connect the user with the third-party provider.
      let user;
      let error;
      try {
        [user, error] = await getService('providers').connect(provider, ctx.query);
      } catch ([user, error]) {
        throw new ApplicationError(error.message);
      }

      if (!user) {
        throw new ApplicationError(error.message);
      }

      const token = strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id,
      });

      ctx.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: process.env.NODE_ENV === 'development' ? 'None' : 'Lax',
        maxAge: 1000 * 60 * 60 * 24 * 14, // 14 Day Age
        domain: process.env.NODE_ENV === 'development' ? 'localhost' : strapi.config.server.appDomain,
      });

      ctx.send({
        user: await sanitizeUser(user, ctx),
      });
    }
  },

  async logout(ctx, next) {
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
  },
};
