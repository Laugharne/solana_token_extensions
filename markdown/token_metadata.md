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
    "mint":            "A18qB7ZArjefRB46J77v8P7ud9Mgsxfr68dJikTFXPDv"
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

TODO


## Sources

[Token Metadata with Token Extensions on Solana - YouTube](https://www.youtube.com/watch?v=l7EyQUlNAdw)