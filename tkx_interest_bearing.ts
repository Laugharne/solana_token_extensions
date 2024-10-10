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
		const pkPayer = await readWalletFile("payer", cluster);
		if( pkPayer == null) {return;}
		displayWallet("Payer", pkPayer);

		const pkMintAuthority = Keypair.generate();
		displayWallet("Mint auth.", pkMintAuthority);

		const pkRateAuthority = Keypair.generate();
		displayWallet("Rate auth.", pkRateAuthority);

		const pkMint = Keypair.generate();
		displayWallet("Mint	", pkMint);

		console.log("");

		const rate = 32000;
		info("Rate: "+rate+"%");

		const decimals = 0;
		info("Decimals: "+decimals);

		const mint = await createInterestBearingMint(
			connection,
			pkPayer,
			pkMintAuthority.publicKey,
			pkMintAuthority.publicKey,
			pkRateAuthority.publicKey,
			rate,
			decimals,
			pkMint,
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
				pkPayer,
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
		// 	pkPayer,
		// 	mint,
		// 	pkRateAuthority,
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