import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Users,
  Eye,
  Heart,
  MessageSquare,
  DollarSign,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
} from "lucide-react";

interface DashboardMetrics {
  totalViews: number;
  viewsChange: number;
  totalInterests: number;
  interestsChange: number;
  totalApplications: number;
  applicationsChange: number;
  totalInvestmentInterest: number;
  investmentChange: number;
}

interface ChartDataPoint {
  date: string;
  views: number;
  interests: number;
  applications: number;
}

export default function DashboardEnhanced() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalViews: 0,
    viewsChange: 0,
    totalInterests: 0,
    interestsChange: 0,
    totalApplications: 0,
    applicationsChange: 0,
    totalInvestmentInterest: 0,
    investmentChange: 0,
  });

  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "year">("month");

  const { data: userProjects } = trpc.projects.getUserProjects.useQuery();
  const { data: analytics } = trpc.analytics.getProjectAnalytics.useQuery({
    projectId: 0,
  });

  useEffect(() => {
    if (analytics) {
      setMetrics({
        totalViews: analytics.totalViews || 0,
        viewsChange: 0,
        totalInterests: analytics.totalInterests || 0,
        interestsChange: 0,
        totalApplications: 0,
        applicationsChange: 0,
        totalInvestmentInterest: 0,
        investmentChange: 0,
      });
    }
  }, [analytics]);

  const MetricCard = ({
    title,
    value,
    change,
    icon: Icon,
    color,
    delay,
  }: {
    title: string;
    value: number;
    change: number;
    icon: any;
    color: string;
    delay: number;
  }) => {
    const isPositive = change >= 0;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        whileHover={{ y: -4 }}
      >
        <Card className="p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-lg ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: delay + 0.2 }}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                isPositive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {isPositive ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {Math.abs(change)}%
            </motion.div>
          </div>

          <p className="text-gray-600 text-sm mb-1">{title}</p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.1 }}
            className="text-3xl font-bold"
          >
            {value.toLocaleString()}
          </motion.p>
        </Card>
      </motion.div>
    );
  };

  const ProjectStatus = ({ project }: { project: any }) => {
    const statusConfig = {
      draft: { label: "Draft", color: "bg-gray-100 text-gray-700", icon: Clock },
      active: { label: "Active", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
      paused: { label: "Paused", color: "bg-yellow-100 text-yellow-700", icon: AlertCircle },
    };

    const config = statusConfig[project.status as keyof typeof statusConfig] || statusConfig.draft;
    const StatusIcon = config.icon;

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: 4 }}
        className="p-4 border rounded-lg hover:shadow-md transition-all"
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-semibold">{project.title}</h4>
            <p className="text-xs text-gray-600 mt-1">{project.description}</p>
          </div>
          <Badge className={config.color}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {config.label}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="p-2 bg-gray-50 rounded">
            <p className="text-gray-600">Views</p>
            <p className="font-bold">{project.views || 0}</p>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <p className="text-gray-600">Interests</p>
            <p className="font-bold">{project.interests || 0}</p>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <p className="text-gray-600">Apps</p>
            <p className="font-bold">{project.applications || 0}</p>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-3xl font-bold"
              >
                Welcome back, {user?.name || "Creator"}!
              </motion.h1>
              <p className="text-gray-600 mt-1">Here's your project performance overview</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              <Plus className="w-4 h-4" />
              New Project
            </motion.button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Metrics Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          <MetricCard
            title="Total Views"
            value={metrics.totalViews}
            change={metrics.viewsChange}
            icon={Eye}
            color="bg-blue-100 text-blue-600"
            delay={0}
          />
          <MetricCard
            title="Interests"
            value={metrics.totalInterests}
            change={metrics.interestsChange}
            icon={Heart}
            color="bg-red-100 text-red-600"
            delay={0.1}
          />
          <MetricCard
            title="Applications"
            value={metrics.totalApplications}
            change={metrics.applicationsChange}
            icon={MessageSquare}
            color="bg-green-100 text-green-600"
            delay={0.2}
          />
          <MetricCard
            title="Investment Interest"
            value={metrics.totalInvestmentInterest}
            change={metrics.investmentChange}
            icon={DollarSign}
            color="bg-purple-100 text-purple-600"
            delay={0.3}
          />
        </motion.div>

        {/* Charts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid lg:grid-cols-3 gap-6 mb-12"
        >
          {/* Main Chart */}
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">Performance Trend</h3>
              <div className="flex gap-2">
                {["Week", "Month", "Year"].map((period) => (
                  <motion.button
                    key={period}
                    whileHover={{ scale: 1.05 }}
                    className="px-3 py-1 rounded text-sm font-medium transition-all bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    {period}
                  </motion.button>
                ))}
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#999" />
                <YAxis stroke="#999" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="views" fill="#3b82f6" />
                <Bar dataKey="interests" fill="#ec4899" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Distribution Chart */}
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-6">Traffic Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Views", value: metrics.totalViews || 1 },
                    { name: "Interests", value: metrics.totalInterests || 1 },
                    { name: "Applications", value: metrics.totalApplications || 1 },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  <Cell fill="#3b82f6" />
                  <Cell fill="#ec4899" />
                  <Cell fill="#10b981" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Projects Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Your Projects
              </h3>
              <Badge variant="outline">{userProjects?.length || 0} projects</Badge>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="draft">Draft</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-3 mt-6">
                <AnimatePresence>
                  {userProjects && userProjects.length > 0 ? (
                    userProjects.map((project, index) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <ProjectStatus project={project} />
                      </motion.div>
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12"
                    >
                      <Zap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">No projects yet</p>
                      <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                        Create Your First Project
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </TabsContent>

              <TabsContent value="active" className="space-y-3 mt-6">
                <AnimatePresence>
                  {userProjects
                    ?.filter((p) => p.status === "active")
                    .map((project, index) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <ProjectStatus project={project} />
                      </motion.div>
                    ))}
                </AnimatePresence>
              </TabsContent>

              <TabsContent value="draft" className="space-y-3 mt-6">
                <AnimatePresence>
                  {userProjects
                    ?.filter((p) => p.status === "draft")
                    .map((project, index) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <ProjectStatus project={project} />
                      </motion.div>
                    ))}
                </AnimatePresence>
              </TabsContent>
            </Tabs>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
