// import { Inter } from "next/font/google";
// import "./globals.css";
// import Header from "./components/header";
// import { AuthProvider } from "./context/AuthContext";
// import { AdminAuthProvider } from "./context/AdminAuthContext";

// const inter = Inter({
//     subsets: ['latin'],
//     display: 'swap',
//     variable: '--font-inter',
//     fallback: ['system-ui', 'arial']
// })

// export const metadata = {
//     title: "ChainVote: A Blockchain-Powered Participatory Governance System",
//     description: "ChainVote is an open-source participatory governance system built on blockchain technology.",
// };

// export default function RootLayout({ children }) {

//     return (
//         <html lang="en">
//             <body className={`${inter.className} `}>
//                 <AuthProvider>
//                     <AdminAuthProvider>
//                     <Header />
//                     <main className="min-h-screen">
//                         {children}
//                     </main>
//                     <footer />
//                     </AdminAuthProvider>
//                 </AuthProvider>
//             </body>
//         </html>
//     );
// }


import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./components/header";
import { AuthProvider } from "./context/AuthContext";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import LayoutWrapper from "./components/LayoutWrapper";

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-inter",
});

export const metadata = {
    title: "ChainVote: A Blockchain-Powered Participatory Governance System",
    description:
        "ChainVote is an open-source participatory governance system built on blockchain technology.",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={inter.className} suppressHydrationWarning>
                <AuthProvider>
                    <AdminAuthProvider>
                        <LayoutWrapper>{children}</LayoutWrapper>
                    </AdminAuthProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
