// @ts-check

import { cluster, connection } from "./config";
import { createWalletFile, getAirdrop, title } from "./utils";

const main = async () => {
	try {
		title("Create Owner wallet");
		const kpOwner = await createWalletFile("owner", cluster);
		await getAirdrop( "Owner", connection, kpOwner, 2, cluster);
	} catch (e) {
		console.error(e);
	}
}

main();