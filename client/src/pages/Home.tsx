import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import {
  Rocket,
  TrendingUp,
  Users,
  DollarSign,
  Sparkles,
  ArrowRight,
  LogOut,
  Settings,
} from "lucide-react";

export default function Home() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const { data: recommendations } = trpc.matching.getRecommendations.useQuery(
    { limit: 5, minScore: 40 },
    { enabled: !!user }
  );

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Navigation */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Synapse
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate("/marketplace")}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Marketplace
            </button>
            <div className="flex items-center gap-2 pl-4 border-l">
              <div className="text-right text-sm">
                <p className="font-semibold">{user.name || "User"}</p>
                <p className="text-gray-600">Level {user.level}</p>
              </div>
              <button
                onClick={() => navigate("/profile")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={logout}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold mb-4">Welcome back, {user.name || "User"}! 👋</h2>
          <p className="text-xl text-gray-600">
            {user.userType === "founder" && "Ready to validate your idea and build your team?"}
            {user.userType === "freelancer" && "Find exciting projects that match your skills."}
            {user.userType === "investor" && "Discover promising startups to invest in."}
            {user.userType === "collaborator" && "Join amazing projects as a co-founder."}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700">Your Level</h3>
              <TrendingUp className="w-6 h-6 text-purple-500 opacity-50" />
            </div>
            <p className="text-3xl font-bold text-purple-600">{user.level}</p>
            <p className="text-sm text-gray-600 mt-2">Score: {user.score}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700">Collaborations</h3>
              <Users className="w-6 h-6 text-blue-500 opacity-50" />
            </div>
            <p className="text-3xl font-bold text-blue-600">{user.collaborations}</p>
            <p className="text-sm text-gray-600 mt-2">Active projects</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700">Badges Earned</h3>
              <Sparkles className="w-6 h-6 text-yellow-500 opacity-50" />
            </div>
            <p className="text-3xl font-bold text-yellow-600">{user.badges?.length || 0}</p>
            <p className="text-sm text-gray-600 mt-2">Achievements</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700">Earnings</h3>
              <DollarSign className="w-6 h-6 text-green-500 opacity-50" />
            </div>
            <p className="text-3xl font-bold text-green-600">${parseFloat(user.earnings.toString()).toLocaleString()}</p>
            <p className="text-sm text-gray-600 mt-2">Total earned</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-lg p-8 mb-12 text-white">
          <h3 className="text-2xl font-bold mb-6">Get Started</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {user.userType === "founder" && (
              <>
                <Button
                  onClick={() => navigate("/dashboard")}
                  variant="secondary"
                  className="text-purple-600 hover:text-purple-700"
                >
                  <Rocket className="w-4 h-4 mr-2" />
                  Create Project
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  onClick={() => navigate("/marketplace")}
                  variant="secondary"
                  className="text-purple-600 hover:text-purple-700"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Find Team Members
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  onClick={() => navigate("/marketplace")}
                  variant="secondary"
                  className="text-purple-600 hover:text-purple-700"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Find Investors
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            )}

            {user.userType === "freelancer" && (
              <>
                <Button
                  onClick={() => navigate("/marketplace")}
                  variant="secondary"
                  className="text-purple-600 hover:text-purple-700"
                >
                  <Rocket className="w-4 h-4 mr-2" />
                  Browse Projects
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  onClick={() => navigate("/profile")}
                  variant="secondary"
                  className="text-purple-600 hover:text-purple-700"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Add Skills
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  onClick={() => navigate("/dashboard")}
                  variant="secondary"
                  className="text-purple-600 hover:text-purple-700"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Applications
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            )}

            {user.userType === "investor" && (
              <>
                <Button
                  onClick={() => navigate("/marketplace")}
                  variant="secondary"
                  className="text-purple-600 hover:text-purple-700"
                >
                  <Rocket className="w-4 h-4 mr-2" />
                  Explore Projects
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  onClick={() => navigate("/dashboard")}
                  variant="secondary"
                  className="text-purple-600 hover:text-purple-700"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  My Investments
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  onClick={() => navigate("/marketplace")}
                  variant="secondary"
                  className="text-purple-600 hover:text-purple-700"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Portfolio
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              Recommended for You
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.slice(0, 3).map((match) => (
                <div
                  key={match.projectId}
                  className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/project/${match.projectId}`)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Match Score</p>
                      <p className="text-2xl font-bold text-purple-600">{match.totalScore}%</p>
                    </div>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                      {match.matchType}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{match.recommendation}</p>
                  <Button className="w-full" variant="outline">
                    View Details
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
