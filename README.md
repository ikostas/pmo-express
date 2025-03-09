# Project Management Thing

The goal is to manage the project lifecycle:

![Project lifecycle](pmo.png "Project lifecycle")

## Installation

1. Make sure you have Node.js installed.
2. Install dependencies: `npm i`.
3. Make sure you set `TOKEN_SECRET` as your secret and `NODE_ENV=development` in your `.env` file
4. Initialize sequelize with `npx sequelize-cli init` and make migrations with `npx sequelize-cli db:migrate`
3. Launch the app: `npm start dev`

Config for sequelize is in `config/config.json` and it's a sqlite database.

You can register a user in the app, then log in and start creating entries.

## Description

On the front-end, I use:

- [Pico.CSS](https://picocss.com/)
- [htmx](https://htmx.org/)

On the back-end, it's express.js with strict mode + sequelize and [pug templates](https://pugjs.org/). Authentication is basic, roles and role-based access are not implemented.

Writing the app I tried to write less code, so the templates are heavily reused, I also use the same partial template for comments (add/display/remove) and files (upload/display/remove). Comments are displayed as a pre-formatted text, files are uploaded one-by-one, the filename is generated, and the file is displayed by a name you give. Some descriptions allow markdown, it's usually in the header.

## Background

Technically it's an experiment with Express and HTMX for me, you can read the background story [here](https://en.kovchinnikov.info/2024-11-express.html).

I also created an [express-bolierplate](https://github.com/ikostas/expressbp) without Multer.
