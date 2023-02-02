import { ethers } from "hardhat";

import verify from "../helper-functions";
import { developmentChains } from "../helper-hardhat-config";

import type { DeployFunction } from "hardhat-deploy/types";
import type { HardhatRuntimeEnvironment } from "hardhat/types";

const deployCreature: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  // @ts-ignore
  const { getNamedAccounts, deployments, network } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log("----------------------------------------------------");

  const seadrop = "0x00005EA00Ac477B1030CE78506496e8C2dE24bf5";
  const creator = deployer;
  const feeRecipient = "0x0000a26b00c1F0DF003000390027140000fAa719";

  const maxSupply = 10000;
  const feeBps = 500; // 5%
  const mintPrice = "100000000000000000"; // 0.1 ether
  const maxTotalMintableByWallet = 5;

  const args = ["DagenAvatar", "DA", [seadrop]];
  const DagenAvatar = await deploy("DagenAvatar", {
    from: deployer,
    log: true,
    args,
  });
  log(`DagenAvatar at ${DagenAvatar.address}`);

  if (!developmentChains.includes(network.name)) {
    await verify(DagenAvatar.address, args);
  }

  const DagenAvatarContract = await ethers.getContractAt(
    "DagenAvatar",
    DagenAvatar.address
  );

  // Configure the await DagenAvatarContract.
  await DagenAvatarContract.setMaxSupply(maxSupply);

  // Configure the drop parameters.
  await DagenAvatarContract.updateCreatorPayoutAddress(seadrop, creator);

  await DagenAvatarContract.setContractURI(
    "https://demo.dagen.io/pfp/contract.json"
  );
  await DagenAvatarContract.setBaseURI("https://demo.dagen.io/pfp/");
  await DagenAvatarContract.updateDropURI(
    seadrop,
    "https://demo.dagen.io/pfp/drop.json"
  );

  await DagenAvatarContract.updateAllowedFeeRecipient(
    seadrop,
    feeRecipient,
    true
  );
  await DagenAvatarContract.updatePublicDrop(seadrop, {
    mintPrice,
    startTime: Math.round(Date.now() / 1000) - 30 * 24 * 60 * 60,
    endTime: Math.round(Date.now() / 1000) + 30 * 24 * 60 * 60,
    maxTotalMintableByWallet,
    feeBps,
    restrictFeeRecipients: true,
  });

  await DagenAvatarContract.updateAllowList(seadrop, {
    merkleRoot: ethers.constants.HashZero,
    publicKeyURIs: [],
    allowListURI: "https://demo.dagen.io/pfp/allowlist.json",
  });

  const SeaDropContract = await ethers.getContractAt("SeaDrop", seadrop);
  await SeaDropContract.mintPublic(
    DagenAvatarContract.address,
    feeRecipient,
    ethers.constants.AddressZero,
    3,
    { value: ethers.BigNumber.from(mintPrice).mul(3) }
  );

  await DagenAvatarContract.mint(deployer, 6);
};

export default deployCreature;
deployCreature.tags = ["all", "dagen_avatar"];
