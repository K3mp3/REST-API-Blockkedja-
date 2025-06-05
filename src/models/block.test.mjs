import { describe, expect } from "vitest";
import { MINE_RATE } from "../utilities/config.mjs";
import { createHash } from "../utilities/hash.mjs";
import Block from "./block.mjs";
import { GENESIS } from "./genesis.mjs";

describe("Block", () => {
  const data = [1, 2, 3, 4, 5, 6];
  const timestamp = Date.now();
  const hash = "current-hash";
  const prevHash = "prev-hash";
  const nonce = 5;
  const difficulty = 2;

  const block = new Block({
    hash,
    timestamp,
    prevHash,
    data,
    nonce,
    difficulty,
  });

  describe("Should create a block with the correct properties", () => {
    it("should create a block with given properties", () => {
      expect(block.timestamp).toBe(timestamp);
      expect(block.hash).toBe(hash);
      expect(block.prevHash).toBe(prevHash);
      expect(block.data).toEqual(data);
      expect(block.nonce).toBe(nonce);
      expect(block.difficulty).toBe(difficulty);
    });
  });

  describe("Should have its properties correctly initialized", () => {
    it("Should set a timestamp value", () => {
      expect(block.timestamp).not.toEqual(undefined);
    });

    it("Should have a correct hash", () => {
      expect(block.hash).toEqual(hash);
    });

    it("Should set the prevHash to the hash of previous block", () => {
      expect(block.prevHash).toEqual(prevHash);
    });

    it("Should set the data property", () => {
      expect(block.data).toEqual(data);
    });

    it("Should return an instance of the Block class", () => {
      expect(block instanceof Block).toBeTruthy();
    });
  });

  describe("createGenesisBlock() function", () => {
    it("Should return a valid genesis block", () => {
      const genesis = Block.createGenesisBlock();
      expect(genesis instanceof Block).toBeTruthy();
      expect(genesis).toEqual(GENESIS);
    });
  });

  describe("mineblock() function", () => {
    const previousBlock = Block.createGenesisBlock();
    const data = [9, 23, 6, 78];
    const mined = Block.mine({ lastBlock: previousBlock, data });

    it("Should mine a block with correct data and difficulty", () => {
      expect(mined instanceof Block).toBeTruthy();
      expect(mined.prevHash).toEqual(previousBlock.hash);
      expect(mined.data).toEqual(data);
      expect(mined.timestamp).not.toEqual(undefined);
    });

    it("Should create a SHA-256 hash based on given and correct inputs", () => {
      const expectedHash = createHash(
        mined.timestamp,
        mined.prevHash,
        mined.data,
        mined.nonce,
        mined.difficulty
      );
      expect(mined.hash).toBe(expectedHash);
    });

    it("should create a hash based on the difficulty level", () => {
      expect(mined.hash.substring(0, mined.difficulty)).toEqual(
        "0".repeat(mined.difficulty)
      );
    });

    it("should adjust the difficulty level", () => {
      const results = [
        previousBlock.difficulty + 1,
        previousBlock.difficulty - 1,
      ];

      expect(results.includes(mined.difficulty)).toBe(true);
    });

    describe("Adjust the difficulty level", () => {
      it("Should increase difficulty if block is mined to fast", () => {
        const fastBlock = Block.adjustDifficulty({
          previousBlock: block,
          timestamp: block.timestamp + MINE_RATE - 100,
        });
        expect(fastBlock).toBe(block.difficulty + 1);
      });

      it("should decrease difficulty if block is mined too slow", () => {
        const slowBlock = Block.adjustDifficulty({
          previousBlock: block,
          timestamp: block.timestamp + MINE_RATE + 100,
        });
        expect(slowBlock).toBe(block.difficulty - 1);
      });

      it("should not reduce difficulty below 1", () => {
        const lowDifficultyBlock = new Block({
          ...block,
          difficulty: 0,
        });

        const adjusted = Block.adjustDifficulty({
          previousBlock: lowDifficultyBlock,
          timestamp: Date.now(),
        });

        expect(adjusted).toBe(1);
      });
    });
  });
});
