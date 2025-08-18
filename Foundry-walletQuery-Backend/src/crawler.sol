// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Ethereum Transaction Crawler
/// @notice Crawls and stores Ethereum transactions and token transfers for analysis
/// @dev This contract stores transaction data and provides querying functionality
contract Crawler {
    // CONSTANTS
    uint256 private constant VALUE_PRECISION = 1e18;
    uint256 private constant MAX_RESULTS_PER_QUERY = 1000;
    
    // STRUCTS
    struct Transaction {
        uint256 blockNumber;
        uint256 timestamp;
        address from;
        address to;
        uint256 value; // in wei
        bytes32 txHash;
        uint256 gasUsed;
        uint256 gasPrice;
    }

    struct TokenTransfer {
        uint256 blockNumber;
        uint256 timestamp;
        address tokenContract;
        address from;
        address to;
        uint256 value; // ERC20 amount (raw decimals)
        bytes32 txHash;
        string tokenSymbol;
        uint8 tokenDecimals;
    }

    struct WalletInteraction {
        address wallet;
        uint256 transactionCount;
        uint256 totalEthReceived;
        uint256 totalEthSent;
        uint256 firstInteractionBlock;
        uint256 lastInteractionBlock;
    }

    struct BalanceSnapshot {
        uint256 blockNumber;
        uint256 timestamp;
        uint256 ethBalance;
        mapping(address => uint256) tokenBalances; // tokenContract => balance
    }

    // STATE VARIABLES
    address public owner;
    mapping(address => Transaction[]) public walletTransactions;
    mapping(address => TokenTransfer[]) public walletTokenTransfers;
    mapping(address => mapping(address => WalletInteraction)) public walletInteractions; // wallet => interactedWallet => interaction
    mapping(address => address[]) public walletInteractionsList; // wallet => list of addresses it interacted with
    mapping(address => BalanceSnapshot[]) public walletBalanceHistory;
    
    // Transaction indexing
    mapping(bytes32 => bool) public processedTransactions;
    mapping(uint256 => bytes32[]) public blockTransactions; // blockNumber => txHashes
    
    // Events
    event TransactionStored(
        bytes32 indexed txHash,
        address indexed from,
        address indexed to,
        uint256 value,
        uint256 blockNumber
    );
    
    event TokenTransferStored(
        bytes32 indexed txHash,
        address indexed tokenContract,
        address indexed from,
        address to,
        uint256 value,
        uint256 blockNumber
    );

    event BalanceSnapshotCreated(
        address indexed wallet,
        uint256 blockNumber,
        uint256 timestamp,
        uint256 ethBalance
    );

    // MODIFIERS
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier validAddress(address addr) {
        require(addr != address(0), "Invalid address");
        _;
    }

    // CONSTRUCTOR
    constructor() {
        owner = msg.sender;
    }

    // MAIN FUNCTIONS

    /// @notice Store a batch of transactions for efficient gas usage
    /// @param transactions Array of transactions to store
    function storeTransactionBatch(Transaction[] calldata transactions) external onlyOwner {
        for (uint256 i = 0; i < transactions.length; i++) {
            _storeTransaction(transactions[i]);
        }
    }

    /// @notice Store a single transaction
    /// @param transaction The transaction to store
    function storeTransaction(Transaction calldata transaction) external onlyOwner {
        _storeTransaction(transaction);
    }

    /// @notice Store a batch of token transfers
    /// @param transfers Array of token transfers to store
    function storeTokenTransferBatch(TokenTransfer[] calldata transfers) external onlyOwner {
        for (uint256 i = 0; i < transfers.length; i++) {
            _storeTokenTransfer(transfers[i]);
        }
    }

    /// @notice Store a single token transfer
    /// @param transfer The token transfer to store
    function storeTokenTransfer(TokenTransfer calldata transfer) external onlyOwner {
        _storeTokenTransfer(transfer);
    }

    /// @notice Create a balance snapshot for a wallet at a specific block
    /// @param wallet The wallet address
    /// @param blockNumber The block number
    /// @param timestamp The timestamp of the block
    /// @param ethBalance The ETH balance at that block
    function createBalanceSnapshot(
        address wallet,
        uint256 blockNumber,
        uint256 timestamp,
        uint256 ethBalance
    ) external onlyOwner validAddress(wallet) {
        walletBalanceHistory[wallet].push();
        uint256 index = walletBalanceHistory[wallet].length - 1;
        walletBalanceHistory[wallet][index].blockNumber = blockNumber;
        walletBalanceHistory[wallet][index].timestamp = timestamp;
        walletBalanceHistory[wallet][index].ethBalance = ethBalance;

        emit BalanceSnapshotCreated(wallet, blockNumber, timestamp, ethBalance);
    }

    /// @notice Add token balance to an existing snapshot
    /// @param wallet The wallet address
    /// @param snapshotIndex The index of the snapshot
    /// @param tokenContract The token contract address
    /// @param balance The token balance
    function addTokenBalanceToSnapshot(
        address wallet,
        uint256 snapshotIndex,
        address tokenContract,
        uint256 balance
    ) external onlyOwner validAddress(wallet) validAddress(tokenContract) {
        require(snapshotIndex < walletBalanceHistory[wallet].length, "Invalid snapshot index");
        walletBalanceHistory[wallet][snapshotIndex].tokenBalances[tokenContract] = balance;
    }

    // QUERY FUNCTIONS

    /// @notice Get transactions for a wallet within a block range
    /// @param wallet The wallet address to query
    /// @param fromBlock Starting block number (inclusive)
    /// @param toBlock Ending block number (inclusive)
    /// @return Array of transactions
    function getTransactionsInRange(
        address wallet,
        uint256 fromBlock,
        uint256 toBlock
    ) external view validAddress(wallet) returns (Transaction[] memory) {
        Transaction[] storage allTxs = walletTransactions[wallet];
        uint256 count = 0;
        
        // First pass: count matching transactions
        for (uint256 i = 0; i < allTxs.length; i++) {
            if (allTxs[i].blockNumber >= fromBlock && allTxs[i].blockNumber <= toBlock) {
                count++;
                if (count >= MAX_RESULTS_PER_QUERY) break;
            }
        }
        
        // Second pass: collect matching transactions
        Transaction[] memory result = new Transaction[](count);
        uint256 resultIndex = 0;
        
        for (uint256 i = 0; i < allTxs.length && resultIndex < count; i++) {
            if (allTxs[i].blockNumber >= fromBlock && allTxs[i].blockNumber <= toBlock) {
                result[resultIndex] = allTxs[i];
                resultIndex++;
            }
        }
        
        return result;
    }

    /// @notice Get token transfers for a wallet within a block range
    /// @param wallet The wallet address to query
    /// @param fromBlock Starting block number (inclusive)
    /// @param toBlock Ending block number (inclusive)
    /// @return Array of token transfers
    function getTokenTransfersInRange(
        address wallet,
        uint256 fromBlock,
        uint256 toBlock
    ) external view validAddress(wallet) returns (TokenTransfer[] memory) {
        TokenTransfer[] storage allTransfers = walletTokenTransfers[wallet];
        uint256 count = 0;
        
        // First pass: count matching transfers
        for (uint256 i = 0; i < allTransfers.length; i++) {
            if (allTransfers[i].blockNumber >= fromBlock && allTransfers[i].blockNumber <= toBlock) {
                count++;
                if (count >= MAX_RESULTS_PER_QUERY) break;
            }
        }
        
        // Second pass: collect matching transfers
        TokenTransfer[] memory result = new TokenTransfer[](count);
        uint256 resultIndex = 0;
        
        for (uint256 i = 0; i < allTransfers.length && resultIndex < count; i++) {
            if (allTransfers[i].blockNumber >= fromBlock && allTransfers[i].blockNumber <= toBlock) {
                result[resultIndex] = allTransfers[i];
                resultIndex++;
            }
        }
        
        return result;
    }

    /// @notice Get all addresses that interacted with a wallet
    /// @param wallet The wallet address to query
    /// @return Array of addresses that interacted with the wallet
    function getWalletInteractions(address wallet) 
        external 
        view 
        validAddress(wallet) 
        returns (address[] memory) 
    {
        return walletInteractionsList[wallet];
    }

    /// @notice Get interaction details between two wallets
    /// @param wallet1 First wallet address
    /// @param wallet2 Second wallet address
    /// @return WalletInteraction struct with interaction details
    function getInteractionDetails(address wallet1, address wallet2) 
        external 
        view 
        validAddress(wallet1) 
        validAddress(wallet2) 
        returns (WalletInteraction memory) 
    {
        return walletInteractions[wallet1][wallet2];
    }

    /// @notice Get ETH balance at a specific block (latest snapshot before or at block)
    /// @param wallet The wallet address
    /// @param blockNumber The target block number
    /// @return The ETH balance at that block
    function getEthBalanceAtBlock(address wallet, uint256 blockNumber) 
        external 
        view 
        validAddress(wallet) 
        returns (uint256) 
    {
        BalanceSnapshot[] storage snapshots = walletBalanceHistory[wallet];
        if (snapshots.length == 0) return 0;

        // Find the latest snapshot before or at the target block
        uint256 latestValidBalance = 0;
        for (uint256 i = 0; i < snapshots.length; i++) {
            if (snapshots[i].blockNumber <= blockNumber) {
                latestValidBalance = snapshots[i].ethBalance;
            } else {
                break; // Snapshots should be ordered by block number
            }
        }
        
        return latestValidBalance;
    }

    /// @notice Get token balance at a specific block
    /// @param wallet The wallet address
    /// @param tokenContract The token contract address
    /// @param blockNumber The target block number
    /// @return The token balance at that block
    function getTokenBalanceAtBlock(
        address wallet, 
        address tokenContract, 
        uint256 blockNumber
    ) external view validAddress(wallet) validAddress(tokenContract) returns (uint256) {
        BalanceSnapshot[] storage snapshots = walletBalanceHistory[wallet];
        if (snapshots.length == 0) return 0;

        // Find the latest snapshot before or at the target block
        uint256 latestValidBalance = 0;
        for (uint256 i = 0; i < snapshots.length; i++) {
            if (snapshots[i].blockNumber <= blockNumber) {
                latestValidBalance = snapshots[i].tokenBalances[tokenContract];
            } else {
                break;
            }
        }
        
        return latestValidBalance;
    }

    /// @notice Get balance snapshot at a specific timestamp (for date queries)
    /// @param wallet The wallet address
    /// @param targetTimestamp The target timestamp (YYYY-MM-DD 00:00 UTC converted to timestamp)
    /// @return ethBalance The ETH balance at that time
    /// @return blockNumber The block number of the snapshot
    function getBalanceAtTimestamp(address wallet, uint256 targetTimestamp) 
        external 
        view 
        validAddress(wallet) 
        returns (uint256 ethBalance, uint256 blockNumber) 
    {
        BalanceSnapshot[] storage snapshots = walletBalanceHistory[wallet];
        if (snapshots.length == 0) return (0, 0);

        // Find the latest snapshot before or at the target timestamp
        for (uint256 i = 0; i < snapshots.length; i++) {
            if (snapshots[i].timestamp <= targetTimestamp) {
                ethBalance = snapshots[i].ethBalance;
                blockNumber = snapshots[i].blockNumber;
            } else {
                break;
            }
        }
    }

    // UTILITY FUNCTIONS

    /// @notice Helper to convert wei to ETH (1e18)
    /// @param weiAmount Amount in wei
    /// @return Amount in ETH
    function weiToEth(uint256 weiAmount) public pure returns (uint256) {
        return weiAmount / VALUE_PRECISION;
    }

    /// @notice Helper to convert wei to ETH with decimals
    /// @param weiAmount Amount in wei
    /// @return Amount in ETH as a scaled integer (multiply by 1e18 for actual ETH)
    function weiToEthWithDecimals(uint256 weiAmount) public pure returns (uint256) {
        return weiAmount; // Return as-is since it's already in wei (1e18 = 1 ETH)
    }

    /// @notice Get transaction count for a wallet
    /// @param wallet The wallet address
    /// @return Number of transactions
    function getTransactionCount(address wallet) external view validAddress(wallet) returns (uint256) {
        return walletTransactions[wallet].length;
    }

    /// @notice Get token transfer count for a wallet
    /// @param wallet The wallet address
    /// @return Number of token transfers
    function getTokenTransferCount(address wallet) external view validAddress(wallet) returns (uint256) {
        return walletTokenTransfers[wallet].length;
    }

    /// @notice Get total ETH received by a wallet
    /// @param wallet The wallet address
    /// @return Total ETH received in wei
    function getTotalEthReceived(address wallet) external view validAddress(wallet) returns (uint256) {
        Transaction[] storage txs = walletTransactions[wallet];
        uint256 total = 0;
        
        for (uint256 i = 0; i < txs.length; i++) {
            if (txs[i].to == wallet) {
                total += txs[i].value;
            }
        }
        
        return total;
    }

    /// @notice Get total ETH sent by a wallet
    /// @param wallet The wallet address
    /// @return Total ETH sent in wei
    function getTotalEthSent(address wallet) external view validAddress(wallet) returns (uint256) {
        Transaction[] storage txs = walletTransactions[wallet];
        uint256 total = 0;
        
        for (uint256 i = 0; i < txs.length; i++) {
            if (txs[i].from == wallet) {
                total += txs[i].value;
            }
        }
        
        return total;
    }

    /// @notice Check if a transaction has been processed
    /// @param txHash The transaction hash
    /// @return True if processed, false otherwise
    function isTransactionProcessed(bytes32 txHash) external view returns (bool) {
        return processedTransactions[txHash];
    }

    // INTERNAL FUNCTIONS

    /// @notice Internal function to store a transaction
    /// @param transaction The transaction to store
    function _storeTransaction(Transaction calldata transaction) internal {
        require(!processedTransactions[transaction.txHash], "Transaction already processed");
        require(transaction.from != address(0) || transaction.to != address(0), "Invalid transaction");

        // Store transaction for both from and to addresses
        if (transaction.from != address(0)) {
            walletTransactions[transaction.from].push(transaction);
            _updateWalletInteraction(transaction.from, transaction.to, transaction.value, true, transaction.blockNumber);
        }
        
        if (transaction.to != address(0) && transaction.to != transaction.from) {
            walletTransactions[transaction.to].push(transaction);
            _updateWalletInteraction(transaction.to, transaction.from, transaction.value, false, transaction.blockNumber);
        }

        // Mark as processed and index by block
        processedTransactions[transaction.txHash] = true;
        blockTransactions[transaction.blockNumber].push(transaction.txHash);

        emit TransactionStored(
            transaction.txHash,
            transaction.from,
            transaction.to,
            transaction.value,
            transaction.blockNumber
        );
    }

    /// @notice Internal function to store a token transfer
    /// @param transfer The token transfer to store
    function _storeTokenTransfer(TokenTransfer calldata transfer) internal {
        require(!processedTransactions[transfer.txHash], "Transfer already processed");
        require(transfer.tokenContract != address(0), "Invalid token contract");
        require(transfer.from != address(0) || transfer.to != address(0), "Invalid transfer");

        // Store transfer for both from and to addresses
        if (transfer.from != address(0)) {
            walletTokenTransfers[transfer.from].push(transfer);
        }
        
        if (transfer.to != address(0) && transfer.to != transfer.from) {
            walletTokenTransfers[transfer.to].push(transfer);
        }

        // Mark as processed
        processedTransactions[transfer.txHash] = true;

        emit TokenTransferStored(
            transfer.txHash,
            transfer.tokenContract,
            transfer.from,
            transfer.to,
            transfer.value,
            transfer.blockNumber
        );
    }

    /// @notice Update wallet interaction statistics
    /// @param wallet The primary wallet
    /// @param otherWallet The wallet it interacted with
    /// @param value The transaction value
    /// @param isSent True if wallet sent, false if received
    /// @param blockNumber The block number of interaction
    function _updateWalletInteraction(
        address wallet,
        address otherWallet,
        uint256 value,
        bool isSent,
        uint256 blockNumber
    ) internal {
        if (otherWallet == address(0)) return;

        WalletInteraction storage interaction = walletInteractions[wallet][otherWallet];
        
        // If this is the first interaction, add to the list
        if (interaction.transactionCount == 0) {
            walletInteractionsList[wallet].push(otherWallet);
            interaction.wallet = otherWallet;
            interaction.firstInteractionBlock = blockNumber;
        }

        interaction.transactionCount++;
        interaction.lastInteractionBlock = blockNumber;

        if (isSent) {
            interaction.totalEthSent += value;
        } else {
            interaction.totalEthReceived += value;
        }
    }

    // ADMIN FUNCTIONS

    /// @notice Transfer ownership of the contract
    /// @param newOwner The new owner address
    function transferOwnership(address newOwner) external onlyOwner validAddress(newOwner) {
        owner = newOwner;
    }

    /// @notice Clear transaction data for a specific wallet (for testing/cleanup)
    /// @param wallet The wallet address to clear data for
    function clearWalletData(address wallet) external onlyOwner validAddress(wallet) {
        delete walletTransactions[wallet];
        delete walletTokenTransfers[wallet];
        delete walletBalanceHistory[wallet];
        
        // Clear interactions
        address[] storage interactions = walletInteractionsList[wallet];
        for (uint256 i = 0; i < interactions.length; i++) {
            delete walletInteractions[wallet][interactions[i]];
        }
        delete walletInteractionsList[wallet];
    }

    /// @notice Emergency function to clear all data
    function emergencyReset() external onlyOwner {
        // Note: This is a simplified reset. In production, you might want more granular control
        // Due to gas limits, this function should be used carefully
    }

    // VIEW FUNCTIONS FOR FRONTEND

    /// @notice Get summary statistics for a wallet
    /// @param wallet The wallet address
    /// @return transactionCount Total number of transactions
    /// @return tokenTransferCount Total number of token transfers
    /// @return totalReceived Total ETH received in wei
    /// @return totalSent Total ETH sent in wei
    /// @return interactionCount Number of unique addresses interacted with
    function getWalletSummary(address wallet) 
        external 
        view 
        validAddress(wallet) 
        returns (
            uint256 transactionCount,
            uint256 tokenTransferCount,
            uint256 totalReceived,
            uint256 totalSent,
            uint256 interactionCount
        ) 
    {
        transactionCount = walletTransactions[wallet].length;
        tokenTransferCount = walletTokenTransfers[wallet].length;
        interactionCount = walletInteractionsList[wallet].length;
        
        // Calculate totals
        Transaction[] storage txs = walletTransactions[wallet];
        for (uint256 i = 0; i < txs.length; i++) {
            if (txs[i].to == wallet) {
                totalReceived += txs[i].value;
            } else if (txs[i].from == wallet) {
                totalSent += txs[i].value;
            }
        }
    }

    /// @notice Get the latest balance snapshot for a wallet
    /// @param wallet The wallet address
    /// @return blockNumber The block number of the latest snapshot
    /// @return timestamp The timestamp of the latest snapshot
    /// @return ethBalance The ETH balance in the latest snapshot
    function getLatestBalance(address wallet) 
        external 
        view 
        validAddress(wallet) 
        returns (uint256 blockNumber, uint256 timestamp, uint256 ethBalance) 
    {
        BalanceSnapshot[] storage snapshots = walletBalanceHistory[wallet];
        if (snapshots.length == 0) return (0, 0, 0);
        
        uint256 latestIndex = snapshots.length - 1;
        return (
            snapshots[latestIndex].blockNumber,
            snapshots[latestIndex].timestamp,
            snapshots[latestIndex].ethBalance
        );
    }

    /// @notice Get token balance from latest snapshot
    /// @param wallet The wallet address
    /// @param tokenContract The token contract address
    /// @return The latest token balance
    function getLatestTokenBalance(address wallet, address tokenContract) 
        external 
        view 
        validAddress(wallet) 
        validAddress(tokenContract) 
        returns (uint256) 
    {
        BalanceSnapshot[] storage snapshots = walletBalanceHistory[wallet];
        if (snapshots.length == 0) return 0;
        
        uint256 latestIndex = snapshots.length - 1;
        return snapshots[latestIndex].tokenBalances[tokenContract];
    }

    /// @notice Get transaction by hash (if stored)
    /// @param wallet The wallet that should have this transaction
    /// @param txHash The transaction hash to find
    /// @return found True if transaction was found
    /// @return transaction The transaction data
    function getTransactionByHash(address wallet, bytes32 txHash) 
        external 
        view 
        validAddress(wallet) 
        returns (bool found, Transaction memory transaction) 
    {
        Transaction[] storage txs = walletTransactions[wallet];
        for (uint256 i = 0; i < txs.length; i++) {
            if (txs[i].txHash == txHash) {
                return (true, txs[i]);
            }
        }
        return (false, Transaction(0, 0, address(0), address(0), 0, bytes32(0), 0, 0));
    }
}