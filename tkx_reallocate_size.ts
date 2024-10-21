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
	createAccount,
	createEnableRequiredMemoTransfersInstruction,
	createInitializeAccountInstruction,
	createInitializeImmutableOwnerInstruction,
	createMint,
	createReallocateInstruction,
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

		title("Solana Token Extensions (Reallocate Token Account Sizes)");

		subTitle("Get keys...");
		const kpPayer = await readWalletFile("payer", cluster);
		if( kpPayer == null) {return;}
		displayWallet("Payer", kpPayer);

		const kpMintAuthority = Keypair.generate();
		displayWallet("Mint auth.", kpMintAuthority);

		const kpOwner = Keypair.generate();
		displayWallet("Owner",kpOwner);

		const decimals = 0;
		infoPair("Decimals", decimals);

		console.log("");

		subTitle("Initialize mint");

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

		subTitle("Create account");

		const account = await createAccount(
			connection,
			kpPayer,
			mint,
			kpOwner.publicKey,
			undefined,
			undefined,
			TOKEN_2022_PROGRAM_ID
		);


		subTitle("Reallocation");

		const extensions = [ExtensionType.MemoTransfer];

		const ixReallocate = createReallocateInstruction(
			account,
			kpPayer.publicKey,
			extensions,
			kpOwner.publicKey,
			undefined,
			TOKEN_2022_PROGRAM_ID
		);

		const ixEnableRequiredMemoTransfer = createEnableRequiredMemoTransfersInstruction(
			account,
			kpOwner.publicKey,
			[],
			TOKEN_2022_PROGRAM_ID
		);

		subTitle("Proceed to transactions");

		const tx = new Transaction().add(
			ixReallocate,
			ixEnableRequiredMemoTransfer,
		);

		const sigTx = await sendAndConfirmTransaction(
			connection,
			tx,
			[kpPayer,kpOwner]
		);

		displayTransactionLink("Signature", sigTx, cluster);

	} catch (e) {
		console.error(e);
	}
}

main();