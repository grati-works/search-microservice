import express, { Request, Response } from "express";
import cors from "cors";
import { Ingest, Search } from "sonic-channel";

const app = express();

app.use(cors());
app.use(express.json());

const sonicConfig = {
  host: "localhost",
  port: 1491,
  auth: "grati_search_microservice",
};

const sonicChannelIngest = new Ingest(sonicConfig);
const sonicChannelSearch = new Search(sonicConfig);

sonicChannelIngest.connect({
  connected: () => console.log("[Sonic Ingest Channel] Connected!"),
  error: (err) => console.log("[Sonic Ingest Channel] Error", err),
});
sonicChannelSearch.connect({
  connected: () => console.log("[Sonic Search Channel] Connected!"),
  error: (err) => console.log("[Sonic Search Channel] Error", err),
});

app.post(
  "/user/:organization_id/:id",
  async (request: Request, response: Response) => {
    const { name, username, responsibility, about, skills, graduations } =
      request.body;
    const { organization_id, id } = request.params;

    await sonicChannelIngest.push(
      "users",
      organization_id,
      `user:${id}`,
      `${name}, ${username}, ${responsibility}, ${about.replace('.', ' ')}, ${skills.replace('.', ' ')}, ${graduations.replace('.', ' ')}`,
      {
        lang: "por",
      }
    );

    return response.status(201).send();
  }
);

app.get(
  "/search/:organization_id",
  async (request: Request, response: Response) => {
    const { q } = request.query;
    const { organization_id } = request.params;

    const results = await sonicChannelSearch.query(
      "users",
      organization_id,
      q,
      {
        lang: "por",
      }
    );

    return response.json(results);
  }
);

app.get(
  "/suggest/:organization_id",
  async (request: Request, response: Response) => {
    const { q } = request.query;
    const { organization_id } = request.params;

    const results = await sonicChannelSearch.suggest(
      "users",
      organization_id,
      q,
      {
        limit: 5,
      }
    );

    return response.json(results);
  }
);

export { app };
