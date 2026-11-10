export default function CTASection() {
    return (
      <section className="py-20 bg-gradient-to-br from-[#0F0F0F] to-[#121212] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-[#C9F300]/10 to-transparent"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-72 bg-[#C9F300]/5 blur-4xl rounded-full"></div>

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Transform Your Voting Process?</h2>
          <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto">
            Join the revolution in democratic processes with our secure, transparent blockchain voting platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-[#C9F300] to-[#9EFF00] text-[#121212] font-semibold py-3 px-8 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-[#C9F300]/20 hover:-translate-y-0.5">
              Get Started Today
            </button>
            <button className="bg-[#1E1E1E] border border-[#2A2A2A] text-white font-medium py-3 px-8 rounded-lg transition-all duration-200 hover:border-[#C9F300]/40">
              Schedule a Demo
            </button>
          </div>

          <p className="text-sm text-[#A1A1A1] mt-8">
            No credit card required. Start with our free plan.
          </p>
        </div>
      </section>
    );
  }
