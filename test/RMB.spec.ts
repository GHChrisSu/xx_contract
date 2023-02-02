import { expect } from "chai";
import { ethers, network } from "hardhat";

import { randomHex } from "./utils/encoding";
import { faucet } from "./utils/faucet";
import { VERSION } from "./utils/helpers";

import type { RMB } from "../typechain-types";
import type { Wallet } from "ethers";

describe(`RMB (v${VERSION})`, function () {
  const { provider } = ethers;
  let rmb: RMB;
  let owner: Wallet;
  let admin: Wallet;
  let minter: Wallet;

  after(async () => {
    await network.provider.request({
      method: "hardhat_reset",
    });
  });

  before(async () => {
    // Set the wallets
    owner = new ethers.Wallet(randomHex(32), provider);
    admin = new ethers.Wallet(randomHex(32), provider);
    minter = new ethers.Wallet(randomHex(32), provider);

    // Add eth to wallets
    for (const wallet of [owner, admin, minter]) {
      await faucet(wallet.address, provider);
    }

    const RMBContract = await ethers.getContractFactory("RMB", owner);
    rmb = await RMBContract.deploy();
  });

  it("Should only mint by minter", async () => {
    await expect(rmb.connect(admin).mint(owner.address, 10000)).to.be.reverted;
  });
});
