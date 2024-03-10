# CSE 316 Final Project - Fake Stack Overflow
## Instructions to setup and run project
- Start a MongoDB with the default settings.
- Initialize the database by running `node ./server/init.js <admin_username> <admin_password>`
    - This will create 4 users: 1 admin using your provided username and password, and 3 regular users. Their credentials will be printed to the console. 2 of the users will have sufficient reputation to do actions that require it.
- Run this command to start the server: `cd server && npm install && npm start`
- In a new terminal, run this command to start the client: `cd client && npm install && npm start`
