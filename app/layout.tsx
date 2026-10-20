import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'REVEX — Reverse Engineer. Reconstruct. Recover.',description:'A blockchain forensic workstation for Solana programs, accounts and wallet positions.'};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>}
