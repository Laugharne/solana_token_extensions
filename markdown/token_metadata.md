# Solana Token Extensions (Non-Transferable Tokens)

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
bun run tkx_non_transferable_tokens.ts
```

This project was created using `bun init` in bun v1.1.20. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.


```bash
Solana Token Extensions (Token Metadata)
========================================

ℹ️ Get keys...
💰 Payer         : 9kvbQWEtgb7PDF14ueWru74WUjVNGACGerAsRpoiPbzY
💰 Mint          : A18qB7ZArjefRB46J77v8P7ud9Mgsxfr68dJikTFXPDv

Build Metadata
--------------


ℹ️ Fetch the minimum balance needed to exempt an account of rent

Create account
--------------


Metadata Pointer Init.
----------------------


Initialize mint
---------------

ℹ️ Decimals      : 2

Metadata Init.
--------------


Proceed to transactions
-----------------------

🚀 Signature     : https://explorer.solana.com/tx/4DdKgshRtxHGuBqTN63Au2CyRF2hhKoGaBBpSDg5T21ExL6tC9TRqHCXY3XpwKm2RL1dTGakdSnmkj5EK55jj2UN?cluster=devnet

{
  updateAuthority: PublicKey {
    _bn: <BN: 821e1176c4f92a70ca6acf2329d3dab234bd9127dad9e1c5df84708bb5791f51>,
    equals: [Function: equals],
    toBase58: [Function: toBase58],
    toJSON: [Function: toJSON],
    toBytes: [Function: toBytes],
    toBuffer: [Function: toBuffer],
    toString: [Function: toString],
    encode: [Function: encode],
  },
  mint: PublicKey {
    _bn: <BN: 85c2095293e157303d625beea15f721470269c1afb627bad4ce1709ebb09c615>,
    equals: [Function: equals],
    toBase58: [Function: toBase58],
    toJSON: [Function: toJSON],
    toBytes: [Function: toBytes],
    toBuffer: [Function: toBuffer],
    toString: [Function: toString],
    encode: [Function: encode],
  },
  name: "Test Metadata Token",
  symbol: "Test",
  uri: "https://laugharne.github.io/logo.png",
  additionalMetadata: [
    [ "key", "value" ]
  ],
}
```
[transaction](https://explorer.solana.com/tx/4DdKgshRtxHGuBqTN63Au2CyRF2hhKoGaBBpSDg5T21ExL6tC9TRqHCXY3XpwKm2RL1dTGakdSnmkj5EK55jj2UN?cluster=devnet)


**Instruction Data:**

```json
{
  "info": {
    "authority":       "9kvbQWEtgb7PDF14ueWru74WUjVNGACGerAsRpoiPbzY",
    "metadataAddress": "A18qB7ZArjefRB46J77v8P7ud9Mgsxfr68dJikTFXPDv",
    "mint":             "A18qB7ZArjefRB46J77v8P7ud9Mgsxfr68dJikTFXPDv"
  },
  "type": "initializeMetadataPointer"
}
```


## Token Metadata with Token Extensions on Solana

Imagine you have a special sticker collection. Each sticker has its own unique design, maybe a picture of your favorite animal or character, and you want to show it to your friends.

But just looking at the stickers isn’t enough—you also want to tell them all about each one, like what the sticker is called, who made it, or if it's super rare.

On Solana, **Token Metadata** is like a card that comes with a token (a digital object) that describes it. This card doesn’t change the token itself, but it tells everyone important information about it, like:

- **Name**: What’s the token called (like naming your favorite sticker)?
- **Symbol**: A short code for the token (like a nickname, such as "_DOGE_" for a Dogecoin token).
- **Description**: A bit more detail about what the token is for.
- **Image or Link**: Sometimes, there's a picture or link so people can see what the token looks like, like your sticker’s design.
- **Attributes**: Extra details like "_this token is rare_" or "_it’s part of a special collection._"

So, in simple terms, **Token Metadata** is the description card that tells everyone what your token is, just like you would describe your favorite sticker to your friends!

**For example**, if you have a toy car in your toy box, the metadata for that toy car might include the name "Super Fast Racing Car", a picture of the car, and a description of its features and capabilities.

This metadata can help other people understand what the toy car is, what it can do, and how it's different from other toys in your toy box.

Token metadata on Solana can be used for a variety of purposes, such as displaying information on a website or app, enabling smart contracts to interact with the tokens, or allowing for the creation of unique and collectible digital assets.


## Code explaination


### 1. **Define Token Metadata**

**`TokenMetadata`**: This object holds basic information about the token, such as its mint, name, symbol, URI, and additional metadata. The URI typically links to off-chain resources (like IPFS) containing images, descriptions, or other properties.

```typescript
const metadata: TokenMetadata = {
	mint              : pkMint.publicKey,      // Public key of the mint account
	name              : tokenName,             // Name of the token
	symbol            : tokenSymbol,           // Symbol of the token
	uri               : tokenUri,              // URI that links to off-chain metadata (like images or additional info)
	additionalMetadata: [
		["key", "value"]                       // Custom metadata as key-value pairs
	]
}
```

  - **`additionalMetadata`**: Stores extra fields that can be customized for this token, allowing developers to extend metadata with additional information.


### 2. **Calculate Mint and Metadata Space, and Rent Exemption**

**`getMintLen([ExtensionType.MetadataPointer])`**: This function calculates the space needed for the mint account, considering that it will use the **MetadataPointer** extension, which allows for on-chain or off-chain metadata storage.

```typescript
const mintSpace     = getMintLen([ExtensionType.MetadataPointer]);  // Calculate the space required for the mint with a MetadataPointer extension
```

- **`metadataSpace`**: This determines how much space is required to store the metadata object on-chain.
  - **`TYPE_SIZE + LENGTH_SIZE + pack(metadata).length`**: Adds up the size of the type, length of the metadata, and the actual metadata packed in bytes.

```typescript
const metadataSpace = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;  // Calculate how much space is needed to store the metadata on-chain
```

- **`getMinimumBalanceForRentExemption`**: This function calculates how many lamports (the smallest unit of SOL) are needed to make the mint and metadata storage rent-exempt.

```typescript
const lamports      = await connection.getMinimumBalanceForRentExemption(mintSpace + metadataSpace);  // Compute the number of lamports needed for rent exemption
```

### 3. **Create Mint Account**

**`SystemProgram.createAccount`**: This instruction creates the mint account with the exact space needed for the **MetadataPointer** extension. The lamports ensure the mint account will not be charged rent.

```typescript
const ixCreateAccount = SystemProgram.createAccount({
	fromPubkey      : pkPayer.publicKey,        // The account paying for the transaction
	newAccountPubkey: pkMint.publicKey,         // Public key of the mint account being created
	space           : mintSpace,                // The space required for the mint account itself
	lamports        : lamports,                 // The rent-exempt lamport amount calculated earlier
	programId       : TOKEN_2022_PROGRAM_ID,    // Specifies that this mint uses the 2022 Token Program
});
```

### 4. **Initialize Metadata Pointer**

**`createInitializeMetadataPointerInstruction`**: Initializes the **MetadataPointer** extension for the mint. This extension allows the mint to reference metadata either stored on-chain or off-chain.

```typescript
const ixInitializeMetadataPointer = createInitializeMetadataPointerInstruction(
	pkMint.publicKey,             // Mint account to initialize the metadata pointer
	pkPayer.publicKey,            // Account paying for the initialization
	pkMint.publicKey,             // Authority for metadata pointer updates
	TOKEN_2022_PROGRAM_ID         // Token 2022 Program to support this extension
);
```

### 5. **Initialize the Mint**

**`createInitializeMintInstruction`**: This instruction sets up the mint with the specified number of decimals (2 in this case, meaning the token is divisible up to 2 decimal places).

```typescript
const decimals = 2;

