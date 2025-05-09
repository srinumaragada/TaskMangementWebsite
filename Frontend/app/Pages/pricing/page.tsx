import { Check as CheckIcon } from 'lucide-react';

export default function PricingPage() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for individuals getting started",
      features: [
        "Up to 5 projects",
        "Basic task management",
        "1GB storage",
        "Community support"
      ],
      cta: "Get Started"
    },
    {
      name: "Pro",
      price: "$9",
      description: "For professionals and small teams",
      features: [
        "Unlimited projects",
        "Advanced task management",
        "10GB storage",
        "Priority support",
        "Team collaboration"
      ],
      cta: "Start Free Trial",
      featured: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large organizations",
      features: [
        "Unlimited everything",
        "Dedicated account manager",
        "On-premise options",
        "Custom integrations",
        "24/7 support"
      ],
      cta: "Contact Sales"
    }
  ];

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Pricing Plans</h1>
          <p className="text-xl text-gray-600">Choose the perfect plan for your needs</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-xl shadow-sm overflow-hidden ${plan.featured ? 'ring-2 ring-orange-500' : ''}`}
            >
              {plan.featured && (
                <div className="bg-orange-500 text-white text-center py-1 text-sm font-medium">
                  Most Popular
                </div>
              )}
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h2>
                <p className="text-4xl font-bold mb-4">{plan.price}{plan.price !== "Custom" && <span className="text-lg font-normal text-gray-500">/month</span>}</p>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <span className="ml-2 text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  className={`w-full py-3 px-4 rounded-md font-medium ${
                    plan.featured 
                      ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}