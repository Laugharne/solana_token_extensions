// @ts-check

import {
	Keypair, SystemProgram, Transaction, sendAndConfirmTransaction,
} from "@solana/web3.js";

import {
	ExtensionType,
	TOKEN_2022_PROGRAM_ID,
	createAccount,
	createInitializeMintInstruction,
	createInitializeTransferFeeConfigInstruction,
	getMintLen,
	getTransferFeeAmount,
	harvestWithheldTokensToMint,
	mintTo,
	transferCheckedWithFee,
	unpackAccount,
	withdrawWithheldTokensFromAccounts,
	withdrawWithheldTokensFromMint,
} from "@solana/spl-token";

import { cluster, connection } from "./config";

import {
	displayWallet,
	readWalletFile,
	title,
	info,
	subTitle,
	displayTransactionLink,
	infoPair,
} from './utils';

const main = async () => {
	try {

		title("Solana Token Extensions (Token Transfer Fee)");

		info("Get keys...")
		const kpPayer = await readWalletFile("payer", cluster);
		if( kpPayer == null) {return;}
		displayWallet("Payer", kpPayer);

		const kpMint = Keypair.generate();
		displayWallet("Mint", kpMint);

		const kpMintAuthority = Keypair.generate();
		displayWallet("Mint auth.", kpMintAuthority);

		const kpTransferFeeConfigAuthority = Keypair.generate();
		displayWallet("Transfer fee conf. auth.", kpTransferFeeConfigAuthority);

		const kpWithdrawWithheldAuthority = Keypair.generate();
		displayWallet("Mint auth.", kpWithdrawWithheldAuthority);

		// const kpOwner = await readWalletFile("owner", cluster);
		// if( kpOwner == null) {return;}
		const kpOwner = Keypair.generate();
		displayWallet("Owner", kpOwner);

		const kpAccount= Keypair.generate();
		displayWallet("Account (dest)", kpAccount);

		info("Fetch the minimum balance needed to exempt an account of rent");
		const mintLen  = getMintLen([ExtensionType.TransferFeeConfig]); // !
		const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);

		subTitle("Create account");

		const ixCreateAccount = SystemProgram.createAccount({
			fromPubkey      : kpPayer.publicKey,
			newAccountPubkey: kpMint.publicKey,
			space           : mintLen,
			lamports        : lamports,
			programId       : TOKEN_2022_PROGRAM_ID,
		});

		subTitle("Transfer fee config Init.");

		const feeBasisPoint = 50; // -> 0.5%
		infoPair("Decimals", feeBasisPoint);

		// I'd never want to collect any
		// transaction fee above 5000 !
		// The fee will be clamp to 5000 !
		const maxFee = BigInt(5_000);
		infoPair("Max fee", maxFee);

		const ixInitializeTransferFeeConfig = createInitializeTransferFeeConfigInstruction(
			kpMint.publicKey,
			kpTransferFeeConfigAuthority.publicKey,
			kpWithdrawWithheldAuthority.publicKey,
			feeBasisPoint,
			maxFee,
			TOKEN_2022_PROGRAM_ID
		);

		subTitle("Initialize mint");

		const decimals = 9;
		infoPair("Decimals",decimals);

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
			ixInitializeTransferFeeConfig,
			ixInitializeMint
		);

		const sigTx = await sendAndConfirmTransaction(
			connection,
			tx,
			[kpPayer, kpMint],
			undefined	// ??
		);

		displayTransactionLink("Signature", sigTx, cluster);

		/*

		Timecode : https://youtu.be/isFB5Tk6kPo?list=PLilwLeBwGuK6imBuGLSLmzMEyj6yVHGDO&t=744

		We're going to do is we're going to look at how to transfer um tokens between two
		token accounts that have this transfer fee configuration set.

		So in order to do that we actually have to use um a new helper function that is
		titled transfer checks with fee and this transfer only succeeds if the fee is
		calculated correctly to avoid like any surprise deductions during the transfer.

		So we'll continue um our script to create new token uh two new token accounts that we
		can transfer between.

		So first we'll need to create the these new these two new token accounts mint some new tokens to
		one of those accounts and then transfer the tokens between them.

		*/

		// Transfering tokens
		subTitle("Transfering tokens...");

		subTitle("Create account (source)");

		const accountSource = await createAccount(
			connection,
			kpPayer,
			kpMint.publicKey,
			kpOwner.publicKey,
			undefined,
			undefined,
			TOKEN_2022_PROGRAM_ID
		);

		const mintAmount = BigInt(1_000_000_000);
		infoPair("Mint amount", mintAmount);

		await mintTo(
			connection,
			kpPayer,
			kpMint.publicKey,
			accountSource,
			kpMintAuthority,
			mintAmount,
			[],
			undefined,
			TOKEN_2022_PROGRAM_ID
		);

		subTitle("Create account (destination)");

		const accountDestination = await createAccount(
			connection,
			kpPayer,
			kpMint.publicKey,
			kpOwner.publicKey,
			kpAccount,
			undefined,
			TOKEN_2022_PROGRAM_ID
		);

		const transferAmount = BigInt(1_000_000);
		infoPair("Tx amount", transferAmount);

		// The reason why it's 10000 is because one basis point 1/100 th of a percent
		// wich is the equivalent of 0.01 % so to get the right amount of fee,
		// we need to times it by 10000
		// We expected the fee to actually be 5000 tokens from a million
		const fee = (transferAmount * BigInt(feeBasisPoint)) / BigInt(10_000);
		infoPair("Fee", fee);

		const sigTransfer = await transferCheckedWithFee(
			connection,
			kpPayer,
			accountSource,
			kpMint.publicKey,
			accountDestination,
			kpOwner,
			transferAmount,
			decimals,
			fee,
			[],
			undefined,
			TOKEN_2022_PROGRAM_ID
		);

		displayTransactionLink("Transfer signature", sigTransfer, cluster);

		/*

		We're now going to look at how actually find all the token accounts
		that have a withheld amount and actually hot to withdraw these
		withheld tokens to a new account

		*/

		// Find and withdraw withhled tokens from accounts
		subTitle("Find and withdraw withhled tokens from accounts...");

		subTitle("Get Program Accounts");

		const allAccounts = await connection.getProgramAccounts(
			TOKEN_2022_PROGRAM_ID, {
				commitment: 'confirmed',
				filters: [
					{
						memcmp: {
							offset: 0,
							bytes: kpMint.publicKey.toString(),
						}
					}

				]
			}
		);

		// we need to filter out all tha accounts who have a withheld amount

		const accountsToWithdrawFrom = allAccounts.filter((accountInfo)=> {
			const account  = unpackAccount(
				accountInfo.pubkey,
				accountInfo.account,
				TOKEN_2022_PROGRAM_ID
			);

			const transferFeeAmount = getTransferFeeAmount(account);

			if( transferFeeAmount !== null && transferFeeAmount.withheldAmount > BigInt(0)) {
				return accountInfo.pubkey;
			}
		}).map((accountInfo) => accountInfo.pubkey);


		/*
		Then we can now use the withdraw withheld tokens from accounts function
		that would allow us to withdraw all of the withheld fees in these given
		token account into a particuliar account.
		*/

		subTitle("Withdraw withheld tokens from accounts");

		const sigWithdrawWithheldTokensFromAccounts = await withdrawWithheldTokensFromAccounts(
			connection,
			kpPayer,
			kpMint.publicKey,
			accountDestination,
			kpWithdrawWithheldAuthority,
			[],
			accountsToWithdrawFrom,
			undefined,
			TOKEN_2022_PROGRAM_ID
		);

		displayTransactionLink("WithdrawWithheld... signature", sigWithdrawWithheldTokensFromAccounts, cluster);

		/*
		The final thing that you may need to do...
		Considering that token accounts that hold any tokens including withheld ones
		can't be closed.
		So therefore a user may want to close a token that has some withheld transfer fees
		So there's a new function called `harvestWithheldTokensToMint` that
		users can permisionless clear out their account of withheld tokens.
		*/

		// // Harvest withheld tokens to the mint
		// subTitle("Harvest withheld tokens to the mint...");

		// await harvestWithheldTokensToMint(
		// 	connection,
		// 	kpPayer,
		// 	kpMint.publicKey,
		// 	[accountDestination]
		// );

		// // withdraw withheld tokens from mint

		// await withdrawWithheldTokensFromMint(
		// 	connection,
		// 	kpPayer,
		// 	kpMint.publicKey,
		// 	accountSource,
		// 	kpWithdrawWithheldAuthority
		// );

	} catch (e) {
		console.error(e);
	}
}

main();