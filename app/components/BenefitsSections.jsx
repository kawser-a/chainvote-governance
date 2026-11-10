export default function BenefitsSection() {
    const benefits = [
      {
        title: "Immutable Records",
        description: "Once recorded, votes cannot be altered or tampered with, ensuring election integrity.",
        icon: "🔒"
      },
      {
        title: "Global Accessibility",
        description: "Vote from anywhere in the world without compromising security or verification.",
        icon: "🌎"
      },
      {
        title: "Real-time Results",
        description: "Watch election results unfold in real-time with complete transparency.",
        icon: "📊"
      },
      {
        title: "Reduced Costs",
        description: "Eliminate physical polling stations and manual counting processes.",
        icon: "💰"
      },
      {
        title: "Enhanced Security",
        description: "Military-grade encryption protects every step of the voting process.",
        icon: "🛡️"
      },
      {
        title: "Verifiable Results",
        description: "Every voter can verify that their vote was counted correctly.",
        icon: "✅"
      }
    ];

    return (
      <section className="py-20 bg-[#121212] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-72 bg-[#C9F300]/5 blur-4xl rounded-full"></div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#C9F300]/10 text-[#C9F300] border border-[#C9F300]/20 mb-4">
              Advantages
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Choose Blockchain Voting</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Traditional voting systems have limitations that blockchain technology effectively solves.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-[#171717] border border-[#232323] rounded-2xl p-6 hover:border-[#C9F300]/30 transition-all duration-300 group hover:-translate-y-1">
                <div className="text-3xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{benefit.title}</h3>
                <p className="text-gray-400">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
