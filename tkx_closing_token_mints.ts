// @ts-check

import {
	Keypair, SystemProgram, Transaction, sendAndConfirmTransaction,
} from "@solana/web3.js";

import {
	ExtensionType,
	TOKEN_2022_PROGRAM_ID,
	closeAccount,
	createInitializeMintCloseAuthorityInstruction,
	createInitializeMintInstruction,
	getMintLen,
} from "@solana/spl-token";

import { cluster, connection } from "./config";

import {
	displayWallet,
	readWalletFile,
	title,
	info,
	infoPair,
	subTitle,
	displayTransactionLink,
} from './utils';

const main = async () => {
	try {

		title("Solana Token Extensions (Closing Token Mint)");

		info("Get keys...")
		const kpPayer = await readWalletFile("payer", cluster);
		if( kpPayer == null) {return;}
		displayWallet("Payer", kpPayer);

		const kpMint = Keypair.generate();
		displayWallet("Mint", kpMint);

		const kpMintAuthority = Keypair.generate();
		displayWallet("Mint auth.", kpMintAuthority);

		const kpCloseAuthority = Keypair.generate();
		displayWallet("Close auth.", kpCloseAuthority);

		console.log("");

		info("Fetch the minimum balance needed to exempt an account of rent");
		const mintLen  = getMintLen([ExtensionType.MintCloseAuthority]); // !
		const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);

		subTitle("Create account");

		const ixCreateAccount = SystemProgram.createAccount({
			fromPubkey      : kpPayer.publicKey,
			newAccountPubkey: kpMint.publicKey,
			space           : mintLen,
			lamports        : lamports,
			programId       : TOKEN_2022_PROGRAM_ID,
		});

		subTitle("Close Authority Init.");

		const ixInitializeMintCloseAuthority = createInitializeMintCloseAuthorityInstruction(
			kpMint.publicKey,
			kpCloseAuthority.publicKey,
			TOKEN_2022_PROGRAM_ID
		);

		subTitle("Initialize mint");

		const decimals = 0;
		infoPair("Decimals", decimals);

		const ixInitializeMint = createInitializeMintInstruction(
			kpMint.publicKey,
			decimals,
			kpMintAuthority.publicKey,
			kpMintAuthority.publicKey,
			TOKEN_2022_PROGRAM_ID
		);

		subTitle("Proceed to transactions");

		const tx = new Transaction().add(
			ixCreateAccount,
			ixInitializeMintCloseAuthority,
			ixInitializeMint
		);

		const sigTx = await sendAndConfirmTransaction(
			connection,
			tx,
			[kpPayer, kpMint],
			undefined	// ??
		);

		displayTransactionLink("Signature", sigTx, cluster);

		// Close the account
		const sigTxClose = await closeAccount(
			connection,
			kpPayer,
			kpMint.publicKey,
			kpPayer.publicKey,
			kpCloseAuthority,
			[],
			undefined,
			TOKEN_2022_PROGRAM_ID
		);

		displayTransactionLink("Signature (close)", sigTxClose, cluster);

	} catch (e) {
		console.error(e);
	}
}

main();