# Solana Token Extensions (Default Account state)

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
bun run tkx_reallocate_size.ts
```

```bash
Solana Token Extensions (Default Account State)
==========================================

ℹ️ Get keys...
💰 Payer         : 9kvbQWEtgb7PDF14ueWru74WUjVNGACGerAsRpoiPbzY
💰 Mint          : EGKNDVKxUDBmVzgYabeeCQq77FXckyUTZpiuSdG6JBdj
💰 Mint auth.    : HXZ7DtFwwyxoqHeNhLgnBwE25BidSj2w161TEbeid4kk

ℹ️ Fetch the minimum balance needed to exempt an account of rent

Create account
--------------


Set default state (Frozen)
--------------------------


Initialize mint
---------------

ℹ️ Decimals      : 9

Proceed to transactions
-----------------------

🚀 Signature     : https://explorer.solana.com/tx/63iVQHnhVxbVVqaVoz29FZsGs8ALuYtWxZewKWwCWSSRJWwbwvaCEiNTG2twkhv9ZPyGmPPL52k3BpEwnjsdhhxj?cluster=devnet
```

[Transaction | 63iVQHnhVxbVVqaVoz29FZsGs8ALuYtWxZewKWwCWSSRJWwbwvaCEiNTG2twkhv9ZPyGmPPL52k3BpEwnjsdhhxj](https://explorer.solana.com/tx/63iVQHnhVxbVVqaVoz29FZsGs8ALuYtWxZewKWwCWSSRJWwbwvaCEiNTG2twkhv9ZPyGmPPL52k3BpEwnjsdhhxj?cluster=devnet)

**Instruction Data:**

```json
{
  "info": {
    "accountState": "frozen",
    "mint":         "EGKNDVKxUDBmVzgYabeeCQq77FXckyUTZpiuSdG6JBdj"
  },
  "type": "initializeDefaultAccountState"
}
```

[Transaction 63iVQHnhVxbVVqaVoz29FZsGs8ALuYtWxZewKWwCWSSRJWwbwvaCEiNTG2twkhv9ZPyGmPPL52k3BpEwnjsdhhxj | Solscan](https://solscan.io/tx/63iVQHnhVxbVVqaVoz29FZsGs8ALuYtWxZewKWwCWSSRJWwbwvaCEiNTG2twkhv9ZPyGmPPL52k3BpEwnjsdhhxj?cluster=devnet)



## Default Account State with Token Extensions on Solana

Okay, imagine you have a special bank account that starts off "_locked_" and you need permission to use it. The **Default Account State** for Solana's token extensions is kind of like that.

When you create a token account, it starts in a specific state
- which could be "_active_" (ready to use)
- or "_frozen_" (locked, so you can’t send or receive tokens).

The **Default Account State** lets you decide if new token accounts should start off as "frozen" right from the beginning.

This is useful if you want to control when people can use the account, like **making sure they follow certain rules before they can start using their tokens**.

So, **in short**: it’s a way to set whether a new token account is locked or ready to use from the start!


## Code explaination

### 1. **Calculate Mint Length and Rent Exemption**

```typescript
const mintLen  = getMintLen([ExtensionType.DefaultAccountState]); // !
const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);
```
- **`getMintLen`**: This function determines the amount of space required to store the mint information. The space increases because of the **Default Account State** extension, which needs to be included.
  - **`ExtensionType.DefaultAccountState`**: This extension lets you specify the default state of any new token accounts created from this mint (e.g., whether they start as "frozen" or "active").

- **`connection.getMinimumBalanceForRentExemption(mintLen)`**: Calculates the number of **lamports** required to make the mint account "rent-exempt." In Solana, every account needs a minimum balance to avoid being deleted by the network, and this function ensures that the account meets that threshold.


### 2. **Create Mint Account**

**`SystemProgram.createAccount`**: This system program instruction creates a new account for the mint.

```typescript
const ixCreateAccount = SystemProgram.createAccount({
	fromPubkey      : kpPayer.publicKey,        // Payer of the transaction fees
	newAccountPubkey: kpMint.publicKey,         // Public key for the new mint account
	space           : mintLen,                  // Space required for the mint (calculated above)
	lamports        : lamports,                 // Lamports needed for rent exemption
	programId       : TOKEN_2022_PROGRAM_ID,    // Token 2022 program to enable extensions
});
```
  - **`fromPubkey`**: The payer account (who is paying for the transaction).
  - **`newAccountPubkey`**: The public key of the new mint account.
  - **`space`**: The space allocated to store the mint data (including the extension).
  - **`lamports`**: The minimum balance required for the mint account to avoid rent collection.
  - **`TOKEN_2022_PROGRAM_ID`**: Specifies that the mint uses the Token 2022 program, which supports extensions like **Default Account State**.


### 3. **Initialize Default Account State**

**`AccountState.Frozen`**: Specifies that any new accounts created from this mint will start in the "frozen" state. The three options are:
  - **Frozen**: The account is locked and cannot send/receive tokens until it's unfrozen.
  - **Initialized**: The account is active and ready to be used.
  - **Uninitialized**: The account hasn’t been fully set up yet.

```typescript
const accountState = AccountState.Frozen;
```

**`createInitializeDefaultAccountStateInstruction`**: Creates an instruction to set the **default account state** for this mint. In this case, all new token accounts will start as "frozen" unless they are explicitly unfrozen by the authority.

```typescript
const ixInitializeDefaultAccountState = createInitializeDefaultAccountStateInstruction(
	kpMint.publicKey,      // The mint for which the default account state will be set
	accountState           // The state new token accounts should start with (Frozen in this case)
);
```


### 4. **Initialize Mint**

**`decimals = 9`**: This sets the precision of the token. For instance, with `9` decimals, the smallest unit of the token would be 0.000000001.

**`createInitializeMintInstruction`**: Creates an instruction to initialize the mint.
  - **Mint Authority**: This is the account that has the ability to mint new tokens.
  - **Freeze Authority**: This account can freeze or unfreeze token accounts created from this mint.

```typescript
const decimals = 9;

const ixInitializeMint = createInitializeMintInstruction(
	kpMint.publicKey,           // The mint's public key
	decimals,                   // Number of decimal places for the token (e.g., 9 for a fungible token)
	kpMintAuthority.publicKey,  // Public key of the mint authority (who can mint tokens)
	kpMintAuthority.publicKey,  // Public key of the freeze authority (who can freeze/unfreeze accounts)
	TOKEN_2022_PROGRAM_ID       // Program ID for Token 2022 (required for extensions)
);
```

The **Token 2022 program** is specified here, allowing this mint to leverage the **Default Account State** extension and other new features.


### 5. **Construct and Submit Transaction**

**Transaction**: The transaction contains all three instructions:
  1. **Create the mint account**.
  2. **Initialize the default account state** to "Frozen" (ensuring that new accounts start off locked).
  3. **Initialize the mint**, specifying the mint authority, decimals, and freeze authority.

```typescript
const tx = new Transaction().add(
	ixCreateAccount,                 // Step 1: Create the mint account
	ixInitializeDefaultAccountState, // Step 2: Set the default state to 'Frozen' for new accounts
	ixInitializeMint                 // Step 3: Initialize the mint with the given parameters
);
```

**`sendAndConfirmTransaction`**: Sends the transaction to the Solana blockchain and waits for confirmation. The signers include:
  - **`kpPayer`**: The account paying for the transaction.
  - **`kpMint`**: The mint account being created.

```typescript
const sigTx = await sendAndConfirmTransaction(
	connection,          // Solana connection object
	tx,                  // The transaction to send
	[kpPayer, kpMint]    // Signers (payer for fees and mint authority)
);
```


### Summary

- This code creates a new token mint using **Token 2022** with the **Default Account State** extension.
- The mint is configured so that any new token accounts will start in a "frozen" state, meaning they won’t be able to send or receive tokens until they are unfrozen by the freeze authority.
- After setting the default account state, the mint is initialized with 9 decimals, and both minting and freezing authorities are assigned.


## Source

[Default Account State with Token Extensions on Solana - YouTube](https://www.youtube.com/watch?v=1aDe3sUrZPk)

