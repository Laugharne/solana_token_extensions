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
	amountToUiAmount,
	createInitializeAccountInstruction,
	createInitializeImmutableOwnerInstruction,
	createInitializeMintInstruction,
	createInitializeNonTransferableMintInstruction,
	createInitializePermanentDelegateInstruction,
	createInterestBearingMint,
	createMint,
	getAccountLen,
	getMintLen,
	updateRateInterestBearingMint,
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

		title("Solana Token Extensions (Imùmutable Owner)");

		subTitle("Get keys...");
		const pkPayer = await readWalletFile("payer", cluster);
		if( pkPayer == null) {return;}
		displayWallet("Payer", pkPayer);

		const pkMintAuthority = Keypair.generate();
		displayWallet("Mint auth.", pkMintAuthority);

		const pkOwner = Keypair.generate();
		displayWallet("Owner", pkOwner);

		const pkAccount = Keypair.generate();
		displayWallet("Account", pkAccount);

		const decimals = 0;
		infoPair("Decimals: ", decimals);

		const mint = await createMint(
			connection,
			pkPayer,
			pkMintAuthority.publicKey,
			pkMintAuthority.publicKey,
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
			fromPubkey      : pkPayer.publicKey,
			newAccountPubkey: pkAccount.publicKey,
			space           : accountLen,
			lamports        : lamports,
			programId       : TOKEN_2022_PROGRAM_ID,
		});

		subTitle("Immutable Owner Init.");

		const ixInitializeImmutableOwner = createInitializeImmutableOwnerInstruction(
			pkAccount.publicKey,
			TOKEN_2022_PROGRAM_ID
		);

		const ixInitializeAccount = createInitializeAccountInstruction(
			pkAccount.publicKey,
			mint,
			pkOwner.publicKey,
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
			[pkPayer, pkAccount],
			undefined
		);

		displayTransactionLink("Signature", sigTx, cluster);

	} catch (e) {
		console.error(e);
	}
}

main();