# https://medium.com/@udaykumardhokia/setting-up-a-node-js-backend-with-typescript-the-complete-beginners-guide-8bc380324406

mkdir my-node-backend
cd my-node-backend
npm init -y

npm install express
npm install @types/express --save-dev

npm install typescript ts-node @types/node @types/express tsx --save-dev

npm i zod

# npm i prisma # For postgres
# prisma is typically added into devDependencies.
# https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/relational-databases-typescript-prismaPostgres
npm i -D prisma

# To generate Prisma files in a custom directory. It also performs login if needed.
npx prisma init --db --output ../generated/prisma

# 1. Install and use the Prisma Accelerate extension
# Prisma Postgres requires the Prisma Accelerate extension for querying. If you haven't already installed it, install it in your project:
npm install @prisma/extension-accelerate

npx prisma migrate dev --name init

# Pino and Pino pretty
npm install pino-pretty --save-dev

# Pino is a fast logging library for Node.js applications.
npm install pino pino-http

# The install command invokes prisma generate for you which reads your Prisma schema and generates a version of Prisma Client that is tailored to your models.
npm install @prisma/client

# Then, run prisma generate which reads your Prisma schema and generates the Prisma Client.
npx prisma generate

# Copilot
# Package	Use in Production?	Where to Put It
# pino	✅ Yes	dependencies
# pino-http	✅ Yes	dependencies
# pino-pretty	❌ No (dev only)	devDependencies

npm i bcrypt jsonwebtoken
npm i --save-dev @types/bcrypt @types/jsonwebtoken

npm i multer
npm i @types/multer --save-dev


npm install cors # to send the data across different origins


## After updating the prisma models, like here, changing image style to enum
npx prisma migrate dev --name add_image_style_enum

npx prisma migrate dev --name change_image_style_enum_to_lowercase

# Install sharp
npm install sharp


# Super Test
npm install --save-dev supertest @types/supertest

npm install --save-dev jest @types/jest ts-jest
npx ts-jest config:init

npx tsc --init