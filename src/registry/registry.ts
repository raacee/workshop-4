import express, { Request, Response } from "express";
import { REGISTRY_PORT } from "../config";

export type Node = { nodeId: number; pubKey: string; privateKey: string };

export type RegisterNodeBody = {
  nodeId: number;
  pubKey: string;
  privateKey: string;
};

export type GetNodeRegistryBody = {
  nodes: Node[];
};

export async function launchRegistry() {
  const _registry = express();
  _registry.use(express.json());

  const nodes: Node[] = [];

  // Implement the status route
  _registry.get("/status", (req: Request, res: Response) => {
    res.send("live");
  });

  _registry.post("/registerNode", (req, res) => {
    try {
      // @ts-ignore
      const newNode: Node = req.body;
      nodes.push(newNode);
      res.sendStatus(201);
    } catch (e) {
      res.sendStatus(500);
    }
  });

  _registry.get("/getPrivateKey", (req, res) => {
    const id = req.query.id;
    // @ts-ignore
    const node = nodes.find((node) => node.nodeId === id);
    if (node) {
      res.send({result: node.privateKey});
    } else {
      res.sendStatus(404);
    }
  });

  _registry.get("/getNodeRegistry", (req, res) => {
    res.json({nodes});
  });

  return _registry.listen(REGISTRY_PORT, () => {
    console.log(`registry is listening on port ${REGISTRY_PORT}`);
  });
}
