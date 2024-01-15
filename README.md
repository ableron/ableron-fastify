# @ableron/fastify

[![Build Status](https://github.com/ableron/ableron-fastify/actions/workflows/test.yml/badge.svg)](https://github.com/ableron/ableron-fastify/actions/workflows/test.yml)
[![npm version](https://badge.fury.io/js/@ableron%2Ffastify.svg)](https://badge.fury.io/js/@ableron%2Ffastify)
[![Node.js Version](https://img.shields.io/badge/Node.js-19+-4EB1BA.svg)](https://nodejs.org/docs/latest-v19.x/api/)

Fastify Middleware for Ableron Server Side UI Composition

## Installation

```shell
npm i @ableron/fastify
```

## Usage

```js
import Fastify from 'fastify';
import ableron from '@ableron/fastify';
const app = Fastify({ logger: true });

app.register(ableron, {
  ableron: {
    logger: console
  }
});
app.listen({ port: 3000, host: '0.0.0.0' });
```

### Configuration

Configuration options see [@ableron/ableron](https://github.com/ableron/ableron-js#configuration)
