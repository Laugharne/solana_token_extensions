
# [00:00](https://youtu.be/LsduWRtT3r8?t=0)  Transfer Hooks Overview

----

> 📺 [How to use the Transfer Hooks Token Extension Part 2](https://youtu.be/LsduWRtT3r8)


## Introduction to Transfer Hooks
- [00:00](https://youtu.be/LsduWRtT3r8?t=0)  The speaker introduces the topic of transfer hooks, noting that the previous guide is slightly outdated and there are many questions regarding their functionality.
- [00:25](https://youtu.be/LsduWRtT3r8?t=25)  The session will cover resources available for transfer hooks, build a "Hello World" transfer hook, create a counter transfer hook, implement dynamic PDAs (Program Derived Addresses), and develop a whitelist.

## Resources Available
- [00:46](https://youtu.be/LsduWRtT3r8?t=46)  A comprehensive transfer hook guide is available with numerous examples and explanations. Each example links to a playground for immediate testing.
- [01:09](https://youtu.be/LsduWRtT3r8?t=69)  Examples include "Hello World," a counter, and a transfer fee. These can be found in the speaker's repository or under the Solana Developers Program examples.
# [01:30](https://youtu.be/LsduWRtT3r8?t=90)  Understanding Transfer Hook Basics

## Mechanism of Transfer Hooks
- [01:54](https://youtu.be/LsduWRtT3r8?t=114)  When transferring tokens between accounts, the token program calls the user's program via a CPI (Cross-Program Invocation), executing the defined transfer hook instruction. `use spl_transfer_hook_interface::instruction::{ExecuteInstruction, TransferHookInstruction};`
- [02:16](https://youtu.be/LsduWRtT3r8?t=136)  To implement this, one must adhere to the SPL (Solana Program Library) transfer hook interface by creating necessary instructions and PDAs that store additional account information required for transfers.

## Implementation Details
- [02:38](https://youtu.be/LsduWRtT3r8?t=158)  The process involves unpacking the transfer hook instruction data and matching it with program instructions. This allows execution on every token transfer.
- [03:00](https://youtu.be/LsduWRtT3r8?t=180)  A fallback function is needed since the token program operates as a native program; it ensures proper handling of incoming instructions.
    ```rust
    pub fn transfer_hook(ctx: Context<TransferHook>, amount: u64) -> Result<()> {

        msg!("Hello Transfer Hook!");

        Ok(())
    }

    pub fn fallback<'info>(
        program_id: &Pubkey,
        accounts:   &'info [AccountInfo<'info>],
        data:       &[u8],
    ) -> Result<()> {

        let instruction: TransferHookInstruction = TransferHookInstruction::unpack(data)?;

        // match instruction discriminator to transfer hook interface execute instruction
        // token2022 program CPIs this instruction on token transfer
        match instruction {
            TransferHookInstruction::Execute { amount } => {
                let amount_bytes = amount.to_le_bytes();

                // invoke custom transfer hook instruction on our program
                __private::__global::transfer_hook(program_id, accounts, &amount_bytes)
            }
            _ => return Err(ProgramError::InvalidInstructionData.into()),
        }
    }
    ```

# [03:23](https://youtu.be/LsduWRtT3r8?t=203)  Creating Transfer Hooks

## Setting Up Accounts
- [03:23](https://youtu.be/LsduWRtT3r8?t=203)  To perform transfers effectively, all required accounts must be predefined due to Solana's structure where each instruction needs all relevant accounts included.
- [03:56](https://youtu.be/LsduWRtT3r8?t=236)  An outer account metadata vector is created to calculate size and costs associated with these extra accounts before establishing PDAs that hold this metadata.
    ```rust
    let account_metas: Vec<spl_tlv_account_resolution::account::ExtraAccountMeta> = vec![

    ];

    let account_size: u64 = ExtraAccountMetaList::size_of(account_metas.len())? as u64;

    let lamports: u64 = Rent::get()?.minimum_balance(account_size as usize);

    let mint: Pubkey = ctx.accounts.mint.key();

    // PDA seeds
    let signer_seeds: &[&[&[u8]]] = &[&[
        b"extra-account-metas",
        &mint.as_ref(),
        &[ctx.bumps.extra_account_meta_list],
    ]];
    ```

## Running Tests
- [04:20](https://youtu.be/LsduWRtT3r8?t=260)  The command `anchor test --detach` allows local validators to run continuously while monitoring transactions in real-time through an explorer interface.

    ```
    Transfer Signature: 5P5PHAkmNMNnCZkoxK8fvEdJyJErv9jUpzRAiPsk8neFmYbwe6d8eqpvCYsmkDumKftp89ZUuCrcGnLoCnmrvfTz
        ✔ Transfer Hook with Extra Account Meta (398ms)
    ```
    **Program Instruction Logs**

    ```
    > Program logged: "Instruction: TransferChecked"
    > Program invoked: Unknown Program (DrWbQtYJGtsoRwzKqAbHKHKsCJJfpysudF39GBVFSxub)
      > Program logged: "Instruction: TransferHook"
      > Program logged: "Hello Transfer Hook!"
      > Program consumed: 8524 of 185337 compute units
      > Program returned success
    > Program consumed: 27498 of 200000 compute units
    > Program returned success
    ```
    See: **Program logged: "Hello Transfer Hook!"** with `TransferHook` instructions!

# [04:45](https://youtu.be/LsduWRtT3r8?t=285)  Client Code Walkthrough

## Initializing Client Components
- [05:06](https://youtu.be/LsduWRtT3r8?t=306)  The client code begins by creating an anchor provider and retrieving the program from its **IDL** (Interface Definition Language).

    ```typescript
    import { TransferHook } from "../target/types/transfer_hook";

    ...

    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program    = anchor.workspace.TransferHook as Program<TransferHook>;
    ```

- [05:27](https://youtu.be/LsduWRtT3r8?t=327)  It establishes connections using default wallets typical in Solana setups while defining mint key pairs and source/recipient token accounts.
    - `const connection = provider.connection;`
    - `const mint = new Keypair();`
    - `const sourceTokenAccount = getAssociatedTokenAddressSync(...)`
    - `const destinationTokenAccount = getAssociatedTokenAddressSync(...)`
    - Extra accounts
    ```typescript
    const [extraAccountMetaListPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("extra-account-metas"), mint.publicKey.toBuffer()],
      program.programId
    );
    ```
    - Mint Account with Transfer Hook Extension
    ```typescript
    const extensions = [ExtensionType.TransferHook];
    const mintLen    = getMintLen(extensions);
    const lamports   =
      await provider.connection.getMinimumBalanceForRentExemption(mintLen);
    ```


## Account Management

# [06:37](https://youtu.be/LsduWRtT3r8?t=397)  Creating Token Accounts and Transfers

## Setting Up Token Accounts
- [06:37](https://youtu.be/LsduWRtT3r8?t=397)  The process begins with creating the associated token account for both the wallet and destination, followed by mint creation.
    ```typescript
    const transaction = new Transaction().add(
      SystemProgram.createAccount({
        ...
      }),
      createInitializeTransferHookInstruction(
        ...
      ),
      createInitializeMintInstruction(
        ...
      )
    );

    const txSig = await sendAndConfirmTransaction(
      provider.connection,
      transaction,
      [wallet.payer, mint]
    );
    ```

- [06:59](https://youtu.be/LsduWRtT3r8?t=419)  A Program Derived Address (PDA) is established from the program to manage **extra account metadata** during this setup.
    ```typescript
    const initializeExtraAccountMetaListInstruction = await program.methods
      .initializeExtraAccountMetaList()
      .accounts({
        mint                : mint.publicKey,
        extraAccountMetaList: extraAccountMetaListPDA,
      })
      .instruction();

    const transaction = new Transaction().add(
      initializeExtraAccountMetaListInstruction
    );

    const txSig = await sendAndConfirmTransaction(
      provider.connection,
      transaction,
      [wallet.payer],
      { skipPreflight: true, commitment: "confirmed" }
    );
    ```

## Transferring Tokens

- [07:23](https://youtu.be/LsduWRtT3r8?t=443)  The transfer operation involves a helper function that retrieves necessary information about token accounts and prepares them for transfer.
    ```typescript
    const amount       = 1 * 10 ** decimals;
    const bigIntAmount = BigInt(amount);

    const transferInstruction = await createTransferCheckedWithTransferHookInstruction(
      connection,
      sourceTokenAccount,
      mint.publicKey,
      destinationTokenAccount,
      wallet.publicKey,
      bigIntAmount,
      decimals,
      [],
      "confirmed",
      TOKEN_2022_PROGRAM_ID
    );

    const transaction = new Transaction().add(
      transferInstruction
    );

    const txSig = await sendAndConfirmTransaction(
      connection,
      transaction,
      [wallet.payer],
      { skipPreflight: true }
    );
    ```
- [07:45](https://youtu.be/LsduWRtT3r8?t=465)  Each account's metadata is added to the instruction, allowing multiple calls to the transfer hook within the program.
    ```typescript
    const amount       = 1 * 10 ** decimals;
    const bigIntAmount = BigInt(amount);

    // Standard token transfer instruction
    const transferInstruction = await createTransferCheckedWithTransferHookInstruction(
      connection,
      sourceTokenAccount,
      mint.publicKey,
      destinationTokenAccount,
      wallet.publicKey,
      bigIntAmount,
      decimals,
      [],
      "confirmed",
      TOKEN_2022_PROGRAM_ID
    );

    const transaction = new Transaction().add(
      transferInstruction
    );

    const txSig = await sendAndConfirmTransaction(
      connection,
      transaction,
      [wallet.payer],
      { skipPreflight: true }
    );
    ```

## Error Handling in Transfers

- [08:07](https://youtu.be/LsduWRtT3r8?t=487)  It’s crucial to note that token accounts or mint cannot be altered post-initialization; they are immutable once set.
- [08:30](https://youtu.be/LsduWRtT3r8?t=510)  An example of **error handling** is introduced where a **panic** occurs if an amount exceeding 50 tokens is attempted for transfer.
    ```rust
    pub fn transfer_hook(ctx: Context<TransferHook>, amount: u64) -> Result<()> {

        if amount > 50 {
            panic!("The amount is too big {0}", amount);
        }

        Ok(())
    }
    ```

    **Program Instruction Logs**

    ```
    > Program logged: "Instruction: TransferChecked"
    > Program invoked: Unknown Program (DrWbQtYJGtsoRwzKqAbHKHKsCJJfpysudF39GBVFSxub)
      > Program logged: "Instruction: TransferHook"
      > Program logged: "panicked  at 'The amount is too big 1000000000', programs/transfer-hookk/src/lib.rs:69:13"
      > Program consumed: 12257 of 182346 compute units
      > Program returned error: "SBF program panicked"
    > Program consumed: 29911 of 200000 compute units
    > Program returned error: "Program failed to complete"
    ```

# [09:40](https://youtu.be/LsduWRtT3r8?t=580)  Implementing Advanced Features

## Creating a Counter with PDAs
- [09:40](https://youtu.be/LsduWRtT3r8?t=580)  The discussion shifts towards implementing a counter that increments each time tokens are transferred, requiring additional account management.
- [10:01](https://youtu.be/LsduWRtT3r8?t=601)  A new account structure named `counter` is defined, which will hold count data as part of its functionality.

    ```rust
    #[account]
    pub struct CounterAccount {
      pub count: u64,
    }
    ```

## Compiling and Testing Code
- [10:35](https://youtu.be/LsduWRtT3r8?t=635)  Initial compilation reveals errors due to missing flags in the counter account structure; adjustments are made accordingly.
- [11:11](https://youtu.be/LsduWRtT3r8?t=671)  Further testing indicates issues with passing accounts correctly into the extra accounts list, necessitating updates in code logic.

## Debugging Errors
- [11:52](https://youtu.be/LsduWRtT3r8?t=712)  As errors arise during testing, it becomes evident that certain required properties were not specified correctly in the program's logic.

# [13:59](https://youtu.be/LsduWRtT3r8?t=839)  Creating and Managing Dynamic PDAs in Token Accounts


```typescript
const [counterPDA] = PublicKey.findProgramAddressSync(
  [Buffer.from("counter")],
  program.programId
);

...

const initializeExtraAccountMetaListInstruction = await program.methods
  .initializeExtraAccountMetaList()
  .accounts({
    mint                : mint.publicKey,
    extraAccountMetaList: extraAccountMetaListPDA,
    counterAccount      : counterPDA
  })
  .instruction();
```


## Setting Up the Account
- [13:59](https://youtu.be/LsduWRtT3r8?t=839)  The speaker discusses creating an account with assistance from a co-pilot tool, highlighting various types of accounts such as "AO Auto extra account Mets" and "new with seat."
    ```rust
    let account_metas: Vec<spl_tlv_account_resolution::account::ExtraAccountMeta> = vec![
        ExtraAccountMeta::new_with_seeds(
            &[Seed::Literal {
                bytes: "counter".as_bytes().to_vec(),
            }],
            false,  // is_signer
            true,   // is_payer
          )?,
        ];
    ```
- [14:23](https://youtu.be/LsduWRtT3r8?t=863)  An error arises due to incorrect imports; the necessary components include the state, extra account meta list, and seed from the account.
    ```rust
    use spl_tlv_account_resolution::{
        state::ExtraAccountMetaList,
        account::ExtraAccountMeta,
        seeds::Seed
    };
    ```
- [14:56](https://youtu.be/LsduWRtT3r8?t=896)  The structure of extra account metadata is explained, emphasizing its discriminator, address, and writable status for counter modification.

## Implementing Counter Functionality
- [15:20](https://youtu.be/LsduWRtT3r8?t=920)  The speaker aims to implement a counter that tracks token transfers. Initial attempts show success in running code without errors.
- [15:44](https://youtu.be/LsduWRtT3r8?t=944)  A counter increment operation is introduced; it successfully updates the transfer count from zero to one.
    ```rust
    ctx.accounts.counter_account.count += 1;
    msg!(
        "This token has been transferred {0} times",
        ctx.accounts.counter_account.count
    );
    ```
- [16:08](https://youtu.be/LsduWRtT3r8?t=968)  The concept of collecting statistics on token transfers is discussed, indicating potential applications for tracking usage.

## Modifying PDA for Token Ownership
- [16:44](https://youtu.be/LsduWRtT3r8?t=1004)  To create a unique counter per token account, modifications are made to include the owner's public key in the PDA (Program Derived Address).
- [17:19](https://youtu.be/LsduWRtT3r8?t=1039)  Adjustments are made in client-side code to ensure proper referencing of payer information instead of mint data.

## Error Handling and Data Extraction
- [17:51](https://youtu.be/LsduWRtT3r8?t=1071)  An error occurs due to incorrect account metadata passing; adjustments are needed for additional accounts based on token data.
- [18:15](https://youtu.be/LsduWRtT3r8?t=1095)  The method for extracting owner information from token accounts is detailed, focusing on byte positions within the data structure.

## Finalizing Dynamic PDAs
- [19:13](https://youtu.be/LsduWRtT3r8?t=1153)  The process of deriving dynamic PDAs using specific fields from token accounts is elaborated upon.
- [20:14](https://youtu.be/LsduWRtT3r8?t=1214)  Emphasis is placed on ensuring that PDAs exist prior to operations like transferring tokens. This requires preemptive creation through user actions on a website interface.

## Implementing Access Control via Whitelisting
# [21:19](https://youtu.be/LsduWRtT3r8?t=1279)  Whitelist and Blacklist Mechanisms in Token Transfers

## Implementing a Whitelist for Token Transfers
- [21:19](https://youtu.be/LsduWRtT3r8?t=1279)  The whitelist will now be structured as a vector of public keys, allowing checks against the destination public key during transfers.
- [21:55](https://youtu.be/LsduWRtT3r8?t=1315)  A check is performed to ensure that the destination token account is included in the whitelist; otherwise, the transfer fails.
- [22:19](https://youtu.be/LsduWRtT3r8?t=1339)  An `add to whitelist` function can be implemented to manage accounts, ensuring only authorized users can add new entries.
- [22:52](https://youtu.be/LsduWRtT3r8?t=1372)  Error handling is crucial; unauthorized attempts to modify the whitelist should trigger an error or panic response.
- [23:17](https://youtu.be/LsduWRtT3r8?t=1397)  The concept of whitelisting and blacklisting can be applied flexibly across multiple accounts.

## Transfer Costs and Delegate Authority
- [23:38](https://youtu.be/LsduWRtT3r8?t=1418)  To implement transfer costs, delegates are created as authorities over specific token accounts, enabling fee management.
- [24:04](https://youtu.be/LsduWRtT3r8?t=1444)  The extra account metadata includes essential information such as mint details and delegate authority for managing token transfers.
- [24:26](https://youtu.be/LsduWRtT3r8?t=1466)  The process involves deriving associated token accounts from owners and mints using program-derived addresses (PDAs).

## Executing Transfers with Delegate Authority
- [24:50](https://youtu.be/LsduWRtT3r8?t=1490)  In client interactions, it’s necessary to identify all relevant token accounts before executing a transfer operation.
- [25:22](https://youtu.be/LsduWRtT3r8?t=1522)  Approval instructions are created to authorize delegates as owners of specific mint tokens before proceeding with transfers.
- [25:56](https://youtu.be/LsduWRtT3r8?t=1556)  Despite certain limitations on writable accounts during transfers, utilizing a delegate allows for successful transaction execution.

## Future Considerations and Enhancements
- [26:19](https://youtu.be/LsduWRtT3r8?t=1579)  While current methods may not be user-friendly, they provide foundational capabilities for implementing transfer costs effectively.

-----

- [00:00:00](https://www.youtube.com/watch?v=n-ym1utpzhk?t=0) ➜ [Music] hello everybody today we're going to talk again about transfer Hooks and this is because the first guide is already
- [00:00:08](https://www.youtube.com/watch?v=n-ym1utpzhk?t=8) ➜ slightly out of date and I still got a bunch of questions from uh many people about um details what you can do with transfer Hooks and whatnot um so first
- [00:00:18](https://www.youtube.com/watch?v=n-ym1utpzhk?t=18) ➜ I'm going to show you today all the resources that we currently have then we're going to build a hello world transfer hook then a counter transfer
- [00:00:25](https://www.youtube.com/watch?v=n-ym1utpzhk?t=25) ➜ hook then I'm going to show you how you can have dynamic pdas in a transfer hook and and then we're going to build a little white list and then I going to
- [00:00:33](https://www.youtube.com/watch?v=n-ym1utpzhk?t=33) ➜ show you two other more advanced examples um so that everyone hopefully after this guide knows um how to do anything with transfer hooks so first of
- [00:00:42](https://www.youtube.com/watch?v=n-ym1utpzhk?t=42) ➜ all the resources we currently have so we have this transfer hook guide here and it has lots of um examples and explanations about everything and all
- [00:00:52](https://www.youtube.com/watch?v=n-ym1utpzhk?t=52) ➜ the examples also have a link to a playground um example so you're can just click on this link and then you will have an example in playground which you
- [00:01:01](https://www.youtube.com/watch?v=n-ym1utpzhk?t=61) ➜ can immediately uh run and test and um work on or use as examples or something so here we have in hello world then we have a counter and then we have a
- [00:01:11](https://www.youtube.com/watch?v=n-ym1utpzhk?t=71) ➜ transfer fee so then uh all the examples are going to show you today you can currently find in my repository but I hope until this guide is released they
- [00:01:20](https://www.youtube.com/watch?v=n-ym1utpzhk?t=80) ➜ will be ending up in the salana developers program examples under token 2022 then there's another nice example by Joe um it's uh transfer hook order
- [00:01:30](https://www.youtube.com/watch?v=n-ym1utpzhk?t=90) ➜ tracker which uses soulbound tokens to identify the source and the destinations so this is a nice one to look at if you need a more ex Advanced example as well
- [00:01:43](https://www.youtube.com/watch?v=n-ym1utpzhk?t=103) ➜ and yeah and here we have the Explorer where we're going to look at our instructions so the first thing is I'm going to quickly go again through um
- [00:01:50](https://www.youtube.com/watch?v=n-ym1utpzhk?t=110) ➜ through the basics in case you're looking watching this the first time so if you create a transfer hook it means that every time you transfer a token
- [00:01:57](https://www.youtube.com/watch?v=n-ym1utpzhk?t=117) ➜ from one token account to another that the token program the new token program token extensions program will do a CPI into your program and call this uh
- [00:02:07](https://www.youtube.com/watch?v=n-ym1utpzhk?t=127) ➜ transfer hook instruction here so and to facilitate this you need to implement the SPL transfer hook interface and the execute instruction and the transfer
- [00:02:16](https://www.youtube.com/watch?v=n-ym1utpzhk?t=136) ➜ hooking instruction and you need to create a PDA which saves all the PD um all the extra accounts that your transfer hook needs
- [00:02:26](https://www.youtube.com/watch?v=n-ym1utpzhk?t=146) ➜ so how this looks like is um whenever the the token is transferred it will call this function here and since we are doing all of this in Anchor today we
- [00:02:36](https://www.youtube.com/watch?v=n-ym1utpzhk?t=156) ➜ need this fallback function here so what we do here since the token program is a native program so what we do here is we unpack the transfer hook instruction and
- [00:02:44](https://www.youtube.com/watch?v=n-ym1utpzhk?t=164) ➜ then we match it to our instructions in our program so if it's the transfer hook execute instruction then what we call what we do is we take the bytes out of
- [00:02:53](https://www.youtube.com/watch?v=n-ym1utpzhk?t=173) ➜ this out of this data and we call our transfer hook instruction which is this one and then um this one will be called on
- [00:03:02](https://www.youtube.com/watch?v=n-ym1utpzhk?t=182) ➜ every transfer and here you can see already we do a Hello transfer hook so I'm going to run this in a bit but first I want to show you um these
- [00:03:11](https://www.youtube.com/watch?v=n-ym1utpzhk?t=191) ➜ extra accounts that you need so to perform a transfer hog as you know in salana you always need to put in all the accounts um that you want to have in one
- [00:03:19](https://www.youtube.com/watch?v=n-ym1utpzhk?t=199) ➜ instruction and since the token transfer doesn't necessarily know all the accounts that you need in your transfer you need to Define them beforehand and
- [00:03:30](https://www.youtube.com/watch?v=n-ym1utpzhk?t=210) ➜ for that you create this outter out account Mets Vector here and then you here we calculate the size and the cost it will cost and then we create this PDA
- [00:03:41](https://www.youtube.com/watch?v=n-ym1utpzhk?t=221) ➜ which has a seat of account extra matters then the mint of the token and also the bump and then we create this PDA and
- [00:03:53](https://www.youtube.com/watch?v=n-ym1utpzhk?t=233) ➜ then we write all our signers all our extra accounts in this um meta and then in the client we can have a helper function which just um looks at the mint
- [00:04:04](https://www.youtube.com/watch?v=n-ym1utpzhk?t=244) ➜ gets all the accounts out and whenever we do the check transfer we can put all these accounts in so it's basically the whole Magic behind the transfer Hooks
- [00:04:14](https://www.youtube.com/watch?v=n-ym1utpzhk?t=254) ➜ and yeah then it will call this function here so and to run this what we're going to do is we call Anchor test minus minus detach and the minus minus detach does
- [00:04:23](https://www.youtube.com/watch?v=n-ym1utpzhk?t=263) ➜ is that the local validator will continue running so I can easily look at the transactions that are happening at the signal
- [00:04:30](https://www.youtube.com/watch?v=n-ym1utpzhk?t=270) ➜ VES so here we can see we have these um three transactions the first one is um just creating the mint and so on and the last
- [00:04:39](https://www.youtube.com/watch?v=n-ym1utpzhk?t=279) ➜ one is the actual transfer and if I put this here into my local Explorer so explorer.com and I switched it here on the top right to Local Host and if I
- [00:04:50](https://www.youtube.com/watch?v=n-ym1utpzhk?t=290) ➜ paste this in if we scroll down here we can see hey hello transfer hook so this will be done every time we transfer a token now and to understand what what's
- [00:04:59](https://www.youtube.com/watch?v=n-ym1utpzhk?t=299) ➜ happening in the client let's quickly quickly go through the client code here so the first thing we do is we create our anchor provider then we um get the
- [00:05:09](https://www.youtube.com/watch?v=n-ym1utpzhk?t=309) ➜ program from our IDL so it's just program transfer hook and it gets it actually from these types here Target type transfer hook this is where our
- [00:05:19](https://www.youtube.com/watch?v=n-ym1utpzhk?t=319) ➜ program gets all its types from then we just take the normal default wallet in my case it's just pointing to the default wallet that you usually have
- [00:05:27](https://www.youtube.com/watch?v=n-ym1utpzhk?t=327) ➜ when you install Zana then we get our connection and here we create the mint key pair we Define the decimals our tokens should have and then we create
- [00:05:36](https://www.youtube.com/watch?v=n-ym1utpzhk?t=336) ➜ our source token account so as you know on salana whenever you want to have a token in your wallet you need to have a token account and then we create our
- [00:05:45](https://www.youtube.com/watch?v=n-ym1utpzhk?t=345) ➜ recipient just a random key pair and a recipient token account which we call Destination token account then here we in the client also get this account the
- [00:05:56](https://www.youtube.com/watch?v=n-ym1utpzhk?t=356) ➜ for the account extra Mets that we need in the transfer hook and then here we get the length of our U mint so whenever you add a new um
- [00:06:06](https://www.youtube.com/watch?v=n-ym1utpzhk?t=366) ➜ extension to your mint you will also need to allocate some extra space for it and you get it like this you have an Ang an array of these different types of
- [00:06:16](https://www.youtube.com/watch?v=n-ym1utpzhk?t=376) ➜ extensions then you get the length of them then you calculate the Lamport that they will cost then you create an account which is exactly of that size
- [00:06:25](https://www.youtube.com/watch?v=n-ym1utpzhk?t=385) ➜ that you need then you initialize the transfer hook instruction and then you initialize the mint and it's important that you always initialize the uh all
- [00:06:33](https://www.youtube.com/watch?v=n-ym1utpzhk?t=393) ➜ the extensions first and then the mint otherwise it will not work and then we send this off then we create the token account and the mint so
- [00:06:43](https://www.youtube.com/watch?v=n-ym1utpzhk?t=403) ➜ here we create the associated token account for our wallet and for the destination then we create the mint and then we set this off so it's the second
- [00:06:52](https://www.youtube.com/watch?v=n-ym1utpzhk?t=412) ➜ one and the third one is now creating the extra account Mets so it's initialize extra account Mets and you noce already that we are calling this on
- [00:07:00](https://www.youtube.com/watch?v=n-ym1utpzhk?t=420) ➜ our program so this will be a PDA that is derived from our program then we put the mint and we put this PDA of the extra account matters and now becomes
- [00:07:11](https://www.youtube.com/watch?v=n-ym1utpzhk?t=431) ➜ the interesting part here we are transferring actually the first time the token and the magic of getting the extra accounts actually happens here so this
- [00:07:19](https://www.youtube.com/watch?v=n-ym1utpzhk?t=439) ➜ is a helper function which gets all these extra accounts create transfer check with transfer hook instruction and if we go in here we can see that first
- [00:07:26](https://www.youtube.com/watch?v=n-ym1utpzhk?t=446) ➜ we create a normal transfer checked instruction and then we get these extra accounts here and for the extra accounts what it
- [00:07:33](https://www.youtube.com/watch?v=n-ym1utpzhk?t=453) ➜ actually does internally it gets the mint info so the token account info um it gets the transfer hook out of it and then it gets all the extra accounts out
- [00:07:42](https://www.youtube.com/watch?v=n-ym1utpzhk?t=462) ➜ of there and then it just um adds them to the instruction so we can here see for every account mattera we addit to the instruction and then we push the
- [00:07:51](https://www.youtube.com/watch?v=n-ym1utpzhk?t=471) ➜ account matters and yeah this is the magic of it so basically everyone can now call this transfer hook with our Pro program and yeah then we sent this off
- [00:08:03](https://www.youtube.com/watch?v=n-ym1utpzhk?t=483) ➜ so and this is our first um transfer already what you need to keep in mind is that you will not be able to change the token accounts or the mint because they
- [00:08:12](https://www.youtube.com/watch?v=n-ym1utpzhk?t=492) ➜ are both demoted in siner and in writable so you can't for example very easily burn a token here or um just change the token amount um I will maybe
- [00:08:22](https://www.youtube.com/watch?v=n-ym1utpzhk?t=502) ➜ in the end show you like um some ideas on how you can achieve something like this so you could for example maybe use A Clockwork thread um that does
- [00:08:30](https://www.youtube.com/watch?v=n-ym1utpzhk?t=510) ➜ something in another thread and uses the permanent delegate extension or something but for now I want to show you a very quickly um a very quick thing how
- [00:08:40](https://www.youtube.com/watch?v=n-ym1utpzhk?t=520) ➜ what you can do with this so let's say um we want to fail whenever the amount of this is bigger so what I just going to do is I just going to panic in this
- [00:08:50](https://www.youtube.com/watch?v=n-ym1utpzhk?t=530) ➜ case would of course be nicer um if you create a proper error but now if I run this again and I say like hey um if I'm transferring an amount that is bigger
- [00:09:01](https://www.youtube.com/watch?v=n-ym1utpzhk?t=541) ➜ than 50 then it should panic and I think we are um supporting like we are sending 100 so if I now look at this instruction here at this transaction we can see it
- [00:09:13](https://www.youtube.com/watch?v=n-ym1utpzhk?t=553) ➜ was an error and it says the amount is too big because it was 100 * 9 decimals so like a bunch more than than we um set here so this is the first um first use
- [00:09:27](https://www.youtube.com/watch?v=n-ym1utpzhk?t=567) ➜ case that you can have you can do something with the amount you can do something with the um um token accounts or with the owners or so on but let's
- [00:09:37](https://www.youtube.com/watch?v=n-ym1utpzhk?t=577) ➜ now do a little bit more of um Advanced example so and maybe we run into a few arrows which would be nice so I can show you some of the errors so let's say we
- [00:09:46](https://www.youtube.com/watch?v=n-ym1utpzhk?t=586) ➜ want to have an counter right so we want to have a PDA and which has a number in it and every time we transfer the token we want to increase
- [00:09:54](https://www.youtube.com/watch?v=n-ym1utpzhk?t=594) ➜ it so for that the first thing we would need to do is here in our transfer hook we would need to add a new account right so let's say we want an account and we
- [00:10:04](https://www.youtube.com/watch?v=n-ym1utpzhk?t=604) ➜ want to inedit and we call it counter and it should be pup counter account info counter account so and this will be uh a pup
- [00:10:17](https://www.youtube.com/watch?v=n-ym1utpzhk?t=617) ➜ struct um which will be counter account and it has a count so let's quickly see if we did this correctly here actually so this is when we do the transfer
- [00:10:27](https://www.youtube.com/watch?v=n-ym1utpzhk?t=627) ➜ hook and we also o need to initialize this account when we initialize our account matters so here we will actually have our um in it if needed the seats
- [00:10:38](https://www.youtube.com/watch?v=n-ym1utpzhk?t=638) ➜ will be just counter then we have a bump and the payer will be the payer which will be the signer in this case and the space is nine but since I think we have
- [00:10:48](https://www.youtube.com/watch?v=n-ym1utpzhk?t=648) ➜ a u64 here so this will be actually the size needs to be 16 and down here we actually don't need
- [00:11:00](https://www.youtube.com/watch?v=n-ym1utpzhk?t=660) ➜ to in it we just need it as mutable and it should be counter and bump and space we don't need so let's see if this compiles so there was some error here
- [00:11:16](https://www.youtube.com/watch?v=n-ym1utpzhk?t=676) ➜ already um the counter account trade clone is not implemented this is here so this can't be an account
- [00:11:33](https://www.youtube.com/watch?v=n-ym1utpzhk?t=693) ➜ so I think I'm missing the account flag here so let's do anchor build okay this is building now the thing is now if we if we would run this we would have some
- [00:11:44](https://www.youtube.com/watch?v=n-ym1utpzhk?t=704) ➜ errors of course because we are not passing in these accounts yet so we can see we get the first error here when
- [00:11:52](https://www.youtube.com/watch?v=n-ym1utpzhk?t=712) ➜ we create the extra accounts list we missing the counter account so now we go into our test here and first we need to find this PDA so
- [00:12:03](https://www.youtube.com/watch?v=n-ym1utpzhk?t=723) ➜ what I going to do now is I create this I find this PDA so for that I just copy the other PDA we have here already and I remove the mint I call this counter
- [00:12:15](https://www.youtube.com/watch?v=n-ym1utpzhk?t=735) ➜ PDA and for seat we just put counter and now here when we create the extra account Mets which is somewhere here we're going to add the this counter
- [00:12:30](https://www.youtube.com/watch?v=n-ym1utpzhk?t=750) ➜ PDA as well so and this is now we get another error here uh unknown property so let's first like build this again see if
- [00:12:41](https://www.youtube.com/watch?v=n-ym1utpzhk?t=761) ➜ there's an error command not uh anchor build so here this looks fine but there's something wrong here object may not specify known property of counter
- [00:12:52](https://www.youtube.com/watch?v=n-ym1utpzhk?t=772) ➜ does not exist so maybe we called it counter account yeah we called it counter account so should be this actually
- [00:13:05](https://www.youtube.com/watch?v=n-ym1utpzhk?t=785) ➜ counter account so now if we run if you build this and if we now anchor test minus minus detach again now hopefully the first part should be correct but the
- [00:13:20](https://www.youtube.com/watch?v=n-ym1utpzhk?t=800) ➜ last part should still fail yes so I want to show you now the next error and this is now because now we are passing in in the account when we create
- [00:13:30](https://www.youtube.com/watch?v=n-ym1utpzhk?t=810) ➜ the extra account matters but um we actually not creating the account mattera in our account metas array in the program and this looks then like
- [00:13:41](https://www.youtube.com/watch?v=n-ym1utpzhk?t=821) ➜ this caused by account counter error account not enough keys so here we can see now that we are missing in our program on the top
- [00:13:51](https://www.youtube.com/watch?v=n-ym1utpzhk?t=831) ➜ here where we create these account Mets here we not putting in anything so what we do need to do now here is we need to create this account and thankfully the
- [00:14:02](https://www.youtube.com/watch?v=n-ym1utpzhk?t=842) ➜ co-pilot helped me a bit here so we can see that we have these AO Auto extra account Mets and we have new with seat and there are a bunch of these there's
- [00:14:10](https://www.youtube.com/watch?v=n-ym1utpzhk?t=850) ➜ new from pup key which is just a normal pup key and new with seat which will be creating a PDA um from our program taking um this counter string here and
- [00:14:23](https://www.youtube.com/watch?v=n-ym1utpzhk?t=863) ➜ we need it not to be Aigner but we need it to be writable so this is correct so let's run this again and we have an error
- [00:14:34](https://www.youtube.com/watch?v=n-ym1utpzhk?t=874) ➜ because send literal seat unlar type so this is uh apparently the co-pilot didn't know it too well the co-pilot is actually not very good at importing the
- [00:14:46](https://www.youtube.com/watch?v=n-ym1utpzhk?t=886) ➜ correct things so what we actually need is we need from the state we need the extra account metal list from the seats we need the seed and from the account we
- [00:14:56](https://www.youtube.com/watch?v=n-ym1utpzhk?t=896) ➜ need the extra meta account and now um these errors go away so now we can see we can now have like extra account Mets new re seed and you can see that um
- [00:15:06](https://www.youtube.com/watch?v=n-ym1utpzhk?t=906) ➜ extra Comas always has the discriminator it has the address and then if it's signer writable or um writable or and writable and signer so we don't need it
- [00:15:18](https://www.youtube.com/watch?v=n-ym1utpzhk?t=918) ➜ to be a signer but we need to have it writable because we need to change the number of the counter and then here in the seats you have a few more you have
- [00:15:27](https://www.youtube.com/watch?v=n-ym1utpzhk?t=927) ➜ um literal you have initial ized you have the account instruction data and we have account data and account key so we're going to uh do some Dynamic pdas
- [00:15:37](https://www.youtube.com/watch?v=n-ym1utpzhk?t=937) ➜ with this later as well but let's first stay to stick to this one so now if we um run this hopefully this should work since there no errors
- [00:15:45](https://www.youtube.com/watch?v=n-ym1utpzhk?t=945) ➜ anymore so we can see that they are going through and now here we should still see our hello world yeah we have hello transfer hook
- [00:15:55](https://www.youtube.com/watch?v=n-ym1utpzhk?t=955) ➜ but now what we want to do is we want to increase this counter actually so we ah this time the co-pilot did the right thing almost so this is I think count +
- [00:16:08](https://www.youtube.com/watch?v=n-ym1utpzhk?t=968) ➜ one and now we want to print this and yeah so the token has been transferred zero times in this case and it should be now printing has been
- [00:16:21](https://www.youtube.com/watch?v=n-ym1utpzhk?t=981) ➜ transferred one time so let's see if this works so we're going to copy this one we paste past it in here and we can see here this token
- [00:16:32](https://www.youtube.com/watch?v=n-ym1utpzhk?t=992) ➜ has been transferred one times so this is nice um so with this you can already do all kinds of Statistics collecting for your token or something but now
- [00:16:41](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1001) ➜ let's say we want to have a token which has a counter for every token account so for that what we need to do is we need to to change our PDA a little
- [00:16:53](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1013) ➜ bit so here we uh additionally put the um signer the owner in this case so we take the owner to key as ref I don't know if we
- [00:17:06](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1026) ➜ need as ref or we probably need the buffer of it but um and the same thing we do here so here we take our payer and now we have um a dynamic PDA so and in
- [00:17:19](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1039) ➜ the client what we would need to do for that is here we also need to add our we don't want the mint but we want our payer so this is a wallet dopu key.
- [00:17:34](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1054) ➜ buffer and now we would have um counter which is dependent on our public key um basically on the owner of the sender token account and let's see if this
- [00:17:47](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1067) ➜ works here already or if we did something wrong okay this seems to seems to run we just get an error now here in our
- [00:17:57](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1077) ➜ account meta again because we are actually not having we're not passing in the correct account again in the account metas here um and for that what we need
- [00:18:07](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1087) ➜ to do is first of all we have our literal here and then we want an additional account here and in this case we want a seed which is coming from the
- [00:18:19](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1099) ➜ account data so in the account data since you don't have the account directly the owner account but what you can do is you can take the account data
- [00:18:28](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1108) ➜ of the token account and take any bites out of there and since the owner of the token account is the second field in the token account you can just take exactly
- [00:18:39](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1119) ➜ the 32 bytes at the correct position so we take our account index zero which will be our owner token account and then at account index 32 we take a length of
- [00:18:52](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1132) ➜ the data of 32 and um if you wonder how I how I figured this out I went here to the token account and um if you go to definition
- [00:19:04](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1144) ➜ you can see that here in this token account we have um the rep type is C so that's like um like how it's packed in memory and then we have first comes the
- [00:19:16](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1156) ➜ mint which will be 32 bytes so it's position 32 then comes the owner so we take 32 bytes after 32 bytes offset and then we just use this one to create our
- [00:19:28](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1168) ➜ PDA you can also take the other fields in here I don't know if it makes sense but you could use the delegate or the state
- [00:19:35](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1175) ➜ or the amount probably doesn't make too much sense um and the close Authority for example so yeah you can do all kinds of things um but now this PDA should be
- [00:19:47](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1187) ➜ correct in the extra account matters and if we run this now hopefully we should have um a counter that is counting up for every um for every token account so
- [00:19:58](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1198) ➜ this is is now working thankfully so if I put this in here we can see that this token has been transferred one time what you need to
- [00:20:07](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1207) ➜ keep in mind is that um I'm here creating this PDA when I create the um account Mets right so the first time so you need this PDA needs actually to
- [00:20:19](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1219) ➜ exist you will not be able to create this PDA when you do the transfer hook because you won't have a signer to to create the account but you can for
- [00:20:28](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1228) ➜ example examp on your website have um something like where you want to identify your PE your owners or your users and then you have a button where
- [00:20:37](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1237) ➜ they can create an account and then they will be able to um transfer the token for example the main thing I wanted to show you is that you also can use the
- [00:20:45](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1245) ➜ account data and that you can find the owner of the token account in case you want to derive some Dynamic pdas but now let's say we want to have a
- [00:20:56](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1256) ➜ white list so that we only have a certain amount of people which are allowed to transfer this token and how we would do this is here in our account
- [00:21:05](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1265) ➜ we would probably call it differently but I I just don't want to refactor everything now but I would call this Authority and now I have a pup key here
- [00:21:16](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1276) ➜ and then we have another this would be our white list and our white list if I can type correctly will be now a vector of pup key
- [00:21:30](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1290) ➜ and now in our transfer hook what we can do is we can check if our if the uh cont if the context do accounts. counters Wireless contains the
- [00:21:45](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1305) ➜ destination destination pup key so if it does not contain so then we would we would fail so now we have our white list and we would check if our destination
- [00:21:58](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1318) ➜ token account is in there otherwise we will not be able to transfer there you could do the same thing with the with the token account that is the the owner
- [00:22:07](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1327) ➜ so the sender that the sender is not allowed to send so you can like Whit list and Blacklist um multiple um lists of accounts if you want and how you
- [00:22:19](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1339) ➜ would do this is here we would have an add to wh list function and then instead of TR transor we would put something else here we
- [00:22:30](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1350) ➜ don't need this this thing and then we would do here in our white list we would push our new account so this would be like look like this and then we would
- [00:22:43](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1363) ➜ get the account from our accounts list so we would need to pass this account in and to be sure that not everyone can just add new stuff to our white list we
- [00:22:55](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1375) ➜ would do this basically so we could just Panic here or throw an error and then um yeah we would check that only the person that created the
- [00:23:06](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1386) ➜ extra account matters so basically you when you create your token hook that only you would be able to add stuff to the white list and then here you would
- [00:23:13](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1393) ➜ be able to um in the transfer hook if something is Whit listed or blacklisted then you let it fail or succeed so this is another use case what
- [00:23:23](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1403) ➜ you could do and now I want to show you one more example and then we're done here um it would be like a transfer cost and if you want to see the whole example
- [00:23:32](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1412) ➜ you just look at the repository but this should give you a good idea already how it works so for the transfer cost what we do since the the token accounts and
- [00:23:42](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1422) ➜ the mints are not writable whenever you do a token transfer but you can work around this if you create um delegate so in this case what we would
- [00:23:51](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1431) ➜ do is we create um um a delegate which would be the authority of um w use S account so this would be rep s and this would be used to have a transfer fee so
- [00:24:04](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1444) ➜ and here in the extra account Mets we can already see that we put first the mint of wall then we need the token program then we get um delegate so this
- [00:24:14](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1454) ➜ what be PDA which will be the authority of our extra token accounts and then we have here new external PDA with seed so what this does it it creates um um PDA
- [00:24:26](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1466) ➜ from the token program using our the owner and the W mint index so this would be the associated token account for as the token account for the
- [00:24:38](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1478) ➜ repol and then we have our sender repol account and that's one we would derive from the owner the token program and the W Soul index again and then here we have
- [00:24:50](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1490) ➜ the counter from from the last example and how this looks like in the client is the this so basically the same as the other one just that we need to
- [00:25:02](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1502) ➜ also find the W Soul token account the delegate um token account and then here when we do the transfer let's go to the last function
- [00:25:15](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1515) ➜ here here we are creating the extra account metas and here you can see we need to put in all these accounts now
- [00:25:22](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1522) ➜ um and let me find so here we create the approve instruction so this is where we um approve our delegate to be the owner
- [00:25:34](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1534) ➜ of the W Sol Min then we create the um sync native instruction for our dou soul token account then we get the mint and here we get the extra account Mets again
- [00:25:45](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1545) ➜ and we need to put in the mint and the transfer hook in in this case and then yeah we print all the accounts and then here we do the same instruction as fors
- [00:25:56](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1556) ➜ before where it gets all the extra account metas from the accounts Mets PDA and with all these extra accounts What We Now can do in the program in our
- [00:26:05](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1565) ➜ transfer Hook is we can actually do a transfer because in this case all the accounts are writable so here I did a little um messaging them which shows you
- [00:26:16](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1576) ➜ that the mint account is not writable the destination and Source accounts are all not writable so you will get an Escalade privileges error or something
- [00:26:24](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1584) ➜ when you when you use these but since um we have here the signer is our delegate PDA we can use uh we can now do a check transfer from our sender account to our
- [00:26:37](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1597) ➜ delegate W Soul rep Soul token account and then we can just uh yeah send half of the amount there so you have um transfer cost now this is of course not
- [00:26:49](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1609) ➜ super convenient but um at least it's possible to do things like this and yeah please um check out all the different examples I hope when this comes out they
- [00:26:59](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1619) ➜ will be already in the program examples and yeah I'm super excited what you're going to build with these maybe for the next hackathon or something like this
- [00:27:07](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1627) ➜ and yeah if you have more questions um please keep them coming and maybe I'll do another video for example one where I maybe explain how you could use a
- [00:27:15](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1635) ➜ Clockwork thread to use the permanent delegate extension and then whenever there's a transfer you trigger a thread with the now trigger and then you can do
- [00:27:25](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1645) ➜ something in there with the permanent Delegate for example example burn tokens or so on or if someone of you wants to build this of course please open a PR
- [00:27:32](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1652) ➜ here or make a video about it that would of course be uh highly appreciated as well um otherwise um see you guys next time
- [00:27:41](https://www.youtube.com/watch?v=n-ym1utpzhk?t=1661) ➜ [Music] byebye

