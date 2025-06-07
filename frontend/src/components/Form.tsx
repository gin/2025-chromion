"use client"

import InputField from "./ui/InputField"    
import { useState, useEffect } from "react"
import { useChainId, useConfig, useAccount } from "wagmi"
import { readContract, writeContract, waitForTransactionReceipt } from "wagmi/actions"

import { abi as counterAbi } from "@/shared/abi/Counter.sol/Counter.json";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

export default function Form() {
    const [number, setNumber] = useState("");
    const [currentNumber, setCurrentNumber] = useState<number>(0);
    const chainId = useChainId();
    const config = useConfig();
    const account = useAccount();

    useEffect(() => {
        fetchCurrentNumber();
    }, []);

    async function fetchCurrentNumber() {
        try {
            const response = await readContract(config, {
                abi: counterAbi,
                address: CONTRACT_ADDRESS,
                functionName: "number",
            }) as bigint;
            setCurrentNumber(Number(response));
        } catch (error) {
            console.error("Error fetching number:", error);
        }
    }

    async function handleSetNumber() {
        if (!number) return;
        try {
            const hash = await writeContract(config, {
                abi: counterAbi,
                address: CONTRACT_ADDRESS,
                functionName: "setNumber",
                args: [BigInt(number)],
            });

            await waitForTransactionReceipt(config, { hash });
            await fetchCurrentNumber();
            setNumber("");
        } catch (error) {
            console.error("Error setting number:", error);
        }
    }

    async function handleIncrement() {
        try {
            const hash = await writeContract(config, {
                abi: counterAbi,
                address: CONTRACT_ADDRESS,
                functionName: "increment",
            });

            await waitForTransactionReceipt(config, { hash });
            await fetchCurrentNumber();
        } catch (error) {
            console.error("Error incrementing number:", error);
        }
    }

    return (
        <div className="flex flex-col space-y-6">
            <div className="text-center text-xl">
                Current Number: {currentNumber}
            </div>
            <InputField
                label="Enter a number"
                placeholder="e.g. 42"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="max-w-md"
            />
            <div className="flex justify-center gap-4">
                <button
                    onClick={handleSetNumber}
                    className="px-6 py-2 bg-green-600 dark:bg-green-700 text-gray-100 dark:text-gray-300 rounded-lg hover:bg-green-800 dark:hover:bg-green-800 transition-colors"
                >
                    Set Number
                </button>
                <button
                    onClick={handleIncrement}
                    className="px-6 py-2 bg-blue-600 dark:bg-blue-700 text-gray-100 dark:text-gray-300 rounded-lg hover:bg-blue-800 dark:hover:bg-blue-800 transition-colors"
                >
                    Increment
                </button>
            </div>
        </div>
    )
}
