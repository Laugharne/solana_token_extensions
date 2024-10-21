
# Solana Token Extensions (Token Transfer Fees)

## Install & launch...

### Install

If not previously done...

**1. Clone the repo:**

```bash
git clone https://github.com/Laugharne/solana_token_extensions
```
**2. Install bun if needed**

`curl -fsSL https://bun.sh/install | bash`

`bun --help`


**3. Install dependencies:**

```bash
bun install
```
**4. Configuration:**

In `config.ts`, choose your cluster

```typescript
export const cluster = "localhost"; // localhost | devnet
```

### Launch

All the operation can been made on a **local node validator** instead of devnet, because of aidrop problems...

By running `solana-test-validator` !

> ⚠️ Beware it creates local files and directories at the current working directory.

If you choose to use it in **local**, you have to launch in another terminal the node validator:

```bash
solana-test-validator --reset
```

> ⚠️ You will need a **payer wallet**, so you can create one (`devnet` & `localhost`) by using this script.

```bash
bun run create_payer.ts
```

```bash
Create Payer wallet
===================

🏧 Airdrop       : 2 SOL to 9kvbQWEtgb7PDF14ueWru74WUjVNGACGerAsRpoiPbzY
✅ Payer         : https://explorer.solana.com/address/9kvbQWEtgb7PDF14ueWru74WUjVNGACGerAsRpoiPbzY?cluster=devnet
```
Or reuse a wallet file in `./keypair` directory !


**To run:**

```bash
bun run tkx_token_transfer_fees.ts
```

This project was created using `bun init` in bun v1.1.20. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.


```bash
Solana Token Extensions (Token Transfer Fee)
============================================

ℹ️ Get keys...
💰 Payer         : 9kvbQWEtgb7PDF14ueWru74WUjVNGACGerAsRpoiPbzY
💰 Mint          : 8fBCgnUdxBkFuoc3cLBtNjqVzr88r9D6bF79DKcz5nzk
💰 Mint auth.    : 9MrK9qJoFwwaRAzmokymnjXJyh9K6w1YHmjsGrHigYBA
💰 Transfer fee conf. auth. : 3E1wqXiQApB8zb89jGprnr5bzJT8dQdZfHt7cRkTT3mu
💰 Mint auth.    : AtZxoXez336sJS2WDjcuGB1ZWZp99vQxLYNow9GHpASZ
💰 Owner         : 9wH16hRinKG9tsZ349TDyoc9bUoCW8DbQeXc6mhtqFmT
💰 Account (dest) : 46rhEiZJe98Y3XTNQRwGwmuaMP43RsXUfAvFmd1P2dCQ
ℹ️ Fetch the minimum balance needed to exempt an account of rent

Create account
--------------


Transfer fee config Init.
-------------------------

ℹ️ Decimals      : 50
ℹ️ Max fee       : 5000

Initialize mint
---------------

ℹ️ Decimals      : 9

Proceed to transactions
-----------------------

🚀 Signature     : https://explorer.solana.com/tx/5hpDd1NsNvFENDTWjbqKZQWJqHwhwprQFzo34KBm1N5Nu3yyCh7LN8SF2UXZqpSoNt8wy2LEYQVWTnATxd4i2p2P?cluster=devnet

Create account (source)
-----------------------

ℹ️ Mint amount   : 1000000000

Create account (destination)
----------------------------

ℹ️ Tx amount     : 1000000
ℹ️ Fee           : 5000
🚀 Transfer signature : https://explorer.solana.com/tx/48RReRDY7mZvngpsEPnEHCAZL4y1unWiLnb8QiU7GjArTGAuhp1ke8DRGvfni9oKBn8BAEH8agn1p3TvNZztYo2i?cluster=devnet

Get Program Accounts
--------------------


Withdraw withheld tokens from accounts
--------------------------------------

🚀 WithdrawWithheld... signature : https://explorer.solana.com/tx/4SzrqMGV7rNdZ5uU86gPztQvA1EX5G3jK9oPHy7Vndh9wsSSao6RtYktKWdKKQPHjQcKx74NS7rScbyj72fxKFuC?cluster=devnet

```

## Token Transfer Fees with Token Extensions on Solana

Imagine you're playing a game with your friends, and every time you want to give someone one of your toys, you have to pay a small fee, like a few candy pieces.

This way, whenever someone in the group trades toys, a small portion of candy goes to a "_candy jar_" that everyone has agreed to fill.

Now, in the world of Solana tokens, the **Token Transfer Fees** work the same way. When you send or transfer a token (like a digital coin or NFT) to someone else, a small fee is taken from the total amount you're sending. This fee is collected by a special account called the "_fee collector._"

