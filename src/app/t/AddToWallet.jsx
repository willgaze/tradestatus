'use client'

import { useEffect, useState } from 'react'
import { WalletIcon } from '@/components/icons'

/**
 * "Add to Apple Wallet."
 *
 * Only drawn when the deployment can sign a pass (the page checks that on the
 * server and passes `walletReady`), and only on an Apple device, decided after
 * mount — a .pkpass on Android is a download that opens nothing, and a button
 * that does nothing is worse than no button. The link is the pass itself:
 * Safari hands application/vnd.apple.pkpass straight to Wallet.
 */
export default function AddToWallet({ code }) {
  const [apple, setApple] = useState(false)
  useEffect(() => {
    setApple(/iPhone|iPad|Macintosh/.test(navigator.userAgent))
  }, [])
  if (!apple) return null
  return (
    <a href={`/api/passes/${code}`}
       className="mt-3 flex items-center justify-center gap-2.5 rounded-2xl bg-black px-5 py-3.5 text-[15px] font-semibold text-white shadow-sm active:scale-[.99]">
      <WalletIcon size={21} />
      Add to Apple Wallet
    </a>
  )
}
