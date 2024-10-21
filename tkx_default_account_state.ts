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
		const kpPayer = await readWalletFile("payer", cluster);
		if( kpPayer == null) {return;}
		displayWallet("Payer", kpPayer);

		const kpMint = Keypair.generate();
		displayWallet("Mint	", kpMint);

		const kpMintAuthority = Keypair.generate();
		displayWallet("Mint auth.", kpMintAuthority);

		console.log("");

		info("Fetch the minimum balance needed to exempt an account of rent");
		const mintLen  = getMintLen([ExtensionType.DefaultAccountState]); // !
		const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);

		subTitle("Create account");

		const ixCreateAccount = SystemProgram.createAccount({
			fromPubkey      : kpPayer.publicKey,
			newAccountPubkey: kpMint.publicKey,
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
			kpMint.publicKey,
			accountState
		);

		subTitle("Initialize mint");

		const decimals = 9;
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
			ixInitializeDefaultAccountState,
			ixInitializeMint
		);

		const sigTx = await sendAndConfirmTransaction(
			connection,
			tx,
			[kpPayer, kpMint]
		);

		displayTransactionLink("Signature", sigTx, cluster);


	} catch (e) {
		console.error(e);
	}
}

main();