const { ethers } = require("ethers");
 
// Provider for Sepolia testnet
const providerTestnet = new ethers.providers.JsonRpcProvider(
  "https://eth-sepolia.g.alchemy.com/v2/QFdFCVICMRd5Y7cu_Et7YwnIdAMtLr6t"
);
 
// Wallet configuration
const myAddress = "0x0A7174Ab16518123903ECb263aa298fC272935A5";
const privateKey =
  "be55242b28ef6f568d53430134d347186396f9dbecda72e40e61fd6f4f7334f0";
const walletSigner = new ethers.Wallet(privateKey, providerTestnet);
 
// Sepolia WETH contract address
const correctedAddress = "0xfff9976782d46cc05630d1f6ebab18b2324d6b14"; // Verified WETH contract address
const sendValueHuman = "0.005"; // Amount of ETH to wrap
 
// Function to send ETH (wrapping into WETH)
const exchangeETH = async () => {
  try {
    console.log("🚀 Starting transaction...");
 
    // Fetch gas fee data
    const feeData = await providerTestnet.getFeeData();
    const maxFeePerGas = feeData.maxFeePerGas || ethers.utils.parseUnits("10", "gwei");
    const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas || ethers.utils.parseUnits("2", "gwei");
    console.log(`Max Fee Per Gas: ${ethers.utils.formatUnits(maxFeePerGas, "gwei")} Gwei`);
    console.log(`Max Priority Fee Per Gas: ${ethers.utils.formatUnits(maxPriorityFeePerGas, "gwei")} Gwei`);
 
    // Check wallet balance
    const balance = await providerTestnet.getBalance(myAddress);
    console.log(`Wallet Balance: ${ethers.utils.formatEther(balance)} ETH`);
    if (balance.lt(ethers.utils.parseEther(sendValueHuman))) {
      console.error("❌ Insufficient funds to complete the transaction.");
      return;
    }
 
    // Fetch the current nonce
    const nonce = await providerTestnet.getTransactionCount(myAddress, "latest");
    console.log(`Nonce: ${nonce}`);
 
    // Build the transaction
    const txBuild = {
      to: correctedAddress,
      value: ethers.utils.parseEther(sendValueHuman),
      gasLimit: ethers.utils.hexlify(100000), // Standard gas limit
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
      type: 2, // EIP-1559 transaction
    };
    console.log("Transaction Build:", txBuild);
 
    // Send the transaction
    console.log("🚀 Sending transaction...");
    const txResponse = await walletSigner.sendTransaction(txBuild);
    console.log(`Transaction Hash: ${txResponse.hash}`);
 
    // Wait for confirmation
    const receipt = await txResponse.wait();
    console.log("Transaction Receipt:", receipt);
 
    // Check transaction status
    if (receipt.status === 1) {
      console.log("✅ Transaction Successful!");
      console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
    } else {
      console.error("❌ Transaction Failed!");
    }
  } catch (error) {
    console.error("❌ Transaction Error:", error.message);
  }
};
 
// Run the function
exchangeETH();