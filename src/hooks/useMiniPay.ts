"use client";

import { useState, useEffect } from "react";
import { injected } from "wagmi/connectors";
import { useConnect, useAccount } from "wagmi";

export function useMiniPay() {
  const [isMiniPay, setIsMiniPay] = useState(false);
  const [isDetecting, setIsDetecting] = useState(true);
  const { connect } = useConnect();
  const { address, isConnected } = useAccount();

  useEffect(() => {
    const detect = () => {
      if (typeof window !== "undefined" && window.ethereum) {
        const detected = Boolean((window.ethereum as any).isMiniPay);
        setIsMiniPay(detected);
        if (detected && !isConnected) {
          connect({ connector: injected({ target: "metaMask" }) });
        }
      }
      setIsDetecting(false);
    };
    const timer = setTimeout(detect, 100);
    return () => clearTimeout(timer);
  }, [connect, isConnected]);

  return { isMiniPay, isDetecting, address, isConnected };
}