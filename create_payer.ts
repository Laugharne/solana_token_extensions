// @ts-check

import { cluster, connection } from "./config";
import { createWalletFile, getAirdrop, title } from "./utils";

const main = async () => {
	try {
		title("Create Payer wallet");
		const kpPayer = await createWalletFile("payer", cluster);
		await getAirdrop( "Payer", connection, kpPayer, 2, cluster);
		//displayWalletLink("Payer", kpPayer, cluster);
	} catch (e) {
		console.error(e);
	}
}

main();