// @ts-check

import {
	Keypair, SystemProgram, Transaction, sendAndConfirmTransaction,
} from "@solana/web3.js";

import {
	AccountState,
	ExtensionType,
	TOKEN_2022_PROGRAM_ID,
	createInitializeDefaultAccountStateInstruction,
	createInitializeMintInstruction,
	getMintLen,
} from "@solana/spl-token";

import { cluster, connection } from "./config";

import {
	displayWallet,
	readWalletFile,
	title,
	info,
	subTitle,
	infoPair,
	displayTransactionLink,
} from './utils';

const main = async () => {
	try {

		title("Solana Token Extensions (Default Account State)");

		info("Get keys...")
		const pkPayer = await readWalletFile("payer", cluster);
		if( pkPayer == null) {return;}
		displayWallet("Payer", pkPayer);

		const pkMint = Keypair.generate();
		displayWallet("Mint	", pkMint);

		const pkMintAuthority = Keypair.generate();
		displayWallet("Mint auth.", pkMintAuthority);

		console.log("");

		info("Fetch the minimum balance needed to exempt an account of rent");
		const mintLen  = getMintLen([ExtensionType.DefaultAccountState]); // !
		const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);

		subTitle("Create account");

		const ixCreateAccount = SystemProgram.createAccount({
			fromPubkey      : pkPayer.publicKey,
			newAccountPubkey: pkMint.publicKey,
			space           : mintLen,
			lamports        : lamports,
			programId       : TOKEN_2022_PROGRAM_ID,
		});

		subTitle("Set default state (Frozen)");

		// - Frozen
		// - Initialized
		// - Uninitialized
		const accountState = AccountState.Frozen;

		const ixInitializeDefaultAccountState = createInitializeDefaultAccountStateInstruction(
			pkMint.publicKey,
			accountState
		);

		subTitle("Initialize mint");

		const decimals = 9;
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
			ixInitializeDefaultAccountState,
			ixInitializeMint
		);

		const sigTx = await sendAndConfirmTransaction(
			connection,
			tx,
			[pkPayer, pkMint]
		);

		displayTransactionLink("Signature", sigTx, cluster);


	} catch (e) {
		console.error(e);
	}
}

main();