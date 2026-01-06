import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Save,
  X,
  History,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

interface ProjectEditData {
  title: string;
  description: string;
  status: "draft" | "active" | "paused" | "completed" | "archived";
  seekingTeam: boolean;
  seekingInvestment: boolean;
  openForCollaboration: boolean;
}

interface ChangeHistory {
  field: string;
  oldValue: string;
  newValue: string;
  changedAt: Date;
  changedBy: string;
}

export default function ProjectEdit() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/project/:id/edit");
  const projectId = params?.id ? parseInt(params.id) : null;

  const [editData, setEditData] = useState<ProjectEditData>({
    title: "",
    description: "",
    status: "draft",
    seekingTeam: false,
    seekingInvestment: false,
    openForCollaboration: false,
  });

  const [originalData, setOriginalData] = useState<ProjectEditData | null>(null);
  const [changes, setChanges] = useState<Partial<ProjectEditData>>({});
  const [changeHistory, setChangeHistory] = useState<ChangeHistory[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { data: project, isLoading } = trpc.projects.getById.useQuery(
    { projectId: projectId! },
    { enabled: !!projectId }
  );

  const updateProjectMutation = trpc.projects.update.useMutation({
    onSuccess: () => {
      toast.success("Project updated successfully!");
      setHasUnsavedChanges(false);
      setChanges({});
      if (originalData) {
        setOriginalData(editData);
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update project");
    },
  });

  useEffect(() => {
    if (project) {
      const data: ProjectEditData = {
        title: project.title,
        description: project.description || "",
        status: project.status || "draft",
        seekingTeam: project.seekingTeam || false,
        seekingInvestment: project.seekingInvestment || false,
        openForCollaboration: project.openForCollaboration || false,
      };
      setEditData(data);
      setOriginalData(data);
    }
  }, [project]);

  const handleFieldChange = (field: keyof ProjectEditData, value: any) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);

    const newChanges = { ...changes };
    if (originalData && originalData[field] === value) {
      delete newChanges[field];
    } else {
      newChanges[field] = value;
    }
    setChanges(newChanges);
  };

  const handleSave = async () => {
    if (!projectId) return;

    updateProjectMutation.mutate({
      projectId,
      ...changes,
    });
  };

  const handleDiscard = () => {
    if (originalData) {
      setEditData(originalData);
      setChanges({});
      setHasUnsavedChanges(false);
      toast.info("Changes discarded");
    }
  };

  const getChangeSummary = () => {
    return Object.entries(changes).map(([field, newValue]) => {
      const oldValue = originalData?.[field as keyof ProjectEditData];
      return {
        field,
        oldValue: String(oldValue),
        newValue: String(newValue),
      };
    });
  };

  if (!match || !projectId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center">
            <p className="text-gray-600">Project not found</p>
            <Button onClick={() => navigate("/dashboard")} className="mt-4">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center">
            <p className="text-gray-600">Loading project...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/project/${projectId}`)}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold">Edit Project</h1>
              <p className="text-gray-600">{editData.title}</p>
            </div>
          </div>

          {hasUnsavedChanges && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg"
            >
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-yellow-700">Unsaved changes</span>
            </motion.div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                {/* Content Tab */}
                <TabsContent value="content" className="space-y-6 mt-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Project Title</label>
                    <Input
                      value={editData.title}
                      onChange={(e) => handleFieldChange("title", e.target.value)}
                      className={
                        changes.title ? "border-blue-500 bg-blue-50" : ""
                      }
                    />
                    {changes.title && (
                      <p className="text-xs text-blue-600 mt-1">
                        Changed from: "{originalData?.title}"
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <Textarea
                      value={editData.description}
                      onChange={(e) => handleFieldChange("description", e.target.value)}
                      rows={6}
                      className={
                        changes.description ? "border-blue-500 bg-blue-50" : ""
                      }
                    />
                    {changes.description && (
                      <p className="text-xs text-blue-600 mt-1">Description modified</p>
                    )}
                  </div>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="space-y-6 mt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div>
                        <p className="font-medium">Seeking Team Members</p>
                        <p className="text-sm text-gray-600">
                          Make your project visible to freelancers
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={editData.seekingTeam}
                        onChange={(e) =>
                          handleFieldChange("seekingTeam", e.target.checked)
                        }
                        className="w-5 h-5 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div>
                        <p className="font-medium">Seeking Investment</p>
                        <p className="text-sm text-gray-600">
                          Open to investor inquiries
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={editData.seekingInvestment}
                        onChange={(e) =>
                          handleFieldChange("seekingInvestment", e.target.checked)
                        }
                        className="w-5 h-5 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div>
                        <p className="font-medium">Open for Co-Founder</p>
                        <p className="text-sm text-gray-600">
                          Looking for a co-founder
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={editData.openForCollaboration}
                        onChange={(e) =>
                          handleFieldChange("openForCollaboration", e.target.checked)
                        }
                        className="w-5 h-5 rounded"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-8 pt-8 border-t">
                <Button
                  onClick={handleDiscard}
                  variant="outline"
                  disabled={!hasUnsavedChanges}
                >
                  <X className="w-4 h-4 mr-2" />
                  Discard
                </Button>

                <Button
                  onClick={handleSave}
                  disabled={!hasUnsavedChanges || updateProjectMutation.isPending}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 ml-auto"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </Card>
          </div>

          {/* Sidebar - Change Summary */}
          <div className="space-y-6">
            {/* Changes Preview */}
            {hasUnsavedChanges && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="p-6 bg-blue-50 border-blue-200">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-blue-600" />
                    Pending Changes
                  </h3>

                  <div className="space-y-3">
                    {getChangeSummary().map((change) => (
                      <div
                        key={change.field}
                        className="p-3 bg-white rounded border border-blue-200"
                      >
                        <p className="text-xs font-medium text-gray-600 uppercase">
                          {change.field}
                        </p>
                        <p className="text-sm text-gray-600 mt-1 line-through">
                          {change.oldValue.substring(0, 50)}
                          {change.oldValue.length > 50 ? "..." : ""}
                        </p>
                        <p className="text-sm font-medium text-blue-600 mt-1">
                          {change.newValue.substring(0, 50)}
                          {change.newValue.length > 50 ? "..." : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Project Info */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Project Info
              </h3>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Status</p>
                  <Badge variant="outline" className="mt-1">
                    {editData.status}
                  </Badge>
                </div>

                <div>
                  <p className="text-gray-600">Last Modified</p>
                  <p className="font-medium mt-1">
                    {project?.updatedAt
                      ? new Date(project.updatedAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-600">Created</p>
                  <p className="font-medium mt-1">
                    {project?.createdAt
                      ? new Date(project.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </Card>

            {/* Version History */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <History className="w-4 h-4" />
                Version History
              </h3>

              <div className="space-y-2 text-sm">
                <div className="p-3 bg-gray-50 rounded border">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium">Current Version</p>
                    <Clock className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-600">
                    {new Date().toLocaleString()}
                  </p>
                </div>

                {changeHistory.length === 0 && (
                  <p className="text-gray-600 text-xs py-4 text-center">
                    No change history yet
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Delete Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The project and all associated data will be
              permanently deleted.
            </AlertDialogDescription>
            <div className="flex gap-3 justify-end">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