const ixInitializeMint = createInitializeMintInstruction(
	pkMint.publicKey,             // Mint account to initialize
	decimals,                     // Number of decimal places for the token (2 in this case)
	pkPayer.publicKey,            // Mint authority: who can mint new tokens
	null,                         // Freeze authority: no freeze authority is assigned
	TOKEN_2022_PROGRAM_ID         // Token 2022 Program to enable extensions
);
```

  - **Mint authority**: The account that can mint new tokens.
  - **No freeze authority**: No account is given permission to freeze accounts holding this token.


### 6. **Initialize Token Metadata**

**`createInitializeInstruction`**: This sets up the initial metadata for the token, associating the mint with a name, symbol, and URI.

```typescript
const ixInitializeMetadata = createInitializeInstruction({
	mint           : pkMint.publicKey,         // The mint associated with the metadata
	metadata       : pkMint.publicKey,         // The metadata account (often the same as the mint account)
	mintAuthority  : pkPayer.publicKey,        // Authority responsible for minting
	name           : metadata.name,            // Name of the token
	symbol         : metadata.symbol,          // Symbol of the token
	uri            : metadata.uri,             // Off-chain URI that stores additional metadata (like images)
	programId      : TOKEN_2022_PROGRAM_ID,    // Token 2022 Program to handle metadata
	updateAuthority: pkPayer.publicKey          // Authority allowed to update metadata fields
});
```

  - **URI**: This typically points to a JSON file stored off-chain (on IPFS, Arweave, etc.) that contains more detailed metadata.
  - **Update Authority**: This account has permission to update metadata fields after initialization.


### 7. **Update Metadata Field**

**`createUpdateFieldInstruction`**: This allows specific fields in the metadata to be updated. In this case, the custom field in **`additionalMetadata`** is being updated.

```typescript
const ixUpdateMetadataField = createUpdateFieldInstruction({
	metadata: pkMint.publicKey,                // The metadata account to update
	programId: TOKEN_2022_PROGRAM_ID,          // Token 2022 Program to handle metadata
	updateAuthority: pkPayer.publicKey,        // Authority with permission to update
	field: metadata.additionalMetadata[0][0],  // The field to update (key)
	value: metadata.additionalMetadata[0][1]   // The new value for the field
});
```

  - **`field`**: The key to update.
  - **`value`**: The new value for the key.


### 8. **Transaction Construction and Execution**

**`new Transaction().add(...)`**: This bundles all instructions into a single transaction, which will be sent to the Solana blockchain.

```typescript
const tx = new Transaction().add(
	ixCreateAccount,                // Create the mint account
	ixInitializeMetadataPointer,    // Initialize the metadata pointer extension
	ixInitializeMint,               // Initialize the mint
	ixInitializeMetadata,           // Initialize the token's metadata
	ixUpdateMetadataField           // Update specific metadata field
);
```

**`sendAndConfirmTransaction(...)`**: Sends the transaction and waits for confirmation that it was executed successfully.

```typescript
const sigTx = await sendAndConfirmTransaction(
	connection,                    // Solana connection object
	tx,                            // The transaction built above
	[pkPayer, pkMint],             // Signers for the transaction (payer and mint account)
	undefined                      // Confirmation options (not provided here)
);
```

### 9. **Fetch the Metadata on the Blockchain**

**`getTokenMetadata(...)`**: Fetches the token metadata from the blockchain to verify that everything was stored and updated correctly.

```typescript
const chainMetadata = await getTokenMetadata(
	connection,                      // Solana connection object
	pkMint.publicKey                 // Mint account's public key to fetch metadata
);
```

### Summary
1. **Create the Mint**: The mint account is created with the required space and extensions.
2. **Initialize Metadata Pointer**: The mint is linked to a metadata pointer, allowing metadata to be stored on-chain or off-chain.
3. **Initialize Mint and Metadata**: The mint is initialized with the necessary parameters (decimals, authority), and its metadata is set up (name, symbol, URI).
4. **Update Metadata**: A specific field in the metadata is updated.
5. **Fetch Metadata**: After execution, the metadata is fetched from the blockchain to confirm it was correctly stored.

This process demonstrates how Solana's token extensions can be used to handle advanced token operations like dynamic metadata updates, on-chain/off-chain metadata pointers, and more.

## Sources

[Token Metadata with Token Extensions on Solana - YouTube](https://www.youtube.com/watch?v=l7EyQUlNAdw)