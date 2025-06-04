"use client"

import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { anvil, sepolia } from "wagmi/chains"
import { defineChain } from "viem"

// For custom port. (default is 8545 for Anvil)
const localAnvil = defineChain({
    ...anvil,
    id: 31337,
    name: "Anvil Local",
    rpcUrls: {
        default: { http: ["http://localhost:8546"] },
        public: { http: ["http://localhost:8546"] }
    }
})

export default getDefaultConfig({
    appName: "Chromion",
    projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!, // ! Non-null assertion operator, ensure this is set in your environment variables
    chains: [localAnvil, sepolia], // Add your desired chains here
    ssr: false, // Disable to build static site
})
