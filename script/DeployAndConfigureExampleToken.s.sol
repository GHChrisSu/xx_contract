// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "forge-std/Script.sol";

import { ERC721SeaDrop } from "../src/ERC721SeaDrop.sol";

import { ISeaDrop } from "../src/interfaces/ISeaDrop.sol";

import { PublicDrop } from "../src/lib/SeaDropStructs.sol";

contract DeployAndConfigureExampleToken is Script {
    // Addresses
    address seadrop = 0x00005EA00Ac477B1030CE78506496e8C2dE24bf5;
    address creator = 0x37d8B0123D013ad824B14D8e6a946da425B551CD;
    address feeRecipient = 0x0000a26b00c1F0DF003000390027140000fAa719;

    // Token config
    uint256 maxSupply = 10000;

    // Drop config
    uint16 feeBps = 500; // 5%
    uint80 mintPrice = 0.0001 ether;
    uint16 maxTotalMintableByWallet = 5;

    function run() external {
        vm.startBroadcast();

        address[] memory allowedSeadrop = new address[](1);
        allowedSeadrop[0] = seadrop;

        // This example uses ERC721SeaDrop. For separate Owner and
        // Administrator privileges, use ERC721PartnerSeaDrop.
        ERC721SeaDrop token = new ERC721SeaDrop(
            "DagenAvatar",
            "DA",
            allowedSeadrop
        );

        // Configure the token.
        token.setMaxSupply(maxSupply);

        // Configure the drop parameters.
        token.updateCreatorPayoutAddress(seadrop, creator);

        token.setContractURI("https://demo.dagen.life/creature/contract.json");
        token.setBaseURI("https://demo.dagen.life/creature/");
        token.updateDropURI(
            seadrop,
            "https://demo.dagen.life/creature/drop.json"
        );

        token.updateAllowedFeeRecipient(seadrop, feeRecipient, true);
        token.updatePublicDrop(
            seadrop,
            PublicDrop(
                mintPrice,
                uint48(block.timestamp), // start time
                uint48(block.timestamp + 30 days), // end time
                maxTotalMintableByWallet,
                feeBps,
                true
            )
        );

        // We are ready, let's mint the first 3 tokens!
        ISeaDrop(seadrop).mintPublic{ value: mintPrice * 3 }(
            address(token),
            feeRecipient,
            address(0),
            3 // quantity
        );
    }
}
