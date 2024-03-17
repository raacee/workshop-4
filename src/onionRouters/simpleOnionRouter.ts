import bodyParser from "body-parser";
import express from "express";
import {BASE_ONION_ROUTER_PORT, REGISTRY_PORT} from "../config";
import {generateRsaKeyPair} from "../crypto";

export async function simpleOnionRouter(nodeId: number) {
  const onionRouter = express();

  const { publicKey, privateKey } = await generateRsaKeyPair()

  onionRouter.use(express.json());
  onionRouter.use(bodyParser.json());

  let lastReceivedEncryptedMessage: any = null
  let getLastReceivedDecryptedMessage: any = null
  let getLastMessageDestination: any = null

  // Implement the status route
  onionRouter.get("/status", (req, res) => {
    res.status(200).send("live");
  });

  onionRouter.get("/getLastReceivedEncryptedMessage", function(req,res){
    res.json({result:lastReceivedEncryptedMessage})
  })

  onionRouter.get("/getLastReceivedDecryptedMessage", function(req,res){
    res.json({result:getLastReceivedDecryptedMessage})
  })

  onionRouter.get("/getLastMessageDestination", function(req,res){
    res.json({result:getLastMessageDestination})
  })

  await fetch(`http://localhost:${REGISTRY_PORT}`, {
    method:'POST',
    body:JSON.stringify({id:nodeId, publicKey, privateKey})
  })

  return onionRouter.listen(BASE_ONION_ROUTER_PORT + nodeId, async() => {
    console.log(
        `Onion router ${nodeId} is listening on port ${
            BASE_ONION_ROUTER_PORT + nodeId
        }`
    );
  });
}

