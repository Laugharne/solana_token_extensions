// @ts-check

import {
	Keypair, SystemProgram, Transaction, sendAndConfirmTransaction,
} from "@solana/web3.js";

import {
	ExtensionType,
	LENGTH_SIZE,
	TOKEN_2022_PROGRAM_ID,
	TYPE_SIZE,
	closeAccount,
	createInitializeMetadataPointerInstruction,
	createInitializeMintCloseAuthorityInstruction,
	createInitializeMintInstruction,
	getMintLen,
	getTokenMetadata,
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

import { createInitializeInstruction, createUpdateFieldInstruction, pack, type TokenMetadata } from "@solana/spl-token-metadata";
import dotenv from 'dotenv';
dotenv.config();

const main = async () => {
	try {

		title("Solana Token Extensions (Token Metadata)");

		info("Get keys...")
		const kpPayer = await readWalletFile("payer", cluster);
		if( kpPayer == null) {return;}
		displayWallet("Payer", kpPayer);

		const kpMint = Keypair.generate();
		displayWallet("Mint", kpMint);

		const tokenName   = ""+process.env.TOKEN_NAME;
		const tokenSymbol = ""+process.env.TOKEN_SYMBOL;
		const tokenUri    = ""+process.env.TOKEN_URI;

		subTitle("Build Metadata");

		const metadata: TokenMetadata = {
			mint              : kpMint.publicKey,
			name              : tokenName,
			symbol            : tokenSymbol,
			uri               : tokenUri,
			additionalMetadata: [
				["key", "value"]
			]
		}

		//console.log("Metadata", metadata);

		console.log("");

		info("Fetch the minimum balance needed to exempt an account of rent");

		const mintSpace     = getMintLen([ExtensionType.MetadataPointer]);
		const metadataSpace = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;
		const lamports      = await connection.getMinimumBalanceForRentExemption(mintSpace + metadataSpace);

		subTitle("Create account");

		const ixCreateAccount = SystemProgram.createAccount({
			fromPubkey      : kpPayer.publicKey,
			newAccountPubkey: kpMint.publicKey,
			space           : mintSpace, // exact amoint of space for the mint ITSELF !
			lamports        : lamports,
			programId       : TOKEN_2022_PROGRAM_ID,
		});

		subTitle("Metadata Pointer Init.");

		const ixInitializeMetadataPointer = createInitializeMetadataPointerInstruction(
			kpMint.publicKey,
			kpPayer.publicKey,
			kpMint.publicKey,
			TOKEN_2022_PROGRAM_ID
		);

		subTitle("Initialize mint");

		const decimals = 2;
		infoPair("Decimals", decimals);

		const ixInitializeMint = createInitializeMintInstruction(
			kpMint.publicKey,
			decimals,
			kpPayer.publicKey,
			null,
			TOKEN_2022_PROGRAM_ID
		);

		subTitle("Metadata Init.");

		const ixInitializeMetadata = createInitializeInstruction({
			mint           : kpMint.publicKey,
			metadata       : kpMint.publicKey,
			mintAuthority  : kpPayer.publicKey,
			name           : metadata.name,
			symbol         : metadata.symbol,
			uri            : metadata.uri,
			programId      : TOKEN_2022_PROGRAM_ID,
			updateAuthority: kpPayer.publicKey
		});

		// https://youtu.be/l7EyQUlNAdw?list=PLilwLeBwGuK6imBuGLSLmzMEyj6yVHGDO&t=865
		const ixUpdateMetadataField = createUpdateFieldInstruction({
			metadata: kpMint.publicKey,
			programId: TOKEN_2022_PROGRAM_ID,
			updateAuthority: kpPayer.publicKey,
			field: metadata.additionalMetadata[0][0],
			value: metadata.additionalMetadata[0][1]
		});

		subTitle("Proceed to transactions");

		// It's very important to follow this exact order
		// https://youtu.be/l7EyQUlNAdw?list=PLilwLeBwGuK6imBuGLSLmzMEyj6yVHGDO&t=1060
		const tx = new Transaction().add(
			ixCreateAccount,
			ixInitializeMetadataPointer,
			ixInitializeMint,
			ixInitializeMetadata,
			ixUpdateMetadataField
		);

		const sigTx = await sendAndConfirmTransaction(
			connection,
			tx,
			[kpPayer, kpMint],
			undefined	// ??
		);

		displayTransactionLink("Signature", sigTx, cluster);

		const chainMetadata = await getTokenMetadata(
			connection,
			kpMint.publicKey
		);

		console.log("");
		console.log(chainMetadata);

	} catch (e) {
		console.error(e);
	}
}

main();