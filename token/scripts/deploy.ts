import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const decimals = 18;
  const initialSupply = ethers.parseUnits(process.env.INITIAL_SUPPLY || "1000000000", decimals);

  console.log("Deploying DravonUSD with account:", deployer.address);

  const Token = await ethers.getContractFactory("DravonUSD");
  const token = await Token.deploy(initialSupply, deployer.address);
  await token.waitForDeployment();

  const address = await token.getAddress();
  console.log("DravonUSD (DUSD) deployed to:", address);
  console.log("Initial supply minted to deployer:", ethers.formatUnits(initialSupply, decimals), "DUSD");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
