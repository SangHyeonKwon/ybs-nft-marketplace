"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import {
  MARKETPLACE_ADDRESS,
  MARKETPLACE_ABI,
  CARD_PACK_ADDRESS,
  CARD_PACK_ABI,
} from "@/lib/contract";

function useErrorMessage(error: Error | null) {
  if (!error) return undefined;
  const msg = error.message.toLowerCase();
  if (msg.includes("insufficient funds") || msg.includes("exceeds balance"))
    return "ETH 잔액이 부족합니다.";
  if (msg.includes("user rejected") || msg.includes("user denied"))
    return "트랜잭션이 거부되었습니다.";
  if (msg.includes("not approved")) return "마켓플레이스 승인이 필요합니다.";
  if (msg.includes("revert")) return "컨트랙트 실행에 실패했습니다.";
  return "알 수 없는 오류가 발생했습니다.";
}

export function useListCard() {
  const {
    data: hash,
    writeContract,
    isPending: isWritePending,
    error: writeError,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash });

  const listCard = (tokenId: bigint, price: bigint) => {
    writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: "listCard",
      args: [tokenId, price],
    });
  };

  const error = writeError || receiptError;
  const errorMessage = useErrorMessage(error);

  return { listCard, hash, isWritePending, isConfirming, isSuccess, errorMessage, reset };
}

export function useBuyCard() {
  const {
    data: hash,
    writeContract,
    isPending: isWritePending,
    error: writeError,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash });

  const buyCard = (tokenId: bigint, price: bigint) => {
    writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: "buyCard",
      args: [tokenId],
      value: price,
    });
  };

  const error = writeError || receiptError;
  const errorMessage = useErrorMessage(error);

  return { buyCard, hash, isWritePending, isConfirming, isSuccess, errorMessage, reset };
}

export function useCancelListing() {
  const {
    data: hash,
    writeContract,
    isPending: isWritePending,
    error: writeError,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash });

  const cancelListing = (tokenId: bigint) => {
    writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: "cancelListing",
      args: [tokenId],
    });
  };

  const error = writeError || receiptError;
  const errorMessage = useErrorMessage(error);

  return { cancelListing, hash, isWritePending, isConfirming, isSuccess, errorMessage, reset };
}

export function useApproveMarketplace() {
  const {
    data: hash,
    writeContract,
    isPending: isWritePending,
    error: writeError,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash });

  const approve = () => {
    writeContract({
      address: CARD_PACK_ADDRESS,
      abi: CARD_PACK_ABI,
      functionName: "setApprovalForAll",
      args: [MARKETPLACE_ADDRESS, true],
    });
  };

  const error = writeError || receiptError;
  const errorMessage = useErrorMessage(error);

  return { approve, hash, isWritePending, isConfirming, isSuccess, errorMessage, reset };
}
