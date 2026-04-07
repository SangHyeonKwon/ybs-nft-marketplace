"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEventLogs } from "viem";
import { CARD_PACK_ABI, CARD_PACK_ADDRESS } from "@/lib/contract";

export function useBuyPack() {
  const {
    data: hash,
    writeContract,
    isPending: isWritePending,
    error: writeError,
    reset,
  } = useWriteContract();

  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash });

  const buyPack = (price: bigint) => {
    writeContract({
      address: CARD_PACK_ADDRESS,
      abi: CARD_PACK_ABI,
      functionName: "buyPack",
      value: price,
    });
  };

  // PackOpened 이벤트에서 tokenIds, rarities 파싱
  const packOpenedEvent =
    receipt
      ? parseEventLogs({
          abi: CARD_PACK_ABI,
          logs: receipt.logs,
          eventName: "PackOpened",
        })[0]
      : undefined;

  const tokenIds = packOpenedEvent?.args.tokenIds;
  const rarities = packOpenedEvent?.args.rarities;

  const error = writeError || receiptError;

  let errorMessage: string | undefined;
  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("insufficient funds") || msg.includes("exceeds balance")) {
      errorMessage = "ETH 잔액이 부족합니다.";
    } else if (msg.includes("user rejected") || msg.includes("user denied")) {
      errorMessage = "트랜잭션이 거부되었습니다.";
    } else if (msg.includes("revert")) {
      errorMessage = "컨트랙트 실행에 실패했습니다.";
    } else {
      errorMessage = "알 수 없는 오류가 발생했습니다.";
    }
  }

  return {
    buyPack,
    hash,
    isWritePending,
    isConfirming,
    isSuccess,
    tokenIds,
    rarities,
    errorMessage,
    reset,
  };
}
