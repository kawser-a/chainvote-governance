"use client";
import { useEffect } from "react";
import { useToast } from "../ui/interactive";

// Confirms a sign-out after the redirect home, then tidies the URL.
export default function SignedOutNotice() {
    const { notify } = useToast();
    useEffect(() => {
        const url = new URL(window.location.href);
        if (url.searchParams.get("signed-out")) {
            notify("You’ve signed out.");
            url.searchParams.delete("signed-out");
            window.history.replaceState(null, "", url.pathname + url.search + url.hash);
        }
    }, [notify]);
    return null;
}
