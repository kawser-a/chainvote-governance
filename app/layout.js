import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./components/header";

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-inter',
})

export const metadata = {
    title: "ChainVote: A Blockchain-Powered Participatory Governance System",
    description: "ChainVote is an open-source participatory governance system built on blockchain technology.",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={`${inter.className} `}>
                <Header />
                <main className="min-h-screen">
                    {children}
                </main>
                <footer />
            </body>
        </html>
    );
}
