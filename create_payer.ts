// @ts-check

import { cluster, connection } from "./config";
import { createWalletFile, getAirdrop, title } from "./utils";

const main = async () => {
	try {
		title("Create Payer wallet");
		const pkPayer = await createWalletFile("payer", cluster);
		await getAirdrop( "Payer", connection, pkPayer, 2, cluster);
		//displayWalletLink("Payer", pkPayer, cluster);
	} catch (e) {
		console.error(e);
	}
}

main();