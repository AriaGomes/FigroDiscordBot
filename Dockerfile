FROM node:latest
WORKDIR /app
ENV PATH="./node_modules/.bin:$PATH"
COPY . .
RUN yarn
CMD ["yarn", "start"]