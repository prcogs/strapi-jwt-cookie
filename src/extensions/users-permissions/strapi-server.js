
const { controllers, services } = require('./server');


module.exports = async (plugin) => {
   // Controllers
   plugin.controllers.auth.callback = controllers.auth.callback;
   plugin.controllers.auth.logout = controllers.auth.logout;

   // Services
   plugin.services.jwt = services.jwt;

   // Routes
   plugin.routes['content-api'].routes.push({
      method: 'POST',
      path: '/auth/logout',
      handler: 'auth.logout',
      config: {
         policies: [],
         prefix: '',
      },
   },);

   return plugin;
};
