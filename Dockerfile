FROM node:20

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Create a script to run migrations with environment variables
# RUN echo '#!/bin/sh\n\
# echo "Running migrations..."\n\
# npm run migrate:up\n\
# ' > /usr/src/app/run-migrations.sh && chmod +x /usr/src/app/run-migrations.sh

# EXPOSE 3000

# CMD ["npm", "run", "start:prod"]

CMD ["bash", "-c", "npm run migrate:up && npm run start:prod"]