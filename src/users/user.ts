import express from "express";
import {BASE_USER_PORT} from "../config";
import {Node} from "../registry/registry";

export type SendMessageBody = {
  message: string;
  destinationUserId: number;
};

export async function user(userId: number) {
  const _user = express();
  _user.use(express.json());

  let lastReceivedMessage: any = null
  let lastSentMessage: any = null
  let lastCircuit: Node[] = []

  // Implement the status route
  _user.get("/status", (req, res) => {
    res.send("live");
  });

  _user.get("/getLastReceivedMessage", (req, res) => {
    res.json({"result": lastReceivedMessage})
  })

  _user.get("/getLastSentMessage", (req, res) => {
    res.json({"result": lastSentMessage})
  })

  _user.get("/getLastCircuit", (req, res) => {
    res.status(200).json({result: lastCircuit.map((node) => node.nodeId)});
  });

  _user.post("/message", (req, res) => {
    const body = req.body;
    lastReceivedMessage = body.message;
    res.status(200).send("success");
  });

  _user.post("/sendMessage",(req,res)=>{
    //TODO:
  })

  return _user.listen(BASE_USER_PORT + userId, () => {
    console.log(
        `User ${userId} is listening on port ${BASE_USER_PORT + userId}`
    );
  });
}
