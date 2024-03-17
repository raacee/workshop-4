import bodyParser from "body-parser";
import express, {Request, Response} from "express";
import {REGISTRY_PORT} from "../config";

export type Node = { nodeId: number; pubKey: string };

export type RegisterNodeBody = {
  nodeId: number;
  pubKey: string;
};
export type GetNodeRegistryBody = {
  nodes: Node[];
};

export async function launchRegistry() {
  const _registry = express();
  _registry.use(express.json());
  _registry.use(bodyParser.json());
  const nodes: Node[] = []

  // Implement the status route
  _registry.get("/status", (req: Request, res: Response) => {
    res.send("live");
  });

  _registry.post("/registerNode", (req,res)=>{
    try{
      // @ts-ignore
      nodes.push(req.body)
      res.send(201)
    }
    catch (e){
      res.send(500)
    }
  })

  _registry.get("/getPrivateKey", (req,res)=>{
    const id = req.body.id
    res.send({
      // @ts-ignore
      result: nodes[id].publicKey
    })
  })

  _registry.get("/getNodeRegistry", (req,res)=>{
    res.send(nodes)
  })

  return _registry.listen(REGISTRY_PORT, () => {
    console.log(`registry is listening on port ${REGISTRY_PORT}`);
  });
}
