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
		const pkPayer = await readWalletFile("payer", cluster);
		if( pkPayer == null) {return;}
		displayWallet("Payer", pkPayer);

		const pkMint = Keypair.generate();
		displayWallet("Mint", pkMint);

		const pkMintAuthority = Keypair.generate();
		displayWallet("Mint auth.", pkMintAuthority);

		const pkCloseAuthority = Keypair.generate();
		displayWallet("Close auth.", pkCloseAuthority);

		console.log("");

		info("Fetch the minimum balance needed to exempt an account of rent");
		const mintLen  = getMintLen([ExtensionType.MintCloseAuthority]); // !
		const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);

		subTitle("Create account");

		const ixCreateAccount = SystemProgram.createAccount({
			fromPubkey      : pkPayer.publicKey,
			newAccountPubkey: pkMint.publicKey,
			space           : mintLen,
			lamports        : lamports,
			programId       : TOKEN_2022_PROGRAM_ID,
		});

		subTitle("Close Authority Init.");

		const ixInitializeMintCloseAuthority = createInitializeMintCloseAuthorityInstruction(
			pkMint.publicKey,
			pkCloseAuthority.publicKey,
			TOKEN_2022_PROGRAM_ID
		);

		subTitle("Initialize mint");

		const decimals = 0;
		infoPair("Decimals", decimals);

		const ixInitializeMint = createInitializeMintInstruction(
			pkMint.publicKey,
			decimals,
			pkMintAuthority.publicKey,
			pkMintAuthority.publicKey,
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
			[pkPayer, pkMint],
			undefined	// ??
		);

		displayTransactionLink("Signature", sigTx, cluster);

		// Close the account
		const sigTxClose = await closeAccount(
			connection,
			pkPayer,
			pkMint.publicKey,
			pkPayer.publicKey,
			pkCloseAuthority,
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