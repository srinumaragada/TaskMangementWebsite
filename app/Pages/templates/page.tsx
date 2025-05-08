import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function TemplatesPage() {
  const categories = [
    {
      name: "Personal",
      templates: [
        { name: "Daily Routine", slug: "daily-routine" },
        { name: "Fitness Tracker", slug: "fitness-tracker" },
        { name: "Reading List", slug: "reading-list" }
      ]
    },
    {
      name: "Business",
      templates: [
        { name: "Project Management", slug: "project-management" },
        { name: "Meeting Agenda", slug: "meeting-agenda" },
        { name: "Sales Pipeline", slug: "sales-pipeline" }
      ]
    },
    {
      name: "Education",
      templates: [
        { name: "Student Planner", slug: "student-planner" },
        { name: "Research Project", slug: "research-project" },
        { name: "Exam Preparation", slug: "exam-preparation" }
      ]
    }
  ];

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Templates</h1>
          <p className="text-xl text-gray-600">Jumpstart your productivity with our templates</p>
        </div>
        
        {categories.map((category, index) => (
          <div key={index} className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">{category.name}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.templates.map((template, tIndex) => (
                <Link 
                  key={tIndex} 
                  href={`/templates/${template.slug}`}
                  className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <h3 className="text-lg font-medium mb-2">{template.name}</h3>
                  <div className="text-orange-500 hover:text-orange-600 font-medium flex items-center">
                    Use template <ChevronRight className="ml-1 h-4 w-4" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}