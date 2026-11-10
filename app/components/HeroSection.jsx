'use client';
import { useState, useEffect } from 'react';

export default function HeroSection() {
    const [currentFeature, setCurrentFeature] = useState(0);

    const features = [
        {
            title: "Secure & Transparent",
            description: "Every vote is recorded on an immutable blockchain, ensuring complete transparency and security.",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            )
        },
        {
            title: "Accessible Voting",
            description: "Cast your vote from anywhere in the world with our secure digital platform.",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
            )
        },
        {
            title: "Instant Results",
            description: "Election results are calculated in real-time with verifiable accuracy.",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            )
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentFeature((prev) => (prev + 1) % features.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-[#121212] flex items-center justify-center px-4 pt-16 pb-12 overflow-hidden">
            <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                {/* Left Column - Content */}
                <div className="relative z-10">
                    <div className="mb-6 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#C9F300]/10 text-[#C9F300] border border-[#C9F300]/20">
                        <span className="relative flex h-2 w-2 mr-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C9F300] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C9F300]"></span>
                        </span>
                        Blockchain Powered Voting
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                        The Future of <span className="text-[#C9F300]">Digital Democracy</span> is Here
                    </h1>

                    <p className="text-lg text-gray-300 mb-8 max-w-lg">
                        Experience next-generation voting with our blockchain-based platform. Secure, transparent, and accessible to everyone—revolutionizing elections one vote at a time.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 mb-12">
                        <button className="bg-gradient-to-r from-[#C9F300] to-[#9EFF00] text-[#121212] font-semibold py-3 px-8 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-[#C9F300]/20 hover:-translate-y-0.5">
                            Get Started
                        </button>
                        <button className="bg-[#1E1E1E] border border-[#2A2A2A] text-white font-medium py-3 px-8 rounded-lg transition-all duration-200 hover:border-[#C9F300]/40">
                            View Demo
                        </button>
                    </div>

                    {/* Features Carousel */}
                    <div className="bg-[#171717] border border-[#232323] rounded-xl p-5">
                        <div className="flex items-start mb-4">
                            <div className="flex-shrink-0 bg-[#C9F300]/10 p-2 rounded-lg text-[#C9F300]">
                                {features[currentFeature].icon}
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-white">{features[currentFeature].title}</h3>
                                <p className="text-gray-400 mt-1">{features[currentFeature].description}</p>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            {features.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentFeature(index)}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${index === currentFeature ? 'w-8 bg-[#C9F300]' : 'w-3 bg-[#2A2A2A]'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column - Visual Element */}
                <div className="relative">
                    <div className="relative z-10">
                        <div className="bg-gradient-to-br from-[#171717] to-[#0F0F0F] border border-[#232323] rounded-2xl p-6 shadow-2xl">
                            {/* Voting Interface Mockup */}
                            <div className="bg-[#121212] rounded-xl overflow-hidden border border-[#2A2A2A]">
                                <div className="bg-[#1A1A1A] px-4 py-3 border-b border-[#2A2A2A] flex items-center">
                                    <div className="flex space-x-2">
                                        <div className="h-3 w-3 rounded-full bg-[#ED6A5E]"></div>
                                        <div className="h-3 w-3 rounded-full bg-[#F4BF4F]"></div>
                                        <div className="h-3 w-3 rounded-full bg-[#61C454]"></div>
                                    </div>
                                    <div className="flex-1 text-center text-xs text-gray-500 font-medium">votechain.demo/elect2023</div>
                                </div>
                                <div className="p-5">
                                    <div className="flex items-center mb-6">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#C9F300] to-[#9EFF00] flex items-center justify-center text-[#121212] font-bold">
                                            VC
                                        </div>
                                        <div className="ml-3">
                                            <div className="text-white font-medium">Presidential Election 2023</div>
                                            <div className="text-xs text-gray-500">2,934,221 votes cast</div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        {['Candidate A', 'Candidate B', 'Candidate C'].map((candidate, index) => (
                                            <div key={index} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-4 hover:border-[#C9F300]/30 transition-colors duration-200 cursor-pointer">
                                                <div className="flex items-center">
                                                    <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center mr-3 ${index === 0 ? 'border-[#C9F300]' : 'border-[#3A3A3A]'
                                                        }`}>
                                                        {index === 0 && <div className="h-2 w-2 rounded-full bg-[#C9F300]"></div>}
                                                    </div>
                                                    <div className="text-white font-medium">{candidate}</div>
                                                    <div className="ml-auto text-xs bg-[#C9F300]/10 text-[#C9F300] px-2 py-1 rounded">
                                                        {index === 0 ? '42.3%' : index === 1 ? '36.1%' : '21.6%'}
                                                    </div>
                                                </div>
                                                {index === 0 && (
                                                    <div className="mt-2 h-2 bg-[#232323] rounded-full overflow-hidden">
                                                        <div className="h-full bg-gradient-to-r from-[#C9F300] to-[#9EFF00] rounded-full" style={{ width: '42.3%' }}></div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <button className="w-full bg-gradient-to-r from-[#C9F300] to-[#9EFF00] text-[#121212] font-semibold py-3 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-[#C9F300]/20">
                                        Confirm Vote
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Floating elements */}
                        <div className="absolute -top-4 -left-4 h-24 w-24 rounded-full bg-[#C9F300]/10 blur-xl"></div>
                        <div className="absolute -bottom-4 -right-4 h-32 w-32 rounded-full bg-[#9EFF00]/5 blur-xl"></div>
                    </div>

                    {/* Background decorative elements */}
                    <div className="absolute top-1/2 -translate-y-1/2 -left-20 w-72 h-72 rounded-full bg-[#C9F300]/5 blur-3xl"></div>
                    <div className="absolute bottom-0 -right-20 w-80 h-80 rounded-full bg-[#9EFF00]/5 blur-3xl"></div>
                </div>
            </div>
        </div>
    );
}
