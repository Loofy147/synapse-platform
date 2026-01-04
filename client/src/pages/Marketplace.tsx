import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Search, Filter, Eye, Heart, Users, DollarSign, Loader2 } from "lucide-react";

export default function Marketplace() {
  const [, navigate] = useLocation();
  const [stage, setStage] = useState<string | undefined>();
  const [seekingTeam, setSeekingTeam] = useState<boolean | undefined>();
  const [seekingInvestment, setSeekingInvestment] = useState<boolean | undefined>();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: projects, isLoading } = trpc.projects.list.useQuery({
    stage: stage as any,
    seekingTeam,
    seekingInvestment,
    limit: 50,
  });

  const filteredProjects = projects?.filter((p) =>
    searchQuery === ""
      ? true
      : p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.problem?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Marketplace</h1>
          <Button onClick={() => navigate("/dashboard")}>My Dashboard</Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div>
              <label className="text-sm font-semibold block mb-2">Stage</label>
              <select
                value={stage || ""}
                onChange={(e) => setStage(e.target.value || undefined)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Stages</option>
                <option value="idea">💡 Idea</option>
                <option value="prototype">🔧 Prototype</option>
                <option value="running">🚀 Running</option>
                <option value="scaling">📈 Scaling</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold block mb-2">Seeking</label>
              <select
                value={seekingTeam ? "team" : seekingInvestment ? "investment" : ""}
                onChange={(e) => {
                  if (e.target.value === "team") {
                    setSeekingTeam(true);
                    setSeekingInvestment(undefined);
                  } else if (e.target.value === "investment") {
                    setSeekingInvestment(true);
                    setSeekingTeam(undefined);
                  } else {
                    setSeekingTeam(undefined);
                    setSeekingInvestment(undefined);
                  }
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Projects</option>
                <option value="team">👥 Seeking Team</option>
                <option value="investment">💰 Seeking Investment</option>
              </select>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : filteredProjects && filteredProjects.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-lg shadow hover:shadow-xl transition-shadow overflow-hidden cursor-pointer group"
                onClick={() => navigate(`/project/${project.id}`)}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg group-hover:text-purple-600 transition-colors line-clamp-2">
                        {project.title}
                      </h3>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                          {project.stage}
                        </span>
                        {project.validated && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            ✓ Validated
                          </span>
                        )}
                      </div>
                    </div>
                    {project.validationScore && (
                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-600">{project.validationScore}</p>
                        <p className="text-xs text-gray-500">score</p>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {project.problem && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.problem || ""}</p>
                  )}

                  {/* Financial Info */}
                  {project.totalInvestmentNeeded && (
                    <div className="bg-gray-50 rounded p-3 mb-4 text-sm">
                      <p className="text-gray-600">Investment Needed</p>
                      <p className="font-bold text-lg">
                        ${parseFloat(project.totalInvestmentNeeded.toString()).toLocaleString()}
                      </p>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4 text-center text-sm">
                    <div className="bg-blue-50 rounded p-2">
                      <Eye className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                      <p className="font-semibold">{project.views}</p>
                      <p className="text-xs text-gray-600">Views</p>
                    </div>
                    <div className="bg-pink-50 rounded p-2">
                      <Heart className="w-4 h-4 mx-auto mb-1 text-pink-600" />
                      <p className="font-semibold">{project.interests}</p>
                      <p className="text-xs text-gray-600">Interests</p>
                    </div>
                    <div className="bg-green-50 rounded p-2">
                      <Users className="w-4 h-4 mx-auto mb-1 text-green-600" />
                      <p className="font-semibold">0</p>
                      <p className="text-xs text-gray-600">Applied</p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.seekingTeam && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">👥 Hiring</span>
                    )}
                    {project.seekingInvestment && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">💰 Seeking Investment</span>
                    )}
                    {project.openForCollaboration && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">🤝 Open to Partners</span>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg">No projects found matching your criteria.</p>
            <Button onClick={() => setSearchQuery("")} variant="outline" className="mt-4">
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
