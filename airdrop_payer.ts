// @ts-check

import { cluster, connection } from "./config";
import { getAirdrop, readWalletFile, title } from "./utils";

const main = async () => {
	try {
		title("Airdrop Payer wallet");
		const kpPayer = await readWalletFile("payer", cluster);
		if( kpPayer == null) {return;}
		await getAirdrop( "Payer", connection, kpPayer, 2, cluster);
		//displayWalletLink("Payer", kpPayer, cluster);
	} catch (e) {
		console.error(e);
	}
}

main();