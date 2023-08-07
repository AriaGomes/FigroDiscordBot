# FigroDiscordBot

Docker

docker build --tag [name]


docker run [name]



### Setup

`yarn` - install dependancies

Create a .env file in the root of the project and enter your following values,(OpenAI API key is not required)
```
TOKEN=<Discord Token from Developer API>
CLIENT_ID=<Discord App client ID from develeoper API>
GUILD_ID=<Server ID, used to register commands>
ADMIN_USER_ID=<Discord user ID of the admin user>
OPEN_AI_TOKEN=<OpenAI token (optional)>
MONGO_URL=<MongoDB Connection URL>
DB_NAME=<MongoDB DB name>
```

`yarn register` - will register slash commands to your discord app

`yarn start` - Starts the bot
