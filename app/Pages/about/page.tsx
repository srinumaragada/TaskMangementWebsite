export default function AboutPage() {
    return (
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">About TaskSphere</h1>
            <p className="text-xl text-gray-600">Our mission to make productivity accessible to everyone</p>
          </div>
          
          <div className="prose max-w-3xl mx-auto">
            <p>
              TaskSphere was founded in 2023 with a simple goal: to help people organize their 
              work and life without the complexity of traditional task managers.
            </p>
            <p>
              Our team of productivity enthusiasts came together to create a tool that combines
              powerful features with an intuitive interface. We believe that task management
              should be simple, flexible, and even enjoyable.
            </p>
            <h2 className="text-2xl font-bold mt-8 mb-4">Our Values</h2>
            <ul>
              <li>Simplicity - We strip away unnecessary complexity</li>
              <li>Flexibility - Adapts to your workflow, not the other way around</li>
              <li>Reliability - Your data is always safe and accessible</li>
              <li>Community - We listen to and learn from our users</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }