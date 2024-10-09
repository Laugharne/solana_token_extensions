// @ts-check

import { Connection, clusterApiUrl } from "@solana/web3.js";

export const cluster = "devnet";

let clusterApi: string;

if( cluster == "localhost") {
	clusterApi = "http://localhost:8899";
} else {
	clusterApi = clusterApiUrl(cluster);
}

export const connection = new Connection( clusterApi, "confirmed");