The cool part is that this fee can be set up in different ways:
- The **amount** of the fee can depend on how much you're sending.
- The **fee collector** could be the creator of the token or anyone else who's in charge.

So, the **Token Transfer Fees** are like a tiny tax every time tokens are moved, and they help fund whoever is designated to receive those fees, like a piggy bank getting a little fuller with each trade!

**Token transfer fees** on Solana can be used to create a variety of economic models:
- Such as payment for use.
- Subscription-based access.
- Or revenue sharing.

They can also help to ensure the long-term sustainability of a project by generating revenue to support its ongoing development and maintenance.


## Code explaination


### 1. **Mint Creation with Transfer Fee Configuration**

**`getMintLen([ExtensionType.TransferFeeConfig])`**: This function calculates the required space for the mint, considering the **Transfer Fee Configuration** extension. This extension allows fees to be collected during token transfers.

```typescript
const mintLen  = getMintLen([ExtensionType.TransferFeeConfig]); // Calculate the space needed for the mint with Transfer Fee configuration extension
```

**`getMinimumBalanceForRentExemption`**: Calculates the number of lamports needed for the account to be rent-exempt.

```typescript
const lamports = await connection.getMinimumBalanceForRentExemption(mintLen); // Get the minimum balance required to make the account rent-exempt
```


### 2. **Creating the Mint Account**

**`SystemProgram.createAccount`**: Creates a new account for the mint on the Solana blockchain. This will be the mint where tokens are created.

```typescript
const ixCreateAccount = SystemProgram.createAccount({
	fromPubkey      : kpPayer.publicKey,        // The payer of the transaction
	newAccountPubkey: kpMint.publicKey,         // The public key of the new mint account
	space           : mintLen,                  // The amount of space needed, calculated earlier
	lamports        : lamports,                 // The rent-exempt amount needed
	programId       : TOKEN_2022_PROGRAM_ID,    // Using the Token 2022 Program which supports extensions
});
```

### 3. **Initializing the Transfer Fee Configuration**

- **`feeBasisPoint`**: Represents 0.5% (50 basis points). For every transfer, a 0.5% fee will be charged.
- **`maxFee`**: The fee will be capped at 5000 tokens, even if the calculated percentage would be higher.

```typescript
const feeBasisPoint = 50; // Set the fee to 0.5% (50 basis points)
const maxFee = BigInt(5_000); // Cap the maximum fee to 5000 tokens

const ixInitializeTransferFeeConfig = createInitializeTransferFeeConfigInstruction(
	kpMint.publicKey,                    // The mint where the transfer fee is configured
	kpTransferFeeConfigAuthority.publicKey, // The authority that can change the transfer fee
	kpWithdrawWithheldAuthority.publicKey,  // The authority that can withdraw the withheld fees
	feeBasisPoint,                        // The fee as a percentage in basis points (100 basis points = 1%)
	maxFee,                               // The maximum fee that can be charged per transaction
	TOKEN_2022_PROGRAM_ID                 // Using Token 2022 Program for extended features
);
```

**`createInitializeTransferFeeConfigInstruction`**: Initializes the mint with a transfer fee configuration, setting up how fees are collected during token transfers.


### 4. **Initializing the Mint**

**`createInitializeMintInstruction`**: Initializes the mint, specifying its decimals and the mint authority that can mint new tokens and freeze accounts.

```typescript
const decimals = 9; // The number of decimal places for the token (9 decimals, similar to how 1 SOL = 1,000,000,000 lamports)

const ixInitializeMint = createInitializeMintInstruction(
	kpMint.publicKey,                // The mint's public key
	decimals,                        // The number of decimals
	kpMintAuthority.publicKey,       // The account that has the authority to mint tokens
	kpMintAuthority.publicKey,       // The account that has the authority to freeze accounts
	TOKEN_2022_PROGRAM_ID            // Token 2022 Program ID to enable the latest features
);
```


### 5. **Transaction Construction and Execution**

**`sendAndConfirmTransaction(...)`**: Sends the transaction to the blockchain, executing:
1. The creation of the mint.
2. The transfer fee setup.
3. And the mint initialization.

It waits for confirmation that the transaction succeeded.

```typescript
const tx = new Transaction().add(
	ixCreateAccount,                  // Create the mint account
	ixInitializeTransferFeeConfig,    // Set the transfer fee configuration
	ixInitializeMint                  // Initialize the mint with the defined parameters
);

const sigTx = await sendAndConfirmTransaction(
	connection,                        // The Solana connection object
	tx,                                // The transaction built with the instructions
	[kpPayer, kpMint],                 // Signers: the payer and the mint account's keypair
	undefined	// Optional commitment level (left undefined)
);
```

