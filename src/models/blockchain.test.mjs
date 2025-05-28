import { beforeEach, describe, expect, vi } from "vitest";
import Block from "./block.mjs";
import Blockchain from "./blockchain.mjs";

describe("Blockchain", () => {
  let blockchain;
  let mockData;

  beforeEach(() => {
    blockchain = new Blockchain();
    mockData = { message: "test data", sender: "Melvin", amount: 200 };

    vi.clearAllMocks();
  });

  describe("Constructor", () => {
    it("should create a blockchain with genesis block", () => {
      expect(blockchain.chain).toHaveLength(1);
      expect(blockchain.chain.at(0)).toEqual(Block.createGenesisBlock());
    });

    it("should be an instance of blockchain", () => {
      expect(blockchain instanceof Blockchain).toBeTruthy();
    });
  });

  describe("addBlock()", () => {
    it("should add a new block to the chain", () => {
      const initialLength = blockchain.chain.length;
      const newBlock = blockchain.addBlock({ data: mockData });

      expect(blockchain.chain).toHaveLength(initialLength + 1);
      expect(newBlock instanceof Block).toBeTruthy();
      expect(newBlock.data).toEqual(mockData);
      expect(newBlock.prevHash).toEqual(
        blockchain.chain[initialLength - 1].hash
      );
    });

    it("should return the newly created block", () => {
      const newBlock = blockchain.addBlock({ data: mockData });
      expect(newBlock).toBe(blockchain.chain[blockchain.chain.length - 1]);
    });
  });

  describe("getBlock()", () => {
    it("should return the correct block by index", () => {
      blockchain.addBlock({ data: mockData });
      const block = blockchain.getBlock(1);

      expect(block).toBeDefined();
      expect(block.data).toEqual(mockData);
    });

    it("should return genesis block at index 0", () => {
      const genesisBlock = blockchain.getBlock(0);
      expect(genesisBlock).toEqual(Block.createGenesisBlock());
    });

    it("should return undefined for invalid index", () => {
      const block = blockchain.getBlock(999);
      expect(block).toBeUndefined();
    });
  });

  describe("getAllBlocks()", () => {
    it("should return all blocks in the chain", () => {
      blockchain.addBlock({ data: mockData });
      blockchain.addBlock({ data: { message: "second block" } });

      const allBlocks = blockchain.getAllBlocks();
      expect(allBlocks).toHaveLength(3);
      expect(allBlocks).toEqual(blockchain.chain);
    });
  });

  describe("Replace chain", () => {
    let newChain;

    beforeEach(() => {
      newChain = new Blockchain();
      newChain.addBlock({ data: mockData });
      newChain.addBlock({ data: { message: "second block" } });
    });

    it("should replace the chain when new chain is longer and valid", () => {
      const result = blockchain.replaceChain(newChain.chain);

      expect(result).toBeTruthy();
      expect(blockchain.chain).toEqual(newChain.chain);
    });

    it("should not replace chain when new chain is shorter", () => {
      blockchain.addBlock({ data: mockData });
      blockchain.addBlock({ data: { message: "block 2" } });
      blockchain.addBlock({ data: { message: "block 3" } });

      const orgChain = [...blockchain.chain];
      const result = blockchain.replaceChain(newChain.chain);

      expect(result).toBeFalsy();
      expect(blockchain.chain).toEqual(orgChain);
    });

    it("should not replace chain when new chain is invalid", () => {
      const invalidChain = [...newChain.chain];
      invalidChain[1] = { ...invalidChain[1], hash: "invalid-hash" };

      const orgChain = [...blockchain.chain];
      const result = blockchain.replaceChain(invalidChain);

      expect(result).toBeFalsy();
      expect(blockchain.chain).toEqual(orgChain);
    });
  });

  describe("isValidChain()", () => {
    let validChain;

    beforeEach(() => {
      const tempBlockchain = new Blockchain();
      tempBlockchain.addBlock({ data: mockData });
      tempBlockchain.addBlock({ data: { message: "block 2" } });
      validChain = tempBlockchain.chain;
    });

    it("should return true for a valid chain", () => {
      expect(Blockchain.isValidChain(validChain)).toBeTruthy();
    });

    it("should return false when genesis block is invalid", () => {
      const invalidChain = [...validChain];
      invalidChain[0] = { ...invalidChain[0], data: "corrupted" };

      expect(Blockchain.isValidChain(invalidChain)).toBeFalsy();
    });

    it("should return false when a block has invalid prevHash", () => {
      const invalidChain = [...validChain];
      invalidChain[1] = { ...invalidChain[1], prevHash: "invalid-prev-hash" };

      expect(Blockchain.isValidChain(invalidChain)).toBeFalsy();
    });

    it("should return false when a block has invalid hash", () => {
      const invalidChain = [...validChain];
      invalidChain[1] = { ...invalidChain[1], hash: "invalid-hash" };

      expect(Blockchain.isValidChain(invalidChain)).toBeFalsy();
    });

    it("should return false when difficulty jumps more than 1", () => {
      const invalidChain = [...validChain];
      invalidChain[1] = {
        ...invalidChain[1],
        difficulty: invalidChain[0].difficulty + 2,
      };

      expect(Blockchain.isValidChain(invalidChain)).toBeFalsy();
    });
  });
});
