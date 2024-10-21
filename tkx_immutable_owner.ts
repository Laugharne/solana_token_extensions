// @ts-check

import {
	Keypair,
	SystemProgram,
	Transaction,
	sendAndConfirmTransaction,
} from "@solana/web3.js";

import {
	ExtensionType,
	TOKEN_2022_PROGRAM_ID,
	createInitializeAccountInstruction,
	createInitializeImmutableOwnerInstruction,
	createMint,
	getAccountLen,
} from "@solana/spl-token";

import { cluster, connection } from "./config";

import {
	displayTransactionLink,
	displayWallet,
	readWalletFile,
	title,
	subTitle,
	info,
	infoPair,
} from './utils';

const main = async () => {
	try {

		title("Solana Token Extensions (Immutable Owner)");

		subTitle("Get keys...");
		const kpPayer = await readWalletFile("payer", cluster);
		if( kpPayer == null) {return;}
		displayWallet("Payer", kpPayer);

		const kpMintAuthority = Keypair.generate();
		displayWallet("Mint auth.", kpMintAuthority);

		constkpOwner = Keypair.generate();
		displayWallet("Owner",kpOwner);

		const kpAccount = Keypair.generate();
		displayWallet("Account", kpAccount);

		const decimals = 0;
		infoPair("Decimals: ", decimals);

		const mint = await createMint(
			connection,
			kpPayer,
			kpMintAuthority.publicKey,
			kpMintAuthority.publicKey,
			decimals,
			undefined,
			undefined,
			TOKEN_2022_PROGRAM_ID
		);

		console.log("");

		info("Fetch the minimum balance needed to exempt an account for rent");
		const accountLen = getAccountLen([ExtensionType.ImmutableOwner]);
		const lamports   = await connection.getMinimumBalanceForRentExemption(accountLen);

		subTitle("Create account");

		const ixCreateAccount = SystemProgram.createAccount({
			fromPubkey      : kpPayer.publicKey,
			newAccountPubkey: kpAccount.publicKey,
			space           : accountLen,
			lamports        : lamports,
			programId       : TOKEN_2022_PROGRAM_ID,
		});

		subTitle("Immutable Owner Init.");

		const ixInitializeImmutableOwner = createInitializeImmutableOwnerInstruction(
			kpAccount.publicKey,
			TOKEN_2022_PROGRAM_ID
		);

		const ixInitializeAccount = createInitializeAccountInstruction(
			kpAccount.publicKey,
			mint,
			kpOwner.publicKey,
			TOKEN_2022_PROGRAM_ID

		);

		subTitle("Proceed to transactions");

		const tx = new Transaction().add(
			ixCreateAccount,
			ixInitializeImmutableOwner,
			ixInitializeAccount
		);

		const sigTx = await sendAndConfirmTransaction(
			connection,
			tx,
			[kpPayer, kpAccount],
			undefined
		);

		displayTransactionLink("Signature", sigTx, cluster);

	} catch (e) {
		console.error(e);
	}
}

main();