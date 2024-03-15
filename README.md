# parsertime-bot

<p align="center">
  <a href="https://parsertime.app/">
    <img src="https://parsertime.app/icon.png" height="96">
    <h3 align="center">Parsertime Bot</h3>
  </a>
</p>

This is the repository for the Parsertime Bot. The bot is written in TypeScript and uses the [Discord.js](https://discord.js.org) library.
The bot is built on the [Bun](https://bun.sh) runtime. It is deployed to [Railway](https://railway.app).

## Local Development

To run the bot locally, you will need to clone the repository and install the dependencies.

To set up your environment variables, copy the `.env.example` file to `.env` and fill in the values.

```bash
cp .env.example .env
```

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.0.30. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
