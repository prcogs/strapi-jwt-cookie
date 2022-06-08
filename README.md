<!-- ABOUT THE PROJECT -->
## About The Project

This repository explains how to handle authentication with cookies in a Strapi application. Basically strapi retrieves the token with the HTTP Authorization request header. By managing the jwt token in this way, we can have security problems on our front-end. By storing it in the response cookies we avoid some problems.

We will store the token in the response cookies of the connection request. Retrieve the cookie at each request so that we can check if the token is valid. And finally, we create a disconnection request to delete the auth cookie.


To use this system in your app, copy the folder ```extensions/user-permissions``` in ```/src```

### Built With

* [Strapi](https://strapi.io/)


<!-- GETTING STARTED -->
## Getting Started

This is an example of how you may give instructions on setting up your project locally.
To get a local copy up and running follow these simple example steps.

### Prerequisites

* npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/prcogs/strapi-jwt-cookie.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```

4. Start your Strapi application with autoReload enabled. [Learn more](https://docs.strapi.io/developer-docs/latest/developer-resources/cli/CLI.html#strapi-develop)

   ```
   npm run develop
   # or
   yarn develop
   ```


<!-- USAGE EXAMPLES -->
## Usage


To test the authentication system, use an API platform, such as Postman

After setting up the app correctly, it is necessary to authorize in admin panel ``Settings => Roles``:
   - Authenticated: logout
   - Public: callback

1. In admin panel, create user
<br>

2. In postman, login you : <br>
![name](https://github.com/prcogs/strapi-jwt-cookie/blob/main/images/request-auth.png?raw=true)
<br>
<br>

3. We check that the cookie with the token has been created : <br>
![name](https://github.com/prcogs/strapi-jwt-cookie/blob/main/images/cookie-token-jwt.png?raw=true)
<br>
<br>

4. To test if the token in the cookie is well recovered, we create a content type in the admin panel. As before, we authorize the route only for authenticated users, then we test the route : <br>
![name](https://github.com/prcogs/strapi-jwt-cookie/blob/main/images/request-post.png?raw=true)
<br>
<br>

5. Finally a logout route has been configured to delete the token in the cookie: <br>
![name](https://github.com/prcogs/strapi-jwt-cookie/blob/main/images/request-logout.png?raw=true)
<br>
<br>


6. We try to get the data again, we see that the request is blocked :<br>
![name](https://github.com/prcogs/strapi-jwt-cookie/blob/main/images/request-post-unauth.png?raw=true)
	

Well done
