---
layout: post
title: Up & Running with PostgreSQL with Docker
description: A docker compose file to quickly sping up a PostgreSQL instance with PG admin
date: 2023-07-06 00:03:00 +0500
tags: [docker, postgresql]
image: "images/kevin-ku-w7ZyuGYNpRQ-unsplash.jpg"
---
If you are like me and need a quick way to spin up a PostgreSQL instance with PG admin, here is a docker compose file that you can use to do that. 

```yaml
version: '3'

services:
  db:
    image: postgres:15
    restart: always
    env_file:
      - .env
    ports:
      - "5432:5432"
    volumes:
      - db-data:/var/lib/postgresql/data

  pgadmin:
    image: dpage/pgadmin4
    restart: always
    env_file:
      - .env
    ports:
      - "8090:80"
    volumes:
      - pgadmin-data:/var/lib/pgadmin
    depends_on:
      - db

volumes:
  db-data:
  pgadmin-data:
```


your .env file should look something like this:

```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=example
POSTGRES_DB=mydatabase
PGADMIN_DEFAULT_EMAIL=admin@example.com
PGADMIN_DEFAULT_PASSWORD=example
```

Now all you need to dop is run `docker-compose -f <yourfile>.yml up -d` and you should be good to go. The PG admin will be available at `http://localhost:8090` and you can use the credentials from your .env file to login. You will need to grab your docker container's ip address to connect to the database from your local machine. You can do that by running `docker inspect <container-id> | grep "IPAddress"`.

Enjoy!


Photo by <a href="https://unsplash.com/@ikukevk?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Kevin Ku</a> on <a href="https://unsplash.com/photos/w7ZyuGYNpRQ?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
  