// pages/templates/[template].tsx
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

const templateData = {
  "daily-routine": {
    name: "Daily Routine",
    category: "Personal",
    description: "Plan your perfect day with this comprehensive daily routine template.",
    content: [
      "Morning routine with time blocks",
      "Work/study schedule",
      "Exercise and meal planning",
      "Evening wind-down activities"
    ]
  },
  // Add other templates similarly
};

export default function TemplatePage({
  params,
}: {
  params: { template: string };
}) {
  const template = templateData[params.template as keyof typeof templateData];

  if (!template) {
    return notFound();
  }

  return (
    <div className="py-16 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/Pages/templates" className="text-orange-500 hover:text-orange-600 font-medium flex items-center mb-8">
          <ChevronLeft className="h-5 w-5 mr-1" /> Back to all templates
        </Link>

        <div className="mb-8">
          <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full mb-4">
            {template.category}
          </span>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{template.name}</h1>
          <p className="text-xl text-gray-600">{template.description}</p>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Template includes:</h2>
          <ul className="space-y-3">
            {template.content.map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="flex-shrink-0 h-6 w-6 text-orange-500">•</span>
                <span className="ml-2">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <button className="mt-8 w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-md font-medium">
          Use This Template
        </button>
      </div>
    </div>
  );
}
