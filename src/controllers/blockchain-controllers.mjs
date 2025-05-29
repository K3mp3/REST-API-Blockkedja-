import { blockChain } from "../server.mjs";
import { saveChainToDisk } from "../utilities/save.mjs";

export const listAllBlocks = (req, res) => {
  res.status(200).json({ success: true, data: blockChain });
};

export const addBlock = (req, res) => {
  const { data } = req.body;

  blockChain.addBlock({ data });

  saveChainToDisk(blockChain.chain);

  res
    .status(201)
    .json({ success: true, message: "Block is added", data: blockChain.chain });
};
