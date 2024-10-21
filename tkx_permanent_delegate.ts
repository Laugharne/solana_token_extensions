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
	createInitializeMintInstruction,
	createInitializePermanentDelegateInstruction,
	getMintLen,
} from "@solana/spl-token";

import { cluster, connection } from "./config";

import {
	displayTransactionLink,
	displayWallet,
	readWalletFile,
	title,
	subTitle,
	info,
} from './utils';

const main = async () => {
	try {

		title("Solana Token Extensions (Permanent Delegate)");

		info("Get keys...")
		const kpPayer = await readWalletFile("payer", cluster);
		if( kpPayer == null) {return;}
		displayWallet("Payer", kpPayer);

		const kpMintAuthority = Keypair.generate();
		displayWallet("Mint auth.", kpMintAuthority);

		const kpPermanentDelegate = Keypair.generate();
		displayWallet("Delegate", kpPermanentDelegate);
		console.log("");

		info("Fetch the minimum balance needed to exempt an account of rent");
		const mintLen  = getMintLen([ExtensionType.PermanentDelegate]); // !
		const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);

		subTitle("Create account");

		const ixCreateAccount = SystemProgram.createAccount({
			fromPubkey      : kpPayer.publicKey,
			newAccountPubkey: kpMintAuthority.publicKey,
			space           : mintLen,
			lamports        : lamports,
			programId       : TOKEN_2022_PROGRAM_ID,
		});

		subTitle("Permanent delegate Init.");

		const ixInitializePermanentDelegate = createInitializePermanentDelegateInstruction(
			kpMintAuthority.publicKey,
			kpPermanentDelegate.publicKey,
			TOKEN_2022_PROGRAM_ID
		);

		subTitle("Initialize mint");

		const decimals = 9;
		info("Decimals: "+decimals);

		const ixInitializeMint = createInitializeMintInstruction(
			kpMintAuthority.publicKey,
			decimals,
			kpMintAuthority.publicKey,
			null,
			TOKEN_2022_PROGRAM_ID
		);

		subTitle("Proceed to transactions");

		const tx = new Transaction().add(
			ixCreateAccount,
			ixInitializePermanentDelegate,
			ixInitializeMint
		);

		const sigTx = await sendAndConfirmTransaction(
			connection,
			tx,
			[kpPayer, kpMintAuthority],
			undefined	// ??
		);

		displayTransactionLink("Signature", sigTx, cluster);

	} catch (e) {
		console.error(e);
	}
}

main();