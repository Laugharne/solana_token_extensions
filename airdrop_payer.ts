// @ts-check

import { cluster, connection } from "./config";
import { getAirdrop, readWalletFile, title } from "./utils";

const main = async () => {
	try {
		title("Airdrop Payer wallet");
		const pkPayer = await readWalletFile("payer", cluster);
		if( pkPayer == null) {return;}
		await getAirdrop( "Payer", connection, pkPayer, 2, cluster);
		//displayWalletLink("Payer", pkPayer, cluster);
	} catch (e) {
		console.error(e);
	}
}

main();