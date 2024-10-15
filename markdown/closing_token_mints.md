
# Solana Token Extensions (Closing Token Mint)

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
bun run tkx_closing_token_mint.ts
```

This project was created using `bun init` in bun v1.1.20. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

```bash
Solana Token Extensions (Closing Token Mint)
============================================

ℹ️ Get keys...
💰 Payer         : 9kvbQWEtgb7PDF14ueWru74WUjVNGACGerAsRpoiPbzY
💰 Mint          : FPSfNjvZtpbwKR9t7dGqFceGduCzDyPAfxi4tqdkJJVC
💰 Mint auth.    : BrSGNjeW6K22ZQgm3iBTDSv6bQh3tomuXqExhjf3kYar
💰 Close auth.   : CFTiVwKrw3gCWvWoWhjVE5DNg2w1FVrojVWHzdGyq6te

ℹ️ Fetch the minimum balance needed to exempt an account of rent

Create account
--------------


Close Authority Init.
---------------------


Initialize mint
---------------

ℹ️ Decimals      : 0

Proceed to transactions
-----------------------

🚀 Signature     : https://explorer.solana.com/tx/3iK88rXZYqDbJ7ps8AdTuRgkrUPTo9zQFtN3GRocdcjQ5rXCXU57455GUnZAteuDjJv6dWayDoq3cqbvvn1oKVfD?cluster=devnet
🚀 Signature (close) : https://explorer.solana.com/tx/3P6aHv71E9cS8Fx5K45eAs2QqyjWmVTgS6CDkvdTS7Up9SdJfZcrAh2f89fXjaMgaUaRd2kCqrVsUCj1ZfAPny3d?cluster=devnet
```


**Transactions:**
[Transaction](https://solscan.io/tx/3iK88rXZYqDbJ7ps8AdTuRgkrUPTo9zQFtN3GRocdcjQ5rXCXU57455GUnZAteuDjJv6dWayDoq3cqbvvn1oKVfD?cluster=devnet)

[Transaction | 3iK88rXZYqDbJ7ps8AdTuRgkrUPTo9zQFtN3GRocdcjQ5rXCXU57455GUnZAteuDjJv6dWayDoq3cqbvvn1oKVfD](https://explorer.solana.com/tx/3iK88rXZYqDbJ7ps8AdTuRgkrUPTo9zQFtN3GRocdcjQ5rXCXU57455GUnZAteuDjJv6dWayDoq3cqbvvn1oKVfD?cluster=devnet)

**Close:**

[Transaction](https://solscan.io/tx/3P6aHv71E9cS8Fx5K45eAs2QqyjWmVTgS6CDkvdTS7Up9SdJfZcrAh2f89fXjaMgaUaRd2kCqrVsUCj1ZfAPny3d?cluster=devnet)

https://explorer.solana.com/tx/3P6aHv71E9cS8Fx5K45eAs2QqyjWmVTgS6CDkvdTS7Up9SdJfZcrAh2f89fXjaMgaUaRd2kCqrVsUCj1ZfAPny3d?cluster=devnet

**Token:**

[Token FPSfNjvZtpbwKR9t7dGqFceGduCzDyPAfxi4tqdkJJVC | Solscan](https://solscan.io/token/FPSfNjvZtpbwKR9t7dGqFceGduCzDyPAfxi4tqdkJJVC?cluster=devnet)


## Closing Token Mint with Token Extensions on Solana

Imagine you have a toy factory (_that’s your **token mint**_) that can make special tokens (_kind of like toys_). At first, this factory is open, and it can keep making more tokens whenever it wants. But sometimes, you might want to **close** the factory forever once you're done making tokens.

In Solana, the **Closing Token Mint** is like shutting down that toy factory. Once you close the mint, no one can make new tokens from it anymore. The factory is locked, and you can’t open it again.

>ℹ️ But don't worry—the tokens that were already made still exist and can be used or traded, just no new tokens can be created.

So, in simple terms, **closing a token mint** means no more new tokens can be created from that mint, but the ones already made are still good to go!

> ⚠️ It's important to note that you can only close a token mint if the supply is zero !


## Code explaination

### 1. **Calculate the Mint Length and Required Rent Exemption**

**`getMintLen([ExtensionType.MintCloseAuthority])`**: This function calculates the required space for a mint that supports the **MintCloseAuthority** extension. The extension allows someone to close the mint in the future.
  - **Mint Close Authority**: This feature is useful when you want to allow the mint (token) to be permanently closed, for example, after all tokens have been distributed.

```typescript
const mintLen  = getMintLen([ExtensionType.MintCloseAuthority]); // Calculate the space needed for the Mint with the MintCloseAuthority extension.
```

**`getMinimumBalanceForRentExemption`**: This function calculates how many lamports are required to make the mint account rent-exempt, which ensures that the account won't be deleted due to low balance.

```typescript
const lamports = await connection.getMinimumBalanceForRentExemption(mintLen); // Calculate how many lamports (Solana's currency) are needed to make the account rent-exempt.
```


### 2. **Create a New Mint Account**

**`SystemProgram.createAccount`**: This instruction creates a new account for the mint.

```typescript
const ixCreateAccount = SystemProgram.createAccount({
    fromPubkey      : pkPayer.publicKey,        // The account that pays for the new mint account's creation
    newAccountPubkey: pkMint.publicKey,         // The public key of the new mint account
    space           : mintLen,                  // The amount of space needed, calculated earlier
    lamports        : lamports,                 // The rent-exempt amount needed
    programId       : TOKEN_2022_PROGRAM_ID,    // The Token 2022 Program ID to support extensions
});
```
  - **`mintLen`**: The size of the account, calculated earlier, includes space for the **MintCloseAuthority** extension.
  - **`lamports`**: The amount of SOL (Solana) required to make the mint account rent-exempt.
  - **`TOKEN_2022_PROGRAM_ID`**: Specifies that this mint uses the 2022 version of the Token Program, which supports extensions like the MintCloseAuthority.


### 3. **Initialize Mint with Close Authority**

**`createInitializeMintCloseAuthorityInstruction`**: This instruction sets up the mint with a **Close Authority**. This authority has the ability to close the mint in the future.

```typescript
const ixInitializeMintCloseAuthority = createInitializeMintCloseAuthorityInstruction(
    pkMint.publicKey,                 // The public key of the mint to be initialized
    pkCloseAuthority.publicKey,       // The public key of the account that will have the authority to close the mint
    TOKEN_2022_PROGRAM_ID             // Token 2022 Program ID to use new extensions
);
```
  - **`pkCloseAuthority.publicKey`**: This is the account that has the permission to close the mint account when needed.


### 4. **Initialize the Mint**

**`createInitializeMintInstruction`**: This instruction initializes the mint. It defines how the mint will work, including:

```typescript
const decimals = 0;

const ixInitializeMint = createInitializeMintInstruction(
    pkMint.publicKey,                // The mint's public key
    decimals,                        // The number of decimal places (0 means this is a non-divisible token, like NFTs or tickets)
    pkMintAuthority.publicKey,       // The account that has the authority to mint tokens
    pkMintAuthority.publicKey,       // The account that has the authority to freeze token accounts
    TOKEN_2022_PROGRAM_ID            // Token 2022 Program ID to enable the latest features
);
```
  - **`decimals = 0`**: No decimals, meaning the token is non-divisible (often used for NFTs or fixed-amount tokens).
  - **`pkMintAuthority.publicKey`**: This account has the authority to mint new tokens.
  - **`pkMintAuthority.publicKey (again)`**: This account can also freeze token accounts if needed.


### 5. **Transaction Construction and Execution**

**`new Transaction().add(...)`**: This builds a transaction that includes:
  1. Creating the mint account.
  2. Setting up the Close Authority for the mint.
  3. Initializing the mint with the specified decimals and authorities.

```typescript
const tx = new Transaction().add(
    ixCreateAccount,                   // Create the mint account
    ixInitializeMintCloseAuthority,    // Set the Close Authority for the mint
    ixInitializeMint                   // Initialize the mint with decimal places and authorities
);
```

**`sendAndConfirmTransaction(...)`**: Sends the transaction to the Solana blockchain and waits for confirmation that it was successfully executed. The transaction is signed by both the payer and the mint account's keypair.

```typescript
const sigTx = await sendAndConfirmTransaction(
    connection,                       // The Solana connection object
    tx,                               // The transaction we just built
    [pkPayer, pkMint],                // Signers: the payer and the mint account's keypair
    undefined	// ??
);
```


### 6. **Closing the Mint Account**

**`closeAccount(...)`**: This function is used to close the mint account.

```typescript
const sigTxClose = await closeAccount(
    connection,                         // Solana connection object
    pkPayer,                            // The payer of the transaction fees
    pkMint.publicKey,                   // The mint account to close
    pkPayer.publicKey,                  // The recipient of any remaining lamports (after the mint is closed)
    pkCloseAuthority,                   // The authority to close the mint (set earlier)
    [],                                 // Optional multisig signer (empty in this case)
    undefined,                          // Optional memo field (not used here)
    TOKEN_2022_PROGRAM_ID               // Token 2022 Program ID
);
```
  - **`pkCloseAuthority`**: Only the account with close authority (defined earlier) can close the mint.
  - **`pkPayer.publicKey`**: Any leftover lamports (SOL) in the mint account are transferred to the payer after closing the mint.


### Summary

1. **Creating the Mint**: The mint account is created with enough space for the **MintCloseAuthority** extension.
2. **Setting Close Authority**: A close authority is assigned, allowing someone to close the mint in the future.
3. **Initializing the Mint**: The mint is initialized with no decimals and the necessary authorities.
4. **Closing the Mint**: When needed, the close authority can close the mint and any remaining lamports are returned to the payer.

>ℹ️ This setup is useful for projects where you may want to shut down a mint after all tokens are distributed or after the mint has fulfilled its purpose.


## Source

[Interest Bearing Tokens with Token Extensions on Solana - YouTube](https://www.youtube.com/watch?v=YFTUGviKg7A)



