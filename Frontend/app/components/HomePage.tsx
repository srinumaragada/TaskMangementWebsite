import { Check, Users, Clock, Calendar, Rocket, ChevronRight, Plus } from 'lucide-react';
import Link from 'next/link';
import Navbar from './Navabar';
import Footer from './Footer';

const HomePage = () => {
  const features = [
    {
      icon: <Check className="w-8 h-8 text-orange-500" />,
      title: "Task Management",
      description: "Organize and prioritize your tasks with our intuitive interface."
    },
    {
      icon: <Users className="w-8 h-8 text-orange-500" />,
      title: "Team Collaboration",
      description: "Work together seamlessly with your team"
    },
    {
      icon: <Clock className="w-8 h-8 text-orange-500" />,
      title: "Time Tracking",
      description: "Monitor how you spend your productive hours"
    },
    {
      icon: <Calendar className="w-8 h-8 text-orange-500" />,
      title: "Scheduling",
      description: "Plan your days and weeks efficiently"
    }
  ];

  const templates = [
    {
      name: "Personal Productivity",
      category: "Personal",
      color: "bg-blue-100 text-blue-800"
    },
    {
      name: "Project Management",
      category: "Work",
      color: "bg-purple-100 text-purple-800"
    },
    {
      name: "Student Planner",
      category: "Education",
      color: "bg-green-100 text-green-800"
    },
    {
      name: "Content Calendar",
      category: "Marketing",
      color: "bg-pink-100 text-pink-800"
    }
  ];

 
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar/>
      {/* Hero Section */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                <span className="text-orange-500">Organize</span> your work <br />
                and life, finally.
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Capture tasks at the speed of thought. Stay organized and focused with our intuitive task management system.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center">
                  Get Started <ChevronRight className="ml-1 h-5 w-5" />
                </Link>
                <button className="border border-orange-500 text-orange-500 hover:bg-orange-50 px-6 py-3 rounded-lg font-medium">
                  Watch Demo
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium text-gray-500">9:41 AM</span>
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <input type="checkbox" className="mt-1 h-5 w-5 text-orange-500 rounded" />
                    <div className="ml-3">
                      <p className="font-medium">Complete project proposal</p>
                      <p className="text-sm text-gray-500">Due today · Work</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <input type="checkbox" className="mt-1 h-5 w-5 text-orange-500 rounded" />
                    <div className="ml-3">
                      <p className="font-medium">Team meeting</p>
                      <p className="text-sm text-gray-500">10:00 AM · Conference Room</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <input type="checkbox" className="mt-1 h-5 w-5 text-orange-500 rounded" checked />
                    <div className="ml-3 opacity-60">
                      <p className="font-medium line-through">Review analytics report</p>
                      <p className="text-sm text-gray-500">Completed · 8:30 AM</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center text-gray-500">
                      <Plus className="h-5 w-5 mr-2" />
                      <span>Add task</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-6 -right-6 bg-orange-500 px-4 py-2 rounded-lg shadow-md">
                <p className="text-sm font-medium text-white">Your next project with TaskSphere</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Focus on what's important</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We've spent years refining our system to help you achieve more with less stress.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Get started with templates</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Jumpstart your productivity with our professionally designed templates.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {templates.map((template, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${template.color}`}>
                    {template.category}
                  </span>
                  <h3 className="text-xl font-semibold mt-3 mb-2">{template.name}</h3>
                  <Link href="#" className="text-orange-500 hover:text-orange-600 font-medium flex items-center">
                    Use template <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Link href="/Pages/templates" className="text-orange-500 hover:text-orange-600 font-medium">
              View all templates →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <Rocket className="h-12 w-12 text-white mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-6">Ready to transform your productivity?</h2>
            <p className="text-xl text-orange-100 mb-8">
              Join millions of people who organize their work and life with our app.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/download" className="bg-white text-orange-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium flex items-center justify-center">
                Download App
              </Link>
              <Link href="/register" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-orange-400 hover:bg-opacity-10 px-6 py-3 rounded-lg font-medium">
                Sign up for free
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer/>
    </div>
  );
};

export default HomePage;