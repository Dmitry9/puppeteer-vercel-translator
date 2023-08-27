import app from "express";
import { index } from './local-to-file.js';

const server = app();
server.get("/api", async (req, res) => {
  index.value = Number(req.query.index);
  try {
    if (!Number.isInteger(index.value)) throw `Wrong query: ${req.query.index}.`
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    return null;
  }
});

server.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});
