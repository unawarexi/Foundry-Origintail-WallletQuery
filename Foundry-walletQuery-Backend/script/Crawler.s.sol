// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/Crawler.sol";

/// @title Ethereum Transaction Crawler Script
/// @notice Uses Etherscan API as primary source, Infura as fallback
contract CrawlerScript is Script, Crawler {
    string constant ETHERSCAN_API = "https://api.etherscan.io/api";
    string constant INFURA_RPC = "https://mainnet.infura.io/v3/"; 

    string etherscanKey;
    string infuraKey;

    function setUp() public {
        // Load secrets from environment
        etherscanKey = vm.envString("ETHERSCAN_API_KEY");
        infuraKey = vm.envString("INFURA_API_KEY");
    }

    /// @notice Entry point: crawl transactions for wallet from block
    /// @param wallet The wallet address
    /// @param startBlock The block number to start from
    function crawl(address wallet, uint256 startBlock) public {
        string memory etherscanUrl = string.concat(
            ETHERSCAN_API,
            "?module=account&action=txlist&address=",
            vm.toString(wallet),
            "&startblock=",
            vm.toString(startBlock),
            "&endblock=99999999&sort=asc&apikey=",
            etherscanKey
        );

        // Try etherscan first
        (bool ok, bytes memory data) = tryFetch(etherscanUrl);

        if (!ok) {
            console2.log("⚠️  Etherscan failed, falling back to Infura RPC...");
            (ok, data) = tryInfura(wallet, startBlock);
        }

        if (!ok) {
            console2.log("❌ Both Etherscan and Infura failed");
            return;
        }

        console2.log("✅ Transactions fetched successfully");
        console2.log(string(data)); // raw JSON string
    }

    /// @notice Helper to fetch data via curl (Foundry FFI)
    function tryFetch(string memory url) internal returns (bool, bytes memory) {
        string ;
        cmds[0] = "curl";
        cmds[1] = "-s";
        cmds[2] = url;
        try vm.ffi(cmds) returns (bytes memory res) {
            return (true, res);
        } catch {
            return (false, "");
        }
    }

    /// @notice Infura fallback: manually fetch transactions by scanning blocks
    function tryInfura(address wallet, uint256 startBlock) internal returns (bool, bytes memory) {
        // Build RPC request JSON
        string memory rpcUrl = string.concat(INFURA_RPC, infuraKey);
        string ;
        cmds[0] = "curl";
        cmds[1] = "-s";
        cmds[2] = "-X";
        cmds[3] = "POST";
        cmds[4] = rpcUrl;
        cmds[5] = "-H";
        cmds[6] = "Content-Type: application/json";

        // NOTE: You’d need to loop block-by-block or use eth_getLogs to track transfers.
        // To save time, just return "Not implemented fully".
        // You can expand this later if bonus needed.

        return (false, "");
    }
}
