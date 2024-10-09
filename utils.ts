// @ts-check

import {
	Connection,
	Keypair,
	LAMPORTS_PER_SOL
} from "@solana/web3.js";

//import * as fs from 'fs';
import * as fs from 'fs/promises';
import * as path from 'path';

const DEFAULT_PAD = 13;

export function displayWallet(name: string, keypair: Keypair | null, pad?: number) {
	if( keypair == null) return;
	const publicKey = keypair.publicKey.toString();

	if( pad) {
		//
	} else {
		pad = DEFAULT_PAD;
	}
	const padName = name.padEnd(pad);
	console.log("💰 "+padName+" : "+publicKey)

}

export function displayWalletLink(name: string, keypair: Keypair, cluster?: string, pad?: number) {
	const publicKey = keypair.publicKey.toString();

	if( pad) {
		//
	} else {
		pad = DEFAULT_PAD;
	}
	if( cluster) {
		//
	} else {
		cluster = "devnet";
	}
	const padName = name.padEnd(pad);
	console.log("💰 "+padName+" : https://explorer.solana.com/address/"+publicKey+"?cluster="+cluster)
	;

}

export function displayTransactionLink(name: string, signature: string, cluster?: string, pad?: number) {

	if( pad) {
		//
	} else {
		pad = DEFAULT_PAD;
	}

	if( cluster) {
		//
	} else {
		cluster = "devnet";
	}

	const padName = name.padEnd(pad);
	console.log("🚀 "+padName+" : https://explorer.solana.com/tx/"+signature+"?cluster="+cluster)
	;

}


export async function getAirdrop(name: string,  connection: Connection, keypair: Keypair, amount: number, cluster?: string, pad?: number) {
	if( amount <=0) {
		amount = 1;
	}

	if( pad) {
		//
	} else {
		pad = DEFAULT_PAD;
	}

	const padAmount = "Airdrop".padEnd(pad);
	console.log("🏧 "+padAmount+" : "+amount+" SOL to "+keypair.publicKey);

	const sigAirdrop = await connection.requestAirdrop(
		keypair.publicKey,
		amount*LAMPORTS_PER_SOL
	);
	await connection.confirmTransaction({
		signature: sigAirdrop,
		...(await connection.getLatestBlockhash())
	});

	if( cluster == "localhost") {
		cluster = "?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899"
	}
	const padName = name.padEnd(pad);
	console.log("✅ "+padName+" : https://explorer.solana.com/address/"+keypair.publicKey+"?cluster="+cluster)
}

export function title(text: string) {
	const txt = text;
	console.log("");
	console.log(txt);
	console.log("=".repeat(txt.length));
	console.log("");
}

export function subTitle(text: string) {
	const txt = text;
	console.log(txt);
	console.log("-".repeat(txt.length));
	console.log("");
}

export function info(text: string) {
	console.log("ℹ️ "+text);
}

export function warning(text: string) {
	console.log("⚠️ "+text);
}

export async function createWalletFile(name: string, cluster: string) {

	const walletFile       = name+"_"+cluster+".wallet.json";
	const wallet           = Keypair.generate();
	const privateKeyString = Buffer.from(wallet.secretKey).toString('base64');

	const walletData = {
		publicKey : wallet.publicKey.toBase58(),
		privateKey: privateKeyString
	};

	await fs.writeFile("./keypair/"+walletFile, JSON.stringify(walletData, null, 2), 'utf8');
	return wallet;
}



export async function readWalletFile(fileName: string, cluster: string) {
	const filePath = path.resolve(__dirname, "./keypair/"+fileName+"_"+cluster+".wallet.json");
	try {
		const data                = await fs.readFile(filePath, 'utf8');
		const walletData          = JSON.parse(data);
		const secretKeyUint8Array = Uint8Array.from(Buffer.from(walletData.privateKey, 'base64'));
		return Keypair.fromSecretKey(secretKeyUint8Array);
	} catch (error) {
		console.error(`Failed to read wallet file "${filePath}":`, error);
		return null;
	}
}


/*
export function txToLink(signature: string, cluster: string) {
	return "https://explorer.solana.com/tx/"+signature+"?cluster="+cluster;
}

export function addrToLink(signature: string, cluster: string) {
	return "https://explorer.solana.com/address/"+signature+"?cluster="+cluster;
}
*/
