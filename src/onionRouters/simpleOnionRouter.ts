import bodyParser from "body-parser";
import express from "express";
import {BASE_ONION_ROUTER_PORT, REGISTRY_PORT} from "../config";
import {exportPrvKey, exportPubKey, generateRsaKeyPair, importPrvKey, rsaDecrypt, symDecrypt} from "../crypto";

export async function simpleOnionRouter(nodeId: number) {
  const onionRouter = express();

  const rsaPair = await generateRsaKeyPair();
  const publicKey = await exportPubKey(rsaPair.publicKey);
  const privateKey = await exportPrvKey(rsaPair.privateKey);

  onionRouter.use(express.json());
  onionRouter.use(bodyParser.json());

  let lastReceivedEncryptedMessage: string | any = null
  let getLastReceivedDecryptedMessage: string | any = null
  let getLastMessageDestination: string | any = null

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

  onionRouter.get("/getPrivateKey", function(req, res) {
    res.json({ result: privateKey });
  });

  // registering the router to the registry
  await fetch(`http://localhost:${REGISTRY_PORT}/registerNode`, {
    method: "POST",
    body: JSON.stringify({ nodeId: nodeId, pubKey: publicKey, prvKey: privateKey }),
    headers: { "Content-Type": "application/json" },
  });

  return onionRouter.listen(BASE_ONION_ROUTER_PORT + nodeId, async() => {
    console.log(
        `Onion router ${nodeId} is listening on port ${
            BASE_ONION_ROUTER_PORT + nodeId
        }`
    );
  });
}

