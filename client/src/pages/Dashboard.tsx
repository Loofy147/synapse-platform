import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import {
  Rocket,
  TrendingUp,
  Users,
  DollarSign,
  Eye,
  Heart,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { data: userProjects, isLoading: projectsLoading } = trpc.projects.getUserProjects.useQuery();
  const { data: userApplications } = trpc.applications.getUserApplications.useQuery();
  const { data: userInvestments } = trpc.investments.getUserInvestments.useQuery();

  if (!user) return null;

  const renderFounderDashboard = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Projects Created</p>
              <p className="text-3xl font-bold">{userProjects?.length || 0}</p>
            </div>
            <Rocket className="w-10 h-10 text-purple-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Views</p>
              <p className="text-3xl font-bold">
                {userProjects?.reduce((sum, p) => sum + (p.views || 0), 0) || 0}
              </p>
            </div>
            <Eye className="w-10 h-10 text-blue-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Applications</p>
              <p className="text-3xl font-bold">{userApplications?.length || 0}</p>
            </div>
            <Users className="w-10 h-10 text-green-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Investors</p>
              <p className="text-3xl font-bold">{userInvestments?.length || 0}</p>
            </div>
            <DollarSign className="w-10 h-10 text-green-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">My Projects</h2>
          <Button onClick={() => navigate("/")}>Create Project</Button>
        </div>

        {projectsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
          </div>
        ) : userProjects && userProjects.length > 0 ? (
          <div className="space-y-4">
            {userProjects.map((project) => (
              <div
                key={project.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/project/${project.id}`)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{project.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{project.problem}</p>
                    <div className="flex gap-2 mt-3">
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                        {project.stage}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {project.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Views: {project.views}</p>
                    <p className="text-sm text-gray-600">Interests: {project.interests}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">No projects yet. Create your first project!</p>
        )}
      </div>
    </div>
  );

  const renderFreelancerDashboard = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Applications Sent</p>
              <p className="text-3xl font-bold">{userApplications?.length || 0}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Accepted</p>
              <p className="text-3xl font-bold">
                {userApplications?.filter((a) => a.status === "accepted").length || 0}
              </p>
            </div>
            <CheckCircle className="w-10 h-10 text-blue-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Level</p>
              <p className="text-3xl font-bold">{user.level}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-purple-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Applications */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">My Applications</h2>
          <Button onClick={() => navigate("/marketplace")}>Browse Projects</Button>
        </div>

        {userApplications && userApplications.length > 0 ? (
          <div className="space-y-4">
            {userApplications.map((app) => (
              <div key={app.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold">Application #{app.id}</h3>
                    <p className="text-gray-600 text-sm">{app.applicationType}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded font-semibold ${
                      app.status === "accepted"
                        ? "bg-green-100 text-green-700"
                        : app.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {app.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">No applications yet. Browse projects to apply!</p>
        )}
      </div>
    </div>
  );

  const renderInvestorDashboard = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Investments</p>
              <p className="text-3xl font-bold">{userInvestments?.length || 0}</p>
            </div>
            <DollarSign className="w-10 h-10 text-green-600 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Committed</p>
              <p className="text-3xl font-bold">
                {userInvestments?.filter((i) => i.status === "committed").length || 0}
              </p>
            </div>
            <CheckCircle className="w-10 h-10 text-blue-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Available Capital</p>
              <p className="text-3xl font-bold">${(parseFloat(user.earnings.toString()) * 2).toLocaleString()}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-purple-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Investments */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">My Investments</h2>
          <Button onClick={() => navigate("/marketplace")}>Explore Projects</Button>
        </div>

        {userInvestments && userInvestments.length > 0 ? (
          <div className="space-y-4">
            {userInvestments.map((inv) => (
              <div key={inv.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold">Investment #{inv.id}</h3>
                    <p className="text-gray-600 text-sm">${parseFloat(inv.amount.toString()).toLocaleString()}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded font-semibold ${
                      inv.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : inv.status === "declined"
                          ? "bg-red-100 text-red-700"
                          : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">No investments yet. Explore projects to invest!</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="text-right">
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-gray-600">Level {user.level} • {user.userType}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {user.userType === "founder" && renderFounderDashboard()}
        {user.userType === "freelancer" && renderFreelancerDashboard()}
        {user.userType === "investor" && renderInvestorDashboard()}
        {user.userType === "collaborator" && renderFreelancerDashboard()}
      </div>
    </div>
  );
}
