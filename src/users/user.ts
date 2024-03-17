import bodyParser from "body-parser";
import express from "express";
import {BASE_USER_PORT} from "../config";

export type SendMessageBody = {
  message: string;
  destinationUserId: number;
};

export async function user(userId: number) {
  const _user = express();
  _user.use(express.json());
  _user.use(bodyParser.json());

  let lastReceivedMessage:any = null
  let lastSentMessage:any = null

  // Implement the status route
  _user.get("/status", (req, res) => {
    res.send("live");
  });

  _user.get("/getLastReceivedMessage" , (req,res) => {
    res.json({"result": lastReceivedMessage})
  })

  _user.get("/getLastSentMessage" , (req,res) => {
    res.json({"result": lastSentMessage})
  })

  _user.post("/sendMessage" , (req,res) => {
    const { message, destinationUserId } = req.body
    res.json(404)
  })

  return _user.listen(BASE_USER_PORT + userId, () => {
    console.log(
        `User ${userId} is listening on port ${BASE_USER_PORT + userId}`
    );
  });
}
