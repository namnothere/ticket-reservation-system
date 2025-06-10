# Ticket Reservation System

A NestJS-based ticket reservation system with Docker support and load testing capabilities.

## Configuration

1. Create a `.env` file
    - Rename the [.env.sample](.env.sample) file to `.env` to fix it.
2. Edit env config
    - Edit the file in the [config](src/config)/envs folder.
    - `default`, `development`, `production`, `test`

## Installation

```sh
# 1. node_modules
npm ci
# 2. When synchronize database from existing entities
npm run entity:sync
# 2-1. When import entities from an existing database
npm run entity:load
```

## Development

### Local Development
```sh
npm run start:dev
# https://docs.nestjs.com/recipes/repl
npm run start:repl
```

### Docker Development
```sh
# Start all services (API, Database, etc.)
docker compose up
# Start specific services
docker compose up app postgres
```

Run [http://localhost:3000](http://localhost:3000)

## Test

```sh
npm test # exclude e2e
npm run test:e2e
```

### Load Testing
The project includes k6 load testing scripts located in the `load-test` directory. To run load tests:

```sh
# Run all load tests
k6 run load-test/*.js

# Run specific test
k6 run load-test/specific-test.js
```

## Production

```sh
npm run lint
npm run build
# define environment variable yourself.
# NODE_ENV=production PORT=8000 NO_COLOR=true node dist/app
node dist/app
# OR
npm start
```

## Project Structure

```js
+-- bin // Custom tasks
+-- dist // Source build
+-- public // Static Files
+-- src
|   +-- config // Environment Configuration
|   +-- entity // TypeORM Entities
|   +-- auth // Authentication
|   +-- common // Global Nest Module
|   |   +-- constants // Constant value and Enum
|   |   +-- controllers // Nest Controllers
|   |   +-- decorators // Nest Decorators
|   |   +-- dto // DTO (Data Transfer Object) Schema, Validation
|   |   +-- filters // Nest Filters
|   |   +-- guards // Nest Guards
|   |   +-- interceptors // Nest Interceptors
|   |   +-- interfaces // TypeScript Interfaces
|   |   +-- middleware // Nest Middleware
|   |   +-- pipes // Nest Pipes
|   |   +-- providers // Nest Providers
|   |   +-- * // models, repositories, services...
|   +-- shared // Shared Nest Modules
|   +-- * // Other Nest Modules, non-global, same as common structure above
+-- test // Jest testing
+-- load-test // k6 load testing scripts
+-- typings // Modules and global type definitions
```