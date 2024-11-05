- [How to use the Transfer Hooks Token Extension Part 2 - YouTube](https://www.youtube.com/watch?v=LsduWRtT3r8) ✨
- [Token Extensions: Transfer Hook (Hello world) | Solana](https://solana.com/developers/guides/token-extensions/transfer-hook#hello-world-transfer-hook) ✨
- [Solana Playground | Solana IDE](https://beta.solpg.io/github.com/solana-developers/anchor-transfer-hook/tree/hello_world) ✨

```bash
cd token_transfer_hooks
anchor b
npm i chai
code .
```



--------




Imagine you're playing a game with your friends, and every time you give a toy to someone, there's a special rule that says you need to follow some extra steps—maybe check if they have enough room for the toy or if they can really accept it.

**Token Transfer Hooks** on Solana are like those extra rules. Normally, when you send a token (like a special coin) to someone else, it just moves from your pocket to theirs. But with **Token Transfer Hooks**, something special happens each time you transfer a token. The token program can check or do something extra before the token is transferred.

For example, the program could:
- Make sure the person you're sending the token to has enough space for it.
- Add a note to the transfer, like a "_memo_" explaining why you sent it.
- Check that both you and the other person are allowed to trade this token.

In short, **Token Transfer Hooks** let you add extra checks or actions every time a token is transferred, making sure everything follows special rules!

**Token Transfer Hooks** on Solana can be used for a variety of purposes, such as enforcing certain conditions or requirements for token transfers, triggering smart contracts or other actions, or enabling the creation of more complex and flexible token systems.


--------

Token creators may need more control over how their token is transferred. The most prominent use case revolves around NFT royalties. Whenever a token is moved, the creator should be entitled to royalties, but due to the design of the current token program, it's impossible to stop a transfer at the protocol level.

During transfer, Token-2022 calls into the program with the accounts specified at a well-defined program-derived address for that mint and program id. This call happens after all other transfer logic, so the accounts reflect the _end_ state of the transfer.

When interacting with a transfer-hook program, it's possible to send an instruction - such as `Execute` (transfer) - to the program with only the accounts required for the `Transfer` instruction, and any extra accounts that the program may require are automatically resolved on-chain! This process is explained in detail in many of the linked `README` files below under **Resources**.

[Video transcription](./transcription_hook_video.md)

--------

## Resources

**Videos:**
- [How to use the Transfer Hooks Token Extension Part 2 - YouTube](https://www.youtube.com/watch?v=LsduWRtT3r8) ✨
- [Code With the Transfer Hooks Token Extension on Solana 💻 - YouTube](https://www.youtube.com/shorts/44PTgUm7OiM)
- [Token Transfer Hooks with Token Extensions on Solana - YouTube](https://www.youtube.com/watch?v=Cc6CZWd-iMw)
- [Introducing Transfer Hooks: My favourite Token22 Extension [Solana Tutorial] - Nov 29th '23 - YouTube](https://www.youtube.com/watch?v=pcdy-7KIJhU)
- [5 WAYS TO GET HOOKED - A Transfer Hook Deep Dive [Solana Tutorial] - Jan 20th '24 - YouTube](https://www.youtube.com/watch?v=Sr-HiJdbf6w)

**Documentations:**
- [Token Extensions: Transfer Hook | Solana](https://solana.com/developers/guides/token-extensions/transfer-hook#custom-transfer-hook-instruction)
- [Token-2022 Program | Solana Program Library Docs](https://spl.solana.com/token-2022)
- [Extensions Guide | Solana Program Library Docs](https://spl.solana.com/token-2022/extensions#transfer-hook)

**Examples:**
- [Token Extensions: Transfer Hook (Hello world) | Solana](https://solana.com/developers/guides/token-extensions/transfer-hook#hello-world-transfer-hook) ✨
- [GitHub - Woody4618/token22_examples](https://github.com/Woody4618/token22_examples/tree/main) ✨
  - [token22_examples/TransferHookHelloWorld at main · Woody4618/token22_examples · GitHub](https://github.com/Woody4618/token22_examples/tree/main/TransferHookHelloWorld)
  - [token22_examples/TransferHookCounter at main · Woody4618/token22_examples · GitHub](https://github.com/Woody4618/token22_examples/tree/main/TransferHookCounter)
  - [token22_examples/TransferHookWhitelist at main · Woody4618/token22_examples · GitHub](https://github.com/Woody4618/token22_examples/tree/main/TransferHookWhitelist)
- [Solana Playground | Solana IDE](https://beta.solpg.io/github.com/solana-developers/anchor-transfer-hook/tree/hello_world)
- [program-examples/tokens/token-2022 at main · solana-developers/program-examples · GitHub](https://github.com/solana-developers/program-examples/tree/main/tokens/token-2022)
- [GitHub - buffalojoec/transfer-hook-order-tracker: Example using SPL Token 2022 Transfer Hook to track orders](https://github.com/buffalojoec/transfer-hook-order-tracker)
