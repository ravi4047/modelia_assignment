## Modelia Backend
#### Node JS + Typescript + Prisma

To start server,
```
npm install

npx prisma init --db --output ../generated/prisma
npx prisma migrate dev --name init
npx prisma generate

# For development
npm run dev

# For production
npm run build
npm start
```