import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Search,
  Filter,
  TrendingUp,
  Users,
  DollarSign,
  Zap,
  Heart,
  MessageCircle,
  ArrowRight,
  Sparkles,
  X,
  MapPin,
  Calendar,
  Target,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type ProjectStage = "idea" | "prototype" | "running" | "scaling";

interface FilterState {
  stage: ProjectStage | "all";
  seekingTeam: boolean | "all";
  seekingInvestment: boolean | "all";
  searchQuery: string;
}

const STAGE_CONFIG = {
  idea: { label: "Idea", color: "bg-purple-100 text-purple-700", icon: Sparkles },
  prototype: { label: "Prototype", color: "bg-blue-100 text-blue-700", icon: Zap },
  running: { label: "Running", color: "bg-green-100 text-green-700", icon: TrendingUp },
  scaling: { label: "Scaling", color: "bg-orange-100 text-orange-700", icon: Users },
};

export default function MarketplaceEnhanced() {
  const [, navigate] = useLocation();
  const [filters, setFilters] = useState<FilterState>({
    stage: "all",
    seekingTeam: "all",
    seekingInvestment: "all",
    searchQuery: "",
  });

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"trending" | "newest" | "funding">("trending");
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const { data: projects, isLoading } = trpc.projects.list.useQuery({
    stage: filters.stage === "all" ? undefined : filters.stage,
    seekingTeam: filters.seekingTeam === "all" ? undefined : filters.seekingTeam === true,
    seekingInvestment:
      filters.seekingInvestment === "all" ? undefined : filters.seekingInvestment === true,
    limit: 50,
  });

  const filteredProjects = useMemo(() => {
    if (!projects) return [];

    let result = projects.filter((p) =>
      filters.searchQuery === ""
        ? true
        : p.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
            p.problem?.toLowerCase().includes(filters.searchQuery.toLowerCase())
    );

    // Sort
    switch (sortBy) {
      case "trending":
        result.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case "newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "funding":
        result.sort((a, b) => (Number(b.totalInvestmentNeeded) || 0) - (Number(a.totalInvestmentNeeded) || 0));
        break;
    }

    return result;
  }, [projects, filters.searchQuery, sortBy]);

  const toggleFavorite = (projectId: number) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(projectId)) {
      newFavorites.delete(projectId);
    } else {
      newFavorites.add(projectId);
    }
    setFavorites(newFavorites);
  };

  const ProjectCard = ({ project, index }: { project: any; index: number }) => {
    const StageIcon = STAGE_CONFIG[project.stage as ProjectStage]?.icon || Sparkles;
    const isFavorite = favorites.has(project.id);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ y: -4 }}
        className="h-full"
      >
        <Card className="p-6 h-full hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden relative">
          {/* Background gradient on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <motion.div
                    className={`p-2 rounded-lg ${
                      STAGE_CONFIG[project.stage as ProjectStage]?.color ||
                      "bg-gray-100 text-gray-700"
                    }`}
                    whileHover={{ scale: 1.1 }}
                  >
                    <StageIcon className="w-4 h-4" />
                  </motion.div>
                  <Badge variant="outline">{STAGE_CONFIG[project.stage as ProjectStage]?.label}</Badge>
                </div>
                <h3 className="font-bold text-lg group-hover:text-purple-600 transition-colors">
                  {project.title}
                </h3>
              </div>

              <motion.button
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(project.id);
                }}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Heart
                  className={`w-5 h-5 transition-colors ${
                    isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"
                  }`}
                />
              </motion.button>
            </div>

            {/* Description */}
            {project.problem && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.problem}</p>
            )}

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {project.tags.slice(0, 3).map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {project.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{project.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-xs text-gray-600">Views</p>
                <p className="font-bold text-sm">{(project.views as number) || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600">Interests</p>
                <p className="font-bold text-sm">{(project.interests as number) || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600">Apps</p>
                <p className="font-bold text-sm">{(project.applications as number) || 0}</p>
              </div>
            </div>

            {/* Financial Info */}
            {project.totalInvestmentNeeded && (
              <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Seeking</span>
                  <span className="font-bold text-green-700">
                    ${((project.totalInvestmentNeeded as number) / 1000).toFixed(0)}K
                  </span>
                </div>
              </div>
            )}

            {/* Badges */}
            <div className="flex gap-2 mb-4">
              {project.seekingTeam && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700"
                >
                  <Users className="w-3 h-3" />
                  Hiring
                </motion.div>
              )}
              {project.seekingInvestment && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-1 px-2 py-1 bg-green-50 border border-green-200 rounded text-xs text-green-700"
                >
                  <DollarSign className="w-3 h-3" />
                  Funding
                </motion.div>
              )}
              {project.openForCollaboration && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-1 px-2 py-1 bg-purple-50 border border-purple-200 rounded text-xs text-purple-700"
                >
                  <Sparkles className="w-3 h-3" />
                  Co-founder
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Calendar className="w-3 h-3" />
                {new Date(project.createdAt).toLocaleDateString()}
              </div>

              <motion.button
                whileHover={{ x: 4 }}
                onClick={() => navigate(`/project/${project.id}`)}
                className="flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-700"
              >
                View
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Marketplace</h1>
              <p className="text-sm text-gray-600">
                {filteredProjects.length} projects available
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                List
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-64 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search projects..."
                value={filters.searchQuery}
                onChange={(e) =>
                  setFilters({ ...filters, searchQuery: e.target.value })
                }
                className="pl-10"
              />
            </div>

            <Select
              value={filters.stage}
              onValueChange={(value) =>
                setFilters({ ...filters, stage: value as any })
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="idea">Idea</SelectItem>
                <SelectItem value="prototype">Prototype</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="scaling">Scaling</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trending">Trending</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="funding">Funding Needed</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={
                viewMode === "grid"
                  ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }
            >
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-lg" />
              ))}
            </motion.div>
          ) : filteredProjects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No projects found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your filters or search query
              </p>
              <Button
                onClick={() =>
                  setFilters({
                    stage: "all",
                    seekingTeam: "all",
                    seekingInvestment: "all",
                    searchQuery: "",
                  })
                }
              >
                Clear Filters
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={
                viewMode === "grid"
                  ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }
            >
              {filteredProjects.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