---

### 6. **Minting Tokens and Creating Token Accounts**

- **`createAccount`**: Creates a new token account for holding tokens of the specified mint.
- **`mintTo`**: Mints new tokens to the specified token account, transferring `mintAmount` to the token account created above.

```typescript
const accountSource = await createAccount(
	connection,                        // The Solana connection object
	kpPayer,                           // The payer of the transaction
	kpMint.publicKey,                  // The mint whose tokens will be stored in this account
	kpOwner.publicKey,                 // The owner of the token account
	undefined,                         // No associated token program ID (uses default)
	undefined,                         // No extra space
	TOKEN_2022_PROGRAM_ID              // Using the Token 2022 Program for extended features
);

const mintAmount = BigInt(1_000_000_000); // Amount of tokens to mint (1 token with 9 decimals)

await mintTo(
	connection,                        // The Solana connection object
	kpPayer,                           // The payer of the transaction
	kpMint.publicKey,                  // The mint where the tokens come from
	accountSource,                     // The token account where the minted tokens will go
	kpMintAuthority,                   // The authority that can mint new tokens
	mintAmount,                        // The amount to mint
	[],                                // No multisig signers
	undefined,                         // No additional commitment level
	TOKEN_2022_PROGRAM_ID              // Using the Token 2022 Program for extended features
);
```


### 7. **Transferring Tokens with a Fee**

**`transferCheckedWithFee`**: This function transfers tokens between two token accounts while ensuring the transfer fee is calculated correctly. The fee is deducted from the transferred amount.

```typescript
const transferAmount = BigInt(1_000_000); // Transferring 1 token (in smallest units)
const fee = (transferAmount * BigInt(feeBasisPoint)) / BigInt(10_000); // Calculate the fee (0.5% of 1 million tokens)

const sigTransfer = await transferCheckedWithFee(
	connection,                        // The Solana connection object
	kpPayer,                           // The payer of the transaction
	accountSource,                     // The source token account (from where the tokens are sent)
	kpMint.publicKey,                  // The mint whose tokens are being transferred
	accountDestination,                // The destination token account (where the tokens go)
	kpOwner,                           // The owner of the token accounts
	transferAmount,                    // The amount to transfer
	decimals,                          // The number of decimals in the token
	fee,                               // The calculated fee
	[],                                // No multisig signers
	undefined,                         // No additional commitment level
	TOKEN_2022_PROGRAM_ID              // Using the Token 2022 Program for extended features
);
```

### 8. **Withdrawing Withheld Fees**

```typescript
const allAccounts = await connection.getProgramAccounts(
	TOKEN_2022_PROGRAM_ID, {
		commitment: 'confirmed',
		filters: [
			{
				memcmp: {
					offset: 0,
					bytes: kpMint.publicKey.toString(), // Filter to find accounts related to the mint
				}
			}
		]
	}
);

// Filtering out accounts with withheld fees
const accountsToWithdrawFrom = allAccounts.filter((accountInfo) => {
	const account = unpackAccount(
		accountInfo.pubkey,
		accountInfo.account,
		TOKEN_2022_PROGRAM_ID
	);

	const transferFeeAmount = getTransferFeeAmount(account);

	if (transferFeeAmount !== null && transferFeeAmount.withheldAmount > BigInt(0)) {
		return accountInfo.pubkey; // Keep accounts with withheld amounts
	}
}).map((accountInfo) => accountInfo.pubkey);

// Withdraw the withheld fees from the filtered accounts
const sigWithdrawWithheldTokensFromAccounts = await withdrawWithheldTokensFromAccounts(
	connection,                         // The Solana connection object
	kpPayer,                            // The payer of the transaction
	kpMint.publicKey,                   // The mint related to the withheld fees
	accountDestination,                 // The destination where withheld tokens will be transferred
	kpWithdrawWithheldAuthority,        // The authority allowed to withdraw withheld tokens
	[],                                 // No multisig signers
	accountsToWithdrawFrom,             // The accounts with withheld fees
	undefined,                          // No additional commitment level
	TOKEN_2022_PROGRAM_ID               // Using the Token 2022 Program for extended features
);
```
**`withdrawWithheldTokensFromAccounts`**: This function withdraws the withheld fees from specific token accounts and transfers them to the destination account.


### 9. **Harvest Withheld Tokens (Optional)**

The **harvestWithheldTokensToMint** and **withdrawWithheldTokensFromMint** functions, which are commented out in the provided code, allow users to **clear withheld tokens** from accounts into the mint.

These actions can help keep accounts!


## Sources

[Token Transfer Fees with Token Extensions on Solana - YouTube](https://www.youtube.com/watch?v=isFB5Tk6kPo)



