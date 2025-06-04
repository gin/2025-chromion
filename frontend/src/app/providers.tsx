"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { type ReactNode } from "react"
import config from "../rainbowKitConfig"
import { WagmiProvider } from "wagmi"
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit"
import { useState, useEffect } from "react"
import "@rainbow-me/rainbowkit/styles.css"

export function Providers(props: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient())
    const [isDarkMode, setIsDarkMode] = useState(false)

    useEffect(() => {
        // Check system preference
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
        setIsDarkMode(darkModeQuery.matches)

        // Listen for changes
        const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches)
        darkModeQuery.addEventListener('change', handler)
        return () => darkModeQuery.removeEventListener('change', handler)
    }, [])

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider theme={isDarkMode ? darkTheme() : lightTheme()}>
                    {props.children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}
