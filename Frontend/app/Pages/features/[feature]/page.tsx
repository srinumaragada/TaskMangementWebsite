import { notFound } from 'next/navigation';
import { Check, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

const featureData = {
  "task-management": {
    title: "Task Management",
    description: "Organize and prioritize your tasks with our intuitive interface.",
    icon: <Check className="w-10 h-10 text-orange-500" />,
    content: [
      {
        title: "Quick Add",
        description: "Add tasks in seconds with our natural language processing."
      },
      {
        title: "Prioritization",
        description: "Easily mark tasks as high, medium, or low priority."
      },
      {
        title: "Subtasks",
        description: "Break down large tasks into manageable steps."
      }
    ]
  },
  // Add other features similarly
};

export default function FeaturePage({
  params,
}: {
  params: { feature: string }
}) {
  const feature = featureData[params.feature as keyof typeof featureData];
  
  if (!feature) {
    return notFound();
  }

  return (
    <div className="py-16 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/Pages/features" className="text-orange-500 hover:text-orange-600 font-medium flex items-center mb-8">
          <ChevronLeft className="h-5 w-5 mr-1" /> Back to all features
        </Link>
        
        <div className="mb-8">
          <div className="mb-4">
            {feature.icon}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{feature.title}</h1>
          <p className="text-xl text-gray-600">{feature.description}</p>
        </div>
        
        <div className="space-y-8">
          {feature.content.map((item, index) => (
            <div key={index} className="border-l-4 border-orange-500 pl-4 py-2">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}