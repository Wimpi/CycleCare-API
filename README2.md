
## Setup
Changes to get things running:

modified [connection.js](src/rest_api/database/connection.js) to:
1. set the port to the internal docker port of the DB 3306; since we are using docker-compose, the services are on the same network and can communicate with each other on their internal ports.
1. TODO: make use of env variable for `DB_PORT` ?

modified [docker-compose.yml](src/docker-compose.yml) to:

1. change the `cyclecare_db` service enviroment variable `MYSQL_DB` to `MYSQL_DATABASE` (read the mysql docker image documentation)
1. add the following environment variables to the `cyclecare_restapi` service:
   1. `DB_HOST` -> see connection.js (we can use the service name instead of the ip address of the db container)
   2. `DB_USER` -> see connection.js
   3. `DB_PASSWORD` -> see connection.js
   4. `DB_NAME` -> see connection.js
   5. `APP_PORT` -> see swagger.js, server.js
   6. `EMAIL` -> see sendEmail.js, filled in using the .env file
   7. `EMAIL_PASSWORD` -> see sendEmail.js, filled in using the .env file
1. commented out the `cyclecare_grpc_video` serevice. I don't think we need this at the moment.
1. use the same network (bridge) for all services; this may not be necessary as I guess docker will do this by default.

added `.env` file to the project:
1. create a `.env` file under src (besides the docker-compose.yml) with the following content:
```bash
# replace with your gmail account and app password
# you can create an app password here: https://myaccount.google.com/
# important note: this will only work if you have 2FA enabled !!!
EMAIL=myaccount@gmail.com
EMAIL_PASSWORD=myAppPassword
```

<span style="color:red">
<b>IMPORTANT NOTE:</b> Do NOT commit this file to the repository, or you may leak your email and app password!!!
</span>



moddified [cycleLogRoutes.js](src/rest_api/routes/cycleLogRoutes.js) to:
1. include the `/log` part of the route in the swagger documentation (otherwise it won't work from the api-doc endpoint)

modified [schema.yaml](src/rest_api/documentation/schemas.yaml) to:
1. have correct indentation for `NewVideo` schema

modified [contentRoutes.js](src/rest_api/routes/contentRoutes.js) to:
1. be accessible under `/content` in the api-docs endpoint
1. TODO: document edit and get routes ?

TODO: english translation of [init.sql](src/init-scripts/init.sql) ?

## Running the app
When you have docker installed, you can run the app by running the following command in the root of the project:
```bash
docker-compose up --build
```
or
```bash
podman-compose up --build
```
if you are using podman instead of docker.

If you have problems mounting the volumes, you can try to run the following command to disable SELinux:
```bash
sudo setenforce 0
```

You should be able to connect to the DB with using the environment variables in the [docker-compose.yml](src/docker-compose.yml) file.
Note that the external port of the DB is `3308`, the default port for MySQL.
For accessing the DB internally (in the docker network) you can use the internal port `3306` as is configured for the `rest_api` in [connection.js](src/rest_api/database/connection.js)

You should be able to connect to the rest_api:
api-docs endpoint:
http://localhost:8085/api-docs

## Running the tests
There is a UserIT.java test.
It verifies the creation of a user, the login process, and the password reset process.
It is written in Springboot3 and can access the following components:
* the backend API by means of an api client generated from the (modified) openapi spec
* the DB itself by means of `spring-boot-starter-data-jpa`
* and also gmail for retrieving a password reset token by means of a utility `GmailReadService`

Create a file `application-test.yaml` in the test resource folder [cyclecare-client/src/test/resources/application-test.yaml](cyclecare-client/src/test/resources/application-test.yaml) with the following content:
```yaml
gmail:
  # replace with your gmail account and app password
  # you can create an app password here: https://myaccount.google.com/
  # important note: this will only work if you have 2FA enabled !!!
  email: myaccount@gmail.com
  appPassword: myAppPassword
```

<span style="color:red">
<b>IMPORTANT NOTE:</b> Do NOT commit this file to the repository, or you may leak your email and app password!!!
</span>


### ideas:
* jwt from HS256 (secret key) to ECDSA (public/private key pair)
* https://jwt.io/#debugger-io?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImphbmUuZG9lIiwiaWF0IjoxNzI4NTY0ODMxLCJleHAiOjE3Mjg1Njg0MzF9.sjgR8HR1Ry6KkgPtY5A5k9ZAPpn2GR8cOlGaS0kTvSI with `myprivatekey` for HS256
* RBAC https://medium.com/@erinlim555/simple-keycloak-rbac-with-node-js-express-js-bc9031c9f1ba
* keycloak https://stackoverflow.com/questions/49572291/keycloak-user-validation-and-getting-token
