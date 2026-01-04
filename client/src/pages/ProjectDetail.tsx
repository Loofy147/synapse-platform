import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Eye,
  Users,
  DollarSign,
  Calendar,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";

export default function ProjectDetail() {
  const [match, params] = useRoute("/project/:id");
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const projectId = params?.id ? parseInt(params.id) : null;

  const { data: project, isLoading } = trpc.projects.getById.useQuery(
    { projectId: projectId || 0 },
    { enabled: !!projectId }
  );

  const { data: matchScore } = trpc.matching.calculateScore.useQuery(
    { projectId: projectId || 0 },
    { enabled: !!projectId && !!user }
  );

  const submitApplicationMutation = trpc.applications.submit.useMutation({
    onSuccess: () => {
      alert("Application submitted successfully!");
    },
  });

  const recordInvestmentMutation = trpc.investments.recordInterest.useMutation({
    onSuccess: () => {
      alert("Investment interest recorded!");
    },
  });

  if (!projectId || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Project not found</p>
          <Button onClick={() => navigate("/marketplace")} className="mt-4">
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  const handleApply = async () => {
    if (!user) return;
    await submitApplicationMutation.mutateAsync({
      projectId: project.id,
      applicationType: "team_member",
      coverLetter: "I'm interested in this project",
    });
  };

  const handleInvest = async () => {
    if (!user) return;
    const amount = prompt("Enter investment amount ($):");
    if (amount) {
      await recordInvestmentMutation.mutateAsync({
        projectId: project.id,
        amount: parseFloat(amount),
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/marketplace")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold flex-1">{project.title}</h1>
          {matchScore && (
            <div className="text-right">
              <p className="text-2xl font-bold text-purple-600">{matchScore.totalScore}%</p>
              <p className="text-xs text-gray-600">Match Score</p>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Overview */}
            <div className="bg-white rounded-lg shadow p-8">
              <div className="flex gap-4 mb-6">
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                  {project.stage}
                </span>
                {project.validated && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    ✓ Validated
                  </span>
                )}
              </div>

              <h2 className="text-3xl font-bold mb-4">{project.title}</h2>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mb-8 pb-8 border-b">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-5 h-5 text-blue-600" />
                    <span className="font-bold text-2xl">{project.views}</span>
                  </div>
                  <p className="text-sm text-gray-600">Views</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-5 h-5 text-pink-600" />
                    <span className="font-bold text-2xl">{project.interests}</span>
                  </div>
                  <p className="text-sm text-gray-600">Interests</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-green-600" />
                    <span className="font-bold text-2xl">0</span>
                  </div>
                  <p className="text-sm text-gray-600">Applied</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                    <span className="font-bold text-2xl">0</span>
                  </div>
                  <p className="text-sm text-gray-600">Investors</p>
                </div>
              </div>

              {/* Problem & Solution */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-3">The Problem</h3>
                  <p className="text-gray-700 leading-relaxed">{project.problem}</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">Our Solution</h3>
                  <p className="text-gray-700 leading-relaxed">{project.solution}</p>
                </div>

                {project.targetMarket && (
                  <div>
                    <h3 className="text-xl font-bold mb-3">Target Market</h3>
                    <p className="text-gray-700 leading-relaxed">{project.targetMarket}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Validation Scores */}
            {project.validationScore && (
              <div className="bg-white rounded-lg shadow p-8">
                <h3 className="text-2xl font-bold mb-6">Validation Scores</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Overall Score</span>
                      <span className="text-2xl font-bold text-purple-600">{project.validationScore}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${project.validationScore}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Market Potential</span>
                      <span className="text-2xl font-bold text-green-600">{project.marketPotential}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${project.marketPotential}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Feasibility</span>
                      <span className="text-2xl font-bold text-blue-600">{project.feasibility}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${project.feasibility}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Competition</span>
                      <span className="text-2xl font-bold text-orange-600">{project.competition}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-600 h-2 rounded-full"
                        style={{ width: `${project.competition}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Financial Info */}
            {project.monthlyBurn && (
              <div className="bg-white rounded-lg shadow p-8">
                <h3 className="text-2xl font-bold mb-6">Financial Projections</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded p-4">
                    <p className="text-gray-600 text-sm mb-1">Monthly Burn Rate</p>
                    <p className="text-2xl font-bold text-blue-600">
                      ${parseFloat(project.monthlyBurn.toString()).toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-green-50 rounded p-4">
                    <p className="text-gray-600 text-sm mb-1">Total Investment Needed</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${parseFloat(project.totalInvestmentNeeded?.toString() || "0").toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-purple-50 rounded p-4">
                    <p className="text-gray-600 text-sm mb-1">Runway</p>
                    <p className="text-2xl font-bold text-purple-600">{project.runway} months</p>
                  </div>

                  <div className="bg-orange-50 rounded p-4">
                    <p className="text-gray-600 text-sm mb-1">Break Even</p>
                    <p className="text-2xl font-bold text-orange-600">Month {project.breakEvenMonth}</p>
                  </div>

                  {project.revenueYear1 && (
                    <>
                      <div className="bg-indigo-50 rounded p-4">
                        <p className="text-gray-600 text-sm mb-1">Year 1 Revenue</p>
                        <p className="text-2xl font-bold text-indigo-600">
                          ${parseFloat(project.revenueYear1.toString()).toLocaleString()}
                        </p>
                      </div>

                      <div className="bg-indigo-50 rounded p-4">
                        <p className="text-gray-600 text-sm mb-1">Year 2 Revenue</p>
                        <p className="text-2xl font-bold text-indigo-600">
                          ${parseFloat(project.revenueYear2?.toString() || "0").toLocaleString()}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Match Score Card */}
            {matchScore && (
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600">
                <h3 className="font-bold text-lg mb-4">Your Match</h3>
                <p className="text-3xl font-bold text-purple-600 mb-2">{matchScore.totalScore}%</p>
                <p className="text-sm text-gray-600 mb-4">{matchScore.recommendation}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Skills Match</span>
                    <span className="font-bold">{matchScore.skillScore}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stage Match</span>
                    <span className="font-bold">{matchScore.stageScore}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Interest Match</span>
                    <span className="font-bold">{matchScore.interestScore}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow p-6 space-y-3">
              {user?.userType === "freelancer" && project.seekingTeam && (
                <Button
                  onClick={handleApply}
                  disabled={submitApplicationMutation.isPending}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                >
                  {submitApplicationMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    "Apply as Team Member"
                  )}
                </Button>
              )}

              {user?.userType === "investor" && project.seekingInvestment && (
                <Button
                  onClick={handleInvest}
                  disabled={recordInvestmentMutation.isPending}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                >
                  {recordInvestmentMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Recording...
                    </>
                  ) : (
                    "Express Investment Interest"
                  )}
                </Button>
              )}

              {user?.userType === "collaborator" && project.openForCollaboration && (
                <Button
                  onClick={handleApply}
                  disabled={submitApplicationMutation.isPending}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
                >
                  {submitApplicationMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    "Join as Co-Founder"
                  )}
                </Button>
              )}

              <Button variant="outline" className="w-full">
                <Heart className="w-4 h-4 mr-2" />
                Save Project
              </Button>
            </div>

            {/* Project Info Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-4">Project Info</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Owner</p>
                  <p className="font-semibold">{project.ownerName}</p>
                </div>
                <div>
                  <p className="text-gray-600">Status</p>
                  <p className="font-semibold capitalize">{project.status}</p>
                </div>
                <div>
                  <p className="text-gray-600">Created</p>
                  <p className="font-semibold">{new Date(project.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
