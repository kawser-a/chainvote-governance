export default function HowItWorks() {
    const steps = [
      {
        number: "01",
        title: "Voter Registration",
        description: "Users verify their identity and register on the blockchain network to become eligible voters.",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        )
      },
      {
        number: "02",
        title: "Secure Voting",
        description: "Cast your vote through our encrypted platform, with each vote recorded as a transaction on the blockchain.",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        )
      },
      {
        number: "03",
        title: "Transparent Tallying",
        description: "Votes are counted in real-time on the blockchain, with results that are verifiable by anyone.",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        )
      },
      {
        number: "04",
        title: "Instant Results",
        description: "Election results are available immediately after voting concludes, with full transparency.",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        )
      }
    ];

    return (
      <section className="py-20 bg-[#0F0F0F] relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 left-0 w-full h-72 bg-gradient-to-b from-[#121212] to-transparent"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-[#C9F300]/5 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-[#9EFF00]/5 blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#C9F300]/10 text-[#C9F300] border border-[#C9F300]/20 mb-4">
              Process
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Our blockchain voting system ensures security, transparency, and accessibility in every election process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="bg-[#171717] border border-[#232323] rounded-2xl p-6 hover:border-[#C9F300]/30 transition-all duration-300 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-2xl font-bold text-[#C9F300] opacity-80">{step.number}</div>
                  <div className="p-2 rounded-lg bg-[#C9F300]/10 text-[#C9F300] group-hover:scale-110 transition-transform">
                    {step.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
