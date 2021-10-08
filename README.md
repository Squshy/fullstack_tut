A follow along of Ben Awad's GreaphQL, TypeScript, React, Tutorial
https://www.youtube.com/watch?v=I6ypD7qv3Z8

This app uses a `Postgres` database, make sure you have a database created locally.

First, there are some `.env` variables which need to be set.  In the `server` directory, there is a `.env.example` file which shows all used `.env` variables.  

Defaults for the secrets are as follows:  

`DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lireddit`  

`REDIS_URL=127.0.0.1:6379`  

`PORT=4000`  

`SESSION_SECRET=secret`  

`CORS_ORIGIN=http://localhost:3000`  


To run this app locally, install the dependencies in both the `client` and the `server` folder using the command `yarn`.

Next, in the `server` directory run the command `yarn dev`.  If you plan on making changes and want to see them live, have a separate terminal open that is also running the command `yarn watch`.  This will run the api.

To run the web page, in the `client` directory open a terminal and run the command `yarn dev`.
