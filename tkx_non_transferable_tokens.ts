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
	createInitializeMintInstruction,
	createInitializeNonTransferableMintInstruction,
	createInitializePermanentDelegateInstruction,
	createInterestBearingMint,
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

		title("Solana Token Extensions (Non-Transferable Tokens)");

		subTitle("Get keys...");
		const kpPayer = await readWalletFile("payer", cluster);
		if( kpPayer == null) {return;}
		displayWallet("Payer", kpPayer);

		const kpMint = Keypair.generate();
		displayWallet("Mint", kpMint);

		console.log("");

		info("Fetch the minimum balance needed to exempt an account for rent");
		const mintLen  = getMintLen([ExtensionType.NonTransferable]); // !
		const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);

		subTitle("Create account");

		const ixCreateAccount = SystemProgram.createAccount({
			fromPubkey      : kpPayer.publicKey,
			newAccountPubkey: kpMint.publicKey,
			space           : mintLen,
			lamports        : lamports,
			programId       : TOKEN_2022_PROGRAM_ID,
		});

		subTitle("Non-Transferable Token Init.");

		const ixInitializeNonTransferableMint = createInitializeNonTransferableMintInstruction(
			kpMint.publicKey,
			TOKEN_2022_PROGRAM_ID
		);

		subTitle("Initialize mint");

		const decimals = 9;
		infoPair("Decimals", decimals);

		const ixInitializeMint = createInitializeMintInstruction(
			kpMint.publicKey,
			decimals,
			kpPayer.publicKey,
			null,
			TOKEN_2022_PROGRAM_ID
		);

		subTitle("Proceed to transactions");

		const tx = new Transaction().add(
			ixCreateAccount,
			ixInitializeNonTransferableMint,
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