import { Check, Users, Clock, Calendar, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function FeaturesPage() {
  const features = [
    {
      icon: <Check className="w-8 h-8 text-orange-500" />,
      title: "Task Management",
      description: "Organize and prioritize your tasks with our intuitive interface.",
      slug: "task-management"
    },
    {
      icon: <Users className="w-8 h-8 text-orange-500" />,
      title: "Team Collaboration",
      description: "Work together seamlessly with your team",
      slug: "team-collaboration"
    },
    {
      icon: <Clock className="w-8 h-8 text-orange-500" />,
      title: "Time Tracking",
      description: "Monitor how you spend your productive hours",
      slug: "time-tracking"
    },
    {
      icon: <Calendar className="w-8 h-8 text-orange-500" />,
      title: "Scheduling",
      description: "Plan your days and weeks efficiently",
      slug: "scheduling"
    }
  ];

  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Features</h1>
          <p className="text-xl text-gray-600">Everything you need to stay productive</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <Link 
              key={index} 
              href={`/features/${feature.slug}`}
              className="bg-gray-50 p-8 rounded-xl hover:shadow-md transition-shadow"
            >
              <div className="mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 mb-4">{feature.description}</p>
              <div className="text-orange-500 font-medium flex items-center">
                Learn more <ChevronRight className="ml-1 h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}