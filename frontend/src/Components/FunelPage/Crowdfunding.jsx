import React from "react";
import { motion } from "framer-motion";

const CrowdfundingSection = () => {
  const fundingTiers = [
    {
      title: "Early Supporter",
      price: "$25",
      originalPrice: "$50",
      reward: "Digital Founder Badge + Early Access",
      features: [
        "Early access to platform",
        "Digital supporter badge",
        "Exclusive updates",
        "Community recognition"
      ],
      popular: false,
      buttonText: "Become Supporter",
      value: "starter"
    },
    {
      title: "Premium Backer",
      price: "$99",
      originalPrice: "$150",
      reward: "Premium Features + Exclusive Content",
      features: [
        "All Early Supporter benefits",
        "Premium feature access",
        "Exclusive digital content",
        "Priority support",
        "Beta testing access"
      ],
      popular: true,
      buttonText: "Join as Backer",
      value: "premium"
    },
    {
      title: "Visionary Investor",
      price: "$249",
      originalPrice: "$400",
      reward: "Full Platform Access + Special Recognition",
      features: [
        "All Premium Backer benefits",
        "Lifetime platform access",
        "Special recognition credits",
        "Direct team access",
        "Investment opportunities",
        "VIP launch event invite"
      ],
      popular: false,
      buttonText: "Invest as Visionary",
      value: "investor"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="relative py-20 lg:py-24 px-6 overflow-hidden bg-[#111827]">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 right-10 w-72 h-72 bg-gray-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-gray-500/5 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Join Our{" "}
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Funding Journey
            </span>
          </h2>

          <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full mx-auto mb-8"></div>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Be part of the revolution in gaming marketplaces. Your support helps us build 
            the next generation platform that connects gamers and developers worldwide.
          </p>

          {/* Campaign Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-12 p-6 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-lg">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">$128K</div>
              <div className="text-sm text-gray-300 font-medium">Raised</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">84%</div>
              <div className="text-sm text-gray-300 font-medium">Funded</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">28</div>
              <div className="text-sm text-gray-300 font-medium">Days Left</div>
            </div>
          </div>
        </motion.div>

        {/* Funding Tiers */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {fundingTiers.map((tier, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className={`relative rounded-3xl p-8 backdrop-blur-xl border transition-all duration-500 flex flex-col h-full ${
                tier.popular
                  ? "bg-gradient-to-br from-gray-700/40 to-gray-800/40 text-white shadow-2xl shadow-gray-500/20 border-gray-400/50 scale-105"
                  : "bg-white/5 border-white/10 shadow-xl hover:shadow-2xl hover:border-gray-300/30"
              }`}
            >
              {/* Glass Overlay */}
              <div className={`absolute inset-0 rounded-3xl backdrop-blur-md ${
                tier.popular ? "bg-gray-500/5" : "bg-white/5"
              }`}></div>
              
              {/* Content Container */}
              <div className="relative z-10 flex flex-col h-full">
                {/* Popular Badge */}
                {tier.popular && (
                  <div className="absolute -top-14 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-gray-600 to-gray-700 text-white text-sm font-bold px-6 py-2 rounded-full shadow-lg backdrop-blur-sm border border-white/20">
                      ⭐ MOST POPULAR
                    </div>
                  </div>
                )}

                {/* Tier Header */}
                <div className="text-center mb-8">
                  <h3 className={`text-2xl font-bold mb-3 ${tier.popular ? "text-white" : "text-white"}`}>
                    {tier.title}
                  </h3>
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <span className={`text-4xl font-bold ${tier.popular ? "text-white" : "text-white"}`}>
                      {tier.price}
                    </span>
                    <span className={`text-lg line-through ${tier.popular ? "text-gray-300" : "text-gray-400"}`}>
                      {tier.originalPrice}
                    </span>
                  </div>
                  <p className={`text-sm ${tier.popular ? "text-gray-300" : "text-gray-300"}`}>
                    {tier.reward}
                  </p>
                </div>

                {/* Features List */}
                <div className="space-y-4 mb-8 flex-grow">
                  {tier.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center backdrop-blur-sm ${
                        tier.popular 
                          ? "bg-white/20 text-white border border-white/30" 
                          : "bg-gray-500/20 text-gray-300 border border-gray-400/30"
                      }`}>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className={`text-sm ${tier.popular ? "text-gray-200" : "text-gray-200"}`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button Container - Pushed to bottom */}
                <div className="mt-auto">
                  <button className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 backdrop-blur-sm border ${
                    tier.popular
                      ? "bg-white/20 text-white border-white/30 hover:bg-white/30 hover:shadow-lg"
                      : "bg-gray-500/20 text-white border-gray-400/30 hover:bg-gray-600/30 hover:shadow-lg"
                  }`}>
                    {tier.buttonText}
                  </button>

                  {/* Value Badge */}
                  <div className={`text-center mt-4 text-xs font-medium ${
                    tier.popular ? "text-gray-300" : "text-gray-400"
                  }`}>
                    Limited spots available
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Platform Links */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-gray-300 mb-6">Also available on popular platforms</p>
          <div className="flex flex-wrap justify-center gap-6">
            {[
              { name: "Kickstarter", color: "bg-gray-500/20 hover:bg-gray-600/30", border: "border-gray-400/30" },
              { name: "Indiegogo", color: "bg-gray-500/20 hover:bg-gray-600/30", border: "border-gray-400/30" },
              { name: "GoFundMe", color: "bg-gray-600/20 hover:bg-gray-700/30", border: "border-gray-500/30" },
            ].map((platform, index) => (
              <button
                key={index}
                className={`${platform.color} ${platform.border} text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 shadow-lg hover:shadow-xl backdrop-blur-sm border`}
              >
                {platform.name}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto mt-16 pt-8 border-t border-gray-600/30"
        >
          {[
            { label: "Secure Payment", icon: "🔒" },
            { label: "Trusted by 500+", icon: "⭐" },
            { label: "Instant Delivery", icon: "⚡" },
            { label: "24/7 Support", icon: "💬" },
          ].map((item, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl mb-2 text-white">{item.icon}</div>
              <div className="text-sm text-gray-300 font-medium">{item.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CrowdfundingSection;