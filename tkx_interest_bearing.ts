// @ts-check

import {
	Keypair,
} from "@solana/web3.js";

import {
	TOKEN_2022_PROGRAM_ID,
	amountToUiAmount,
	createInterestBearingMint,
} from "@solana/spl-token";

import { cluster, connection } from "./config";

import {
	displayWallet,
	readWalletFile,
	title,
	info,
} from './utils';

const main = async () => {
	try {

		title("Solana Token Extensions (Interest Bearing)");

		info("Get keys...")
		const kpPayer = await readWalletFile("payer", cluster);
		if( kpPayer == null) {return;}
		displayWallet("Payer", kpPayer);

		const kpMintAuthority = Keypair.generate();
		displayWallet("Mint auth.", kpMintAuthority);

		const kpRateAuthority = Keypair.generate();
		displayWallet("Rate auth.", kpRateAuthority);

		const kpMint = Keypair.generate();
		displayWallet("Mint	", kpMint);

		console.log("");

		const rate = 32000;
		info("Rate: "+rate+"%");

		const decimals = 0;
		info("Decimals: "+decimals);

		const mint = await createInterestBearingMint(
			connection,
			kpPayer,
			kpMintAuthority.publicKey,
			kpMintAuthority.publicKey,
			kpRateAuthority.publicKey,
			rate,
			decimals,
			kpMint,
			undefined,
			TOKEN_2022_PROGRAM_ID
		);

		info("Mint: "+mint.toBase58());

		const accountBalance = 1000;
		info("Balance: "+accountBalance);

		console.log("");

		setInterval(async () => {
			const uiAmount = await amountToUiAmount(
				connection,
				kpPayer,
				mint,
				accountBalance,
				TOKEN_2022_PROGRAM_ID
			);
			console.log("- "+ uiAmount);
		}, 1000);

		// // update interest rate
		// const updateRate = 50;
		// const tx = await updateRateInterestBearingMint(
		// 	connection,
		// 	kpPayer,
		// 	mint,
		// 	kpRateAuthority,
		// 	updateRate,
		// 	[],
		// 	undefined,
		// 	TOKEN_2022_PROGRAM_ID
		// );

	} catch (e) {
		console.error(e);
	}
}

main();