import { Fraunces, Public_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./components/ui/interactive";
import LayoutWrapper from "./components/LayoutWrapper";

const publicSans = Public_Sans({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-public-sans",
});

// Headings only. A warm serif gives page titles some character without
// getting in the way of the forms.
const fraunces = Fraunces({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-fraunces",
    axes: ["opsz"],
});

export const metadata = {
    title: {
        default: "ChainVote: vote on what candidates promise",
        template: "%s · ChainVote",
    },
    description:
        "Enroll with your National ID, compare candidates' written commitments, cast your vote and follow up with petitions if promises aren't kept.",
};

export const viewport = {
    width: "device-width",
    initialScale: 1,
    themeColor: "#0b1714",
    colorScheme: "dark",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={`${publicSans.variable} ${fraunces.variable}`}>
            <body suppressHydrationWarning>
                <AuthProvider>
                    <ToastProvider>
                        <LayoutWrapper>{children}</LayoutWrapper>
                    </ToastProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
