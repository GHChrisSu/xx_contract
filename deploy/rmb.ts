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

  const RMB = await deploy("RMB", {
    from: deployer,
    log: true,
  });
  log(`RMB at ${RMB.address}`);

  if (!developmentChains.includes(network.name)) {
    await verify(RMB.address, []);
  }
};

export default deployCreature;
deployCreature.tags = ["all", "rmb"];
