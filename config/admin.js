module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'e82894feecaa78540f372e7820369dd6'),
  },
});
