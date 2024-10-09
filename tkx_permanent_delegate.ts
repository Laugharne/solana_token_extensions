// @ts-check

import {
	Connection,
	Keypair,
	SystemProgram,
	Transaction,
	sendAndConfirmTransaction
} from "@solana/web3.js";

import {
	ExtensionType,
	TOKEN_2022_PROGRAM_ID,
	createInitializeMintInstruction,
	createInitializePermanentDelegateInstruction,
	getMintLen
} from "@solana/spl-token";

import { cluster, connection } from "./config";

import {
	displayTransactionLink,
	displayWallet,
	readWalletFile,
	subTitle,
	title,
} from './utils';

const main = async () => {
	try {

		title("Solana Token Extensions (Permanent Delegate)");
		const pkPayer = await readWalletFile("payer", cluster);
		if( pkPayer == null) {return;}
		displayWallet("Payer", pkPayer);

		const pkMintAuthority = Keypair.generate();
		displayWallet("Mint auth.", pkMintAuthority);

		const pkPermanentDelegate = Keypair.generate();
		displayWallet("Delegate", pkPermanentDelegate);
		console.log("");

		subTitle("Fetch the minimum balance needed to exempt an account of rent");
		const mintLen  = getMintLen([ExtensionType.PermanentDelegate]); // !
		const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);

		subTitle("Create account");

		const ixCreateAccount = SystemProgram.createAccount({
			fromPubkey      : pkPayer.publicKey,
			newAccountPubkey: pkMintAuthority.publicKey,
			space           : mintLen,
			lamports        : lamports,
			programId       : TOKEN_2022_PROGRAM_ID,
		});

		subTitle("Permanent delegate");

		const ixInitializePermanentDelegate = createInitializePermanentDelegateInstruction(
			pkMintAuthority.publicKey,
			pkPermanentDelegate.publicKey,
			TOKEN_2022_PROGRAM_ID
		);

		subTitle("Initialize mint");

		const decimals = 9;

		const ixInitializeMint = createInitializeMintInstruction(
			pkMintAuthority.publicKey,
			decimals,
			pkMintAuthority.publicKey,
			null,
			TOKEN_2022_PROGRAM_ID
		);

		subTitle("Procedd to transactions");

		const tx = new Transaction().add(
			ixCreateAccount,
			ixInitializePermanentDelegate,
			ixInitializeMint
		);

		const sigTx = await sendAndConfirmTransaction(
			connection,
			tx,
			[pkPayer, pkMintAuthority],
			undefined	// ??
		);

		displayTransactionLink("Signature", sigTx, cluster);

	} catch (e) {
		console.error(e);
	}
}

main();