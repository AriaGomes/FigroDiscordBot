# FigroDiscordBot

Docker

docker build --tag [name]


docker run [name]



### Setup

Create a config.json in the root of the project and enter your following values,(OpenAI is not required)
```
    "token": "Discord Token from Developer API",
    "clientId": "Discord App client ID from develeoper API",
    "guildId": "Server ID, used to register commands",
    "adminUserID": "Discord user ID of the admin user",
    "openAIToken": "OpenAI token(optional)",
    "mongoURL": "MongoDB Connection URL",
    "dbName": "MongoDB DB name"
```