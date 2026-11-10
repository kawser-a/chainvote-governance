export default function Testimonials() {
    const testimonials = [
      {
        quote: "This system revolutionized our student government elections. Turnout increased by 45% and results were available instantly.",
        name: "Sarah Johnson",
        role: "University Election Commissioner",
        avatar: "SJ"
      },
      {
        quote: "As someone who's worked in election security for 15 years, I've never seen a more transparent and verifiable system.",
        name: "Michael Chen",
        role: "Election Security Expert",
        avatar: "MC"
      },
      {
        quote: "Our community organization saved thousands of dollars by switching to blockchain voting while improving participation.",
        name: "Elena Rodriguez",
        role: "Nonprofit Director",
        avatar: "ER"
      }
    ];

    return (
      <section className="py-20 bg-[#0F0F0F] relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-[#C9F300]/5 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-[#9EFF00]/5 blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#C9F300]/10 text-[#C9F300] border border-[#C9F300]/20 mb-4">
              Testimonials
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">What Our Users Say</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Organizations and institutions are already experiencing the benefits of blockchain voting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-[#171717] border border-[#232323] rounded-2xl p-6 group hover:border-[#C9F300]/30 transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-[#C9F300] to-[#9EFF00] flex items-center justify-center text-[#121212] font-bold">
                      {testimonial.avatar}
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-white font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-[#A1A1A1]">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-300 italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
