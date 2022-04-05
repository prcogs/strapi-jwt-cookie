'use strict';

const getService = name => strapi.plugin('users-permissions').service(name);

module.exports = {
   getService,
};
