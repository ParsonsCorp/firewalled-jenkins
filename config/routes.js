/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {
  'post /user/create': {
    controller    : 'Users',
    action        : 'create'
  },
  'post /jenkins/create': {
    controller    : 'Jenkinsapis',
    action        : 'create',
    policy: 'sessionAuth'
  },
  'post /user/secret': {
    controller    : 'Users',
    action        : 'secret',
    policy: 'sessionAuth'
  },
  'post /user/secret/check': {
    controller    : 'Users',
    action        : 'secret_check',
    policy: 'sessionAuth'
  },
  'post /jenkins/connect': {
    controller    : 'Jenkinsapis',
    action        : 'connect',
    policy: 'sessionAuth'
  },
  'post /jenkins/destroy': {
    controller    : 'Jenkinsapis',
    action        : 'destroy',
    policy: 'sessionAuth'
  },
  'post /jenkins/forgot': {
    controller    : 'Jenkinsapis',
    action        : 'forgot',
    policy: 'sessionAuth'
  },
  'post /jenkins/jobs': {
    controller    : 'Jenkinsapis',
    action        : 'allJobs',
    policy: 'sessionAuth'
  },
  'post /jenkins/job/info': {
    controller    : 'Jenkinsapis',
    action        : 'jobInfo',
    policy: 'sessionAuth'
  },
  'post /jenkins/job/build/info': {
    controller    : 'Jenkinsapis',
    action        : 'buildInfo',
    policy: 'sessionAuth'
  },
  'post /jenkins/job/build/start': {
    controller    : 'Jenkinsapis',
    action        : 'startBuild',
    policy: 'sessionAuth'
  },
  'post /jenkins/job/build/output': {
    controller    : 'Jenkinsapis',
    action        : 'buildOutput',
    policy: 'sessionAuth'
  },
  'get /session/validate': {
    controller    : 'Session',
    action        : 'validate',
    policy: 'sessionAuth'
  },
  'get /session/destroy': {
    controller    : 'Session',
    action        : 'destroy',
    policy: 'sessionAuth'
  },
  'get /users': {
    controller    : 'Users',
    action        : 'index',
    policy: 'sessionAuth'
  },
  'get /jenkins': {
    controller    : 'Jenkinsapis',
    action        : 'index',
    policy: 'sessionAuth'
  },
  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
  * etc. depending on your default view engine) your home page.              *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  '/': {
    view: 'home',
    policy: 'sessionAuth'
  },
  '/login': {
    view: 'login',
    policy: 'loginAuth'
  },

  /***************************************************************************
  *                                                                          *
  * Custom routes here...                                                    *
  *                                                                          *
  * If a request to a URL doesn't match any of the custom routes above, it   *
  * is matched against Sails route blueprints. See `config/blueprints.js`    *
  * for configuration options and examples.                                  *
  *                                                                          *
  ***************************************************************************/

};
