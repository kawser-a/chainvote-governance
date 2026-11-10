import Image from "next/image";
import HeroSection from "./components/HeroSection";
import HowItWorks from "./components/HowItWorks";
import BenefitsSection from "./components/BenefitsSections";
import Testimonials from "./components/Testimonials";
import CTASection from "./components/CTASection";
import Footer from "./components/footer";
// import FAQSection from "./components/FAQ";

export default function Home() {
    return (
        <>
                <HeroSection/>
                <HowItWorks/>
                <BenefitsSection/>
                <Testimonials/>
                <CTASection/>
                {/* <FAQSection/> */}
                <Footer/>
        </>
    );
}
