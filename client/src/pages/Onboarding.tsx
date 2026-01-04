import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Brain, Users, DollarSign, Handshake, ArrowRight } from "lucide-react";

const userTypes = [
  {
    id: "founder",
    name: "Founder",
    icon: Brain,
    description: "I have a business idea to launch",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "freelancer",
    name: "Freelancer / Expert",
    icon: Users,
    description: "I sell my skills and services",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "investor",
    name: "Investor",
    icon: DollarSign,
    description: "I invest in promising projects",
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "collaborator",
    name: "Co-Founder / Partner",
    icon: Handshake,
    description: "I want to join projects as partner",
    color: "from-orange-500 to-red-500",
  },
];

export default function Onboarding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Navigation */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Synapse
            </h1>
          </div>
          <a href={getLoginUrl()}>
            <Button variant="outline">Sign In</Button>
          </a>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Connect • Build • Launch • Scale
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            The all-in-one platform connecting founders, freelancers, investors, and collaborators to turn ideas into reality.
          </p>
        </div>

        {/* Role Selection */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-12">Choose Your Role</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {userTypes.map((type) => {
              const Icon = type.icon;
              return (
                <div
                  key={type.id}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-8 border border-gray-100 hover:border-purple-200 group cursor-pointer"
                >
                  <div className={`bg-gradient-to-r ${type.color} p-4 rounded-xl mb-4 w-fit group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-lg font-bold mb-2 group-hover:text-purple-600 transition-colors">{type.name}</h4>
                  <p className="text-sm text-gray-600 mb-6">{type.description}</p>
                  <a href={getLoginUrl()}>
                    <Button className="w-full" variant="default">
                      Get Started
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </a>
                </div>
              );
            })}
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl shadow-lg p-12 mb-16">
          <h3 className="text-2xl font-bold mb-12 text-center">How It Works</h3>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-purple-100 text-purple-600 rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg mx-auto mb-4">
                1
              </div>
              <h4 className="font-bold mb-2">Sign Up</h4>
              <p className="text-sm text-gray-600">Create your account and choose your role</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 text-purple-600 rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg mx-auto mb-4">
                2
              </div>
              <h4 className="font-bold mb-2">Complete Profile</h4>
              <p className="text-sm text-gray-600">Add your skills, experience, and interests</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 text-purple-600 rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg mx-auto mb-4">
                3
              </div>
              <h4 className="font-bold mb-2">Get Matched</h4>
              <p className="text-sm text-gray-600">Discover opportunities matched to your profile</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 text-purple-600 rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg mx-auto mb-4">
                4
              </div>
              <h4 className="font-bold mb-2">Collaborate</h4>
              <p className="text-sm text-gray-600">Connect and build amazing projects together</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h4 className="font-bold mb-2">Smart Matching</h4>
            <p className="text-sm text-gray-600">
              Advanced algorithm connects you with the perfect projects and people based on skills, interests, and goals.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h4 className="font-bold mb-2">Idea Validation</h4>
            <p className="text-sm text-gray-600">
              Validate your ideas with detailed market analysis, feasibility scores, and expert insights.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h4 className="font-bold mb-2">Team Building</h4>
            <p className="text-sm text-gray-600">
              Find the right team members, calculate costs, and manage applications all in one place.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h4 className="font-bold mb-2">Investment Tracking</h4>
            <p className="text-sm text-gray-600">
              Connect with investors, track funding rounds, and manage investment negotiations seamlessly.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h4 className="font-bold mb-2">Analytics Dashboard</h4>
            <p className="text-sm text-gray-600">
              Track project performance with real-time views, interests, applications, and engagement metrics.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h4 className="font-bold mb-2">Gamification</h4>
            <p className="text-sm text-gray-600">
              Earn badges, level up, and build your reputation as you collaborate and achieve milestones.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Footer */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16 mt-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Ideas?</h3>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of founders, freelancers, investors, and collaborators building the future together.
          </p>
          <a href={getLoginUrl()}>
            <Button size="lg" variant="secondary" className="text-purple-600">
              Get Started Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
