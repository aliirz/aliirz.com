---
layout: post
title: Up and Running with TimescaleDB
description: Crowdsourcing flood data to help the community
date: 2020-04-08 08:33:35 +0300
image: "images/w9kjeawx02a2owwc5u08.webp"
tags: [open-source, tutorials, todayilearned]
---
I've been getting into time-series databases over the past few months. I got into playing with TimescaleDB and was super impressed with its capabilities. One of the important things to understand is that TimescaleDB is just Postgres at its core which means technically TimescaleDB is an extension. Following is my usual MO to quickly run an instance of TimescaleDB.

Getting a docker container up:
```bash
docker run -d --name timescaledb -p 5434:5434 -e POSTGRES_PASSWORD=password timescale/timescaledb:latest-pg11
```


Connecting to said docker container:
```bash
docker exec -it timescaledb psql -U postgres
```


Creating your database:
```bash
CREATE database tstutorial;
```


Connecting to your new database:

```bash
\c tstutorial
```


Adding the TimescaleDB extension:
```bash
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;
```


That's it! Now you have a dockerized TimescaleDB instance up and running.