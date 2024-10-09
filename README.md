# Solana Token Extensions


## Overview

**Token Extensions** are additional data structures associated with token accounts (_SPL Tokens_) to extend their functionalities.

These extensions allow for the storage and management of additional information for a given token without needing to modify the core SPL token protocol.


### What are Token Extensions?

**Token Extensions** are defined in the **SPL Token Program** (_Solana Program Library_) and allow developers to add metadata or new capabilities to a token account. These extensions are stored as additional data within the standard SPL token account.

The idea is to have a standard base for tokens (_similar to ERC-20 on Ethereum_) while offering flexibility for custom features that developers might want to add, such as transaction fees, transfer limits, vesting conditions, and more.

### Not just metadata !

Technically, **Solana's token extensions** are not just standard tokens with additional standardized metadata. They provide **additional functionality at the program level** via the SPL Token 2022 program, adding specific behaviors and management rules through **advanced instructions and configurations**.

Here’s why **token extensions** go beyond just standard metadata:

1. **Protocol-level programming**:
   Token extensions introduce **extra behaviors** that are directly managed by the **SPL Token 2022 program**. For instance, features like interest accrual, transfer fees, or roles such as the "_permanent delegate_" are mechanisms that are integrated within the program itself, not just static metadata.

2. **Active functionality**:
   Unlike metadata, which is used to store static information (such as token name, image, or basic attributes), extensions add **dynamic functionality**. For example, an **interest-bearing token** actively calculates and applies interest to token accounts, and a **transfer fee token** automatically imposes transaction fees.

3. **Specific logic within the program**:
   These extensions alter how the SPL program manages tokens. For example, the SPL Token 2022 program knows how to handle **non-transferable tokens** or **immutable owners**, which are not simply metadata but actual rules that enforce specific restrictions on transfers or account management.

4. **Enhanced interoperability**:
   Extensions are standardized configurations within the SPL Token 2022 program, making them interoperable between dApps and services on Solana. Rather than just storing metadata and having each project interpret them differently, these extensions provide **uniform functionality** directly managed by the SPL program.

Let’s take the **Interest-Bearing Token**:
- It’s not just metadata saying "_this token generates interest._" The SPL program actually **applies interest** on the balance of token accounts based on parameters defined when the token was created.
- Interest calculations and balance updates happen **automatically** by the program with each interaction involving the token, requiring active management.

Solana’s **token extensions** have **additional features** programmed into **SPL Token 2022**. They provide active mechanisms and dynamic behaviors like interest accrual, fees, or restrictions that are enforced by the on-chain program.

### Available Token Extensions

Here are some of the **Token Extensions** available in the SPL program on Solana:

1. **Permanent Delegate Extension** (`PermanentDelegate`):
   - Allows you to delegate specific actions to another account permanently.
   - Useful in scenarios where a trusted partner or automated system needs to manage tokens on your behalf, such as in decentralized autonomous organizations (_DAOs_) or multi-signature wallets.

2. **Interest-Bearing Extension** (`InterestBearingConfig`):
   - Allows defining interest rates for token accounts, which is useful for decentralized finance (_DeFi_) applications like lending or savings.
   - Tokens can earn interest over time according to a predefined configuration.

1. **Transfer Fee Extension** (`TransferFeeConfig`):
   - Allows defining fees for each token transfer. These fees can be collected by the designated "_fee collector_".
   - Commonly used for applications like stablecoins or other tokens that require management fees.

3. **Transferable or Non-Transferable Extension**:
   - Enables setting whether a token is transferable or non-transferable.
   - For example, some governance or reward tokens may be set as non-transferable.

4. **Immutable Owner Extension** (`ImmutableOwner`):
   - Makes the token owner's address immutable, preventing any future transfer of ownership.
   - Used in cases where it's important that the token account owner never changes.

5. **Mint Close Authority Extension** (`MintCloseAuthority`):
   - Allows defining a close authority for the mint account.
   - This authority can decide to close the mint account once all tokens have been issued or under specific conditions.

6. **CPI Guard Extension** (`CpiGuard`):
   - Used to control access to cross-program invocation (_CPI_) instructions and protect certain operations from unauthorized calls.

### How to Use Token Extensions?

To use these extensions, you need to interact with the **SPL Token Program** using the appropriate structures and instructions. Here are the general steps to add an extension to an SPL token:

1. **Create a Token Account with Extension**: When creating a new SPL token, you can specify one or more extensions for that token.

2. **Initialize the Extension**: Use the instructions from the **SPL Token Program** to initialize and configure the desired extension (_e.g., set up transfer fees or specific rules for the token_).

3. **Manage the Extension via Transactions**: Once initialized, the extension can be managed through transactions using the extension's specific instructions. For example, you can update transfer fees or change the management authority of an extension.


### Conclusion

**Token Extensions** on Solana provide additional flexibility for token management by allowing custom functionalities to be added without modifying the core SPL token standard. They are particularly useful for DeFi applications, NFT platforms, and other use cases requiring advanced token management.


## Examples

| Examples                                                        |
| --------------------------------------------------------------- |
| [Permanent Delegate](./markdown/permanent_delegate.md)          |
| [Interest Bearing](./markdown/interest_bearing.md)              |
| [Non-tranferable Tokens](./markdown/non_transferable_tokens.md) |
|                                                                 |


## Source

[Token Extensions on Solana Developer Guides - YouTube](https://www.youtube.com/playlist?list=PLilwLeBwGuK6imBuGLSLmzMEyj6yVHGDO)


----

![](markdown/2024-10-09-12-54-58.png)

----

