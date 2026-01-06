import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  AlertCircle,
  Plus,
  X,
  DollarSign,
  Users,
  Target,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

type ProjectStage = "idea" | "prototype" | "running" | "scaling";

interface ProjectFormData {
  title: string;
  description: string;
  problem: string;
  solution: string;
  targetMarket: string;
  stage: ProjectStage;
  tags: string[];
  seekingTeam: boolean;
  seekingInvestment: boolean;
  openForCollaboration: boolean;
  monthlyBurn?: number;
  runway?: number;
  revenueYear1?: number;
  revenueYear2?: number;
  revenueYear3?: number;
}

const STEPS = [
  { id: 1, label: "Basics", icon: Sparkles },
  { id: 2, label: "Problem & Solution", icon: Zap },
  { id: 3, label: "Market", icon: Target },
  { id: 4, label: "Financials", icon: DollarSign },
  { id: 5, label: "Team Needs", icon: Users },
  { id: 6, label: "Review", icon: CheckCircle2 },
];

const STAGE_OPTIONS = [
  { value: "idea", label: "Idea Stage", description: "Just an idea, no code yet" },
  { value: "prototype", label: "Prototype", description: "MVP or working prototype" },
  { value: "running", label: "Running", description: "Live product with users" },
  { value: "scaling", label: "Scaling", description: "Growing and scaling" },
];

const SUGGESTED_TAGS = [
  "SaaS",
  "Mobile",
  "AI/ML",
  "Fintech",
  "Healthcare",
  "E-commerce",
  "EdTech",
  "Social",
  "B2B",
  "B2C",
  "Marketplace",
  "Developer Tools",
];

export default function ProjectCreation() {
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProjectFormData>({
    title: "",
    description: "",
    problem: "",
    solution: "",
    targetMarket: "",
    stage: "idea",
    tags: [],
    seekingTeam: false,
    seekingInvestment: false,
    openForCollaboration: false,
  });
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createProjectMutation = trpc.projects.create.useMutation({
    onSuccess: () => {
      toast.success("Project created successfully!");
      navigate("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create project");
    },
  });

  const validateStep = useCallback((step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.title.trim()) newErrors.title = "Title is required";
        if (formData.title.length < 3) newErrors.title = "Title must be at least 3 characters";
        if (!formData.stage) newErrors.stage = "Stage is required";
        break;

      case 2:
        if (!formData.problem.trim()) newErrors.problem = "Problem description is required";
        if (formData.problem.length < 10)
          newErrors.problem = "Problem must be at least 10 characters";
        if (!formData.solution.trim()) newErrors.solution = "Solution description is required";
        if (formData.solution.length < 10)
          newErrors.solution = "Solution must be at least 10 characters";
        break;

      case 3:
        if (!formData.targetMarket.trim()) newErrors.targetMarket = "Target market is required";
        break;

      case 4:
        if (formData.seekingInvestment) {
          if (!formData.monthlyBurn) newErrors.monthlyBurn = "Monthly burn is required";
          if (!formData.runway) newErrors.runway = "Runway is required";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < STEPS.length) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (field: keyof ProjectFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && formData.tags.length < 10) {
      const newTag = tagInput.trim().toLowerCase();
      if (!formData.tags.includes(newTag)) {
        handleInputChange("tags", [...formData.tags, newTag]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    handleInputChange(
      "tags",
      formData.tags.filter((t) => t !== tag)
    );
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    createProjectMutation.mutate({
      title: formData.title,
      description: formData.description,
      problem: formData.problem,
      solution: formData.solution,
      targetMarket: formData.targetMarket,
      stage: formData.stage,
      tags: formData.tags,
    });
  };

  const StepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium mb-2">Project Title</label>
              <Input
                placeholder="e.g., AI-Powered Task Manager"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Project Stage</label>
              <Select value={formData.stage} onValueChange={(v) => handleInputChange("stage", v)}>
                <SelectTrigger className={errors.stage ? "border-red-500" : ""}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <p className="font-medium">{option.label}</p>
                        <p className="text-xs text-gray-500">{option.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.stage && <p className="text-sm text-red-500 mt-1">{errors.stage}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Brief Description</label>
              <Textarea
                placeholder="What is your project about?"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={4}
              />
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium mb-2">The Problem</label>
              <Textarea
                placeholder="What problem are you solving?"
                value={formData.problem}
                onChange={(e) => handleInputChange("problem", e.target.value)}
                rows={4}
              />
              {errors.problem && <p className="text-sm text-red-500 mt-1">{errors.problem}</p>}
              <p className="text-xs text-gray-500 mt-2">Minimum 10 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Your Solution</label>
              <Textarea
                placeholder="How do you solve it?"
                value={formData.solution}
                onChange={(e) => handleInputChange("solution", e.target.value)}
                rows={4}
              />
              {errors.solution && <p className="text-sm text-red-500 mt-1">{errors.solution}</p>}
              <p className="text-xs text-gray-500 mt-2">Minimum 10 characters</p>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium mb-2">Target Market</label>
              <Textarea
                placeholder="Who is your target audience?"
                value={formData.targetMarket}
                onChange={(e) => handleInputChange("targetMarket", e.target.value)}
                rows={3}
              />
              {errors.targetMarket && (
                <p className="text-sm text-red-500 mt-1">{errors.targetMarket}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Tags</label>
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="Add tags..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                />
                <Button onClick={handleAddTag} variant="outline" size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer">
                    {tag}
                    <X
                      className="w-3 h-3 ml-1"
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {SUGGESTED_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      if (!formData.tags.includes(tag.toLowerCase())) {
                        handleInputChange("tags", [...formData.tags, tag.toLowerCase()]);
                      }
                    }}
                    className="text-left px-3 py-2 rounded border hover:bg-gray-50 text-sm"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-blue-800">
                Financial information helps investors understand your needs
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                checked={formData.seekingInvestment}
                onCheckedChange={(checked) =>
                  handleInputChange("seekingInvestment", checked)
                }
              />
              <label className="text-sm font-medium">I'm seeking investment</label>
            </div>

            {formData.seekingInvestment && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium mb-2">Monthly Burn Rate ($)</label>
                  <Input
                    type="number"
                    placeholder="e.g., 10000"
                    value={formData.monthlyBurn || ""}
                    onChange={(e) =>
                      handleInputChange("monthlyBurn", parseFloat(e.target.value) || undefined)
                    }
                  />
                  {errors.monthlyBurn && (
                    <p className="text-sm text-red-500 mt-1">{errors.monthlyBurn}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Runway (months)</label>
                  <Input
                    type="number"
                    placeholder="e.g., 12"
                    value={formData.runway || ""}
                    onChange={(e) =>
                      handleInputChange("runway", parseInt(e.target.value) || undefined)
                    }
                  />
                  {errors.runway && <p className="text-sm text-red-500 mt-1">{errors.runway}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Year 1 Revenue Projection ($)</label>
                  <Input
                    type="number"
                    placeholder="e.g., 100000"
                    value={formData.revenueYear1 || ""}
                    onChange={(e) =>
                      handleInputChange("revenueYear1", parseFloat(e.target.value) || undefined)
                    }
                  />
                </div>
              </div>
            )}
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={formData.seekingTeam}
                  onCheckedChange={(checked) => handleInputChange("seekingTeam", checked)}
                />
                <label className="text-sm font-medium">I'm looking for team members</label>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  checked={formData.seekingInvestment}
                  onCheckedChange={(checked) => handleInputChange("seekingInvestment", checked)}
                />
                <label className="text-sm font-medium">I'm seeking investment</label>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  checked={formData.openForCollaboration}
                  onCheckedChange={(checked) =>
                    handleInputChange("openForCollaboration", checked)
                  }
                />
                <label className="text-sm font-medium">Open for co-founder collaboration</label>
              </div>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-900">
                These settings help the right people find your project. You can change them anytime.
              </p>
            </div>
          </motion.div>
        );

      case 6:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Project Title</p>
                <p className="font-semibold">{formData.title}</p>
              </div>

              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Stage</p>
                <p className="font-semibold capitalize">{formData.stage}</p>
              </div>

              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Problem</p>
                <p className="text-sm">{formData.problem}</p>
              </div>

              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-900">
                  ✓ Ready to create! You can add more details after creation.
                </p>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 py-12">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Your Project</h1>
          <p className="text-gray-600">Turn your idea into reality on Synapse</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-12">
          <div className="flex justify-between mb-4">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index + 1 < currentStep;
              const isCurrent = index + 1 === currentStep;

              return (
                <motion.div
                  key={step.id}
                  className="flex flex-col items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isCurrent
                          ? "bg-purple-600 text-white ring-4 ring-purple-200"
                          : "bg-gray-200 text-gray-600"
                    }`}
                    whileHover={{ scale: 1.1 }}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </motion.div>
                  <p className="text-xs font-medium text-center">{step.label}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / STEPS.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Form Card */}
        <Card className="p-8 shadow-lg">
          <AnimatePresence mode="wait">
            <StepContent />
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-8 border-t">
            <Button
              onClick={handlePrevious}
              variant="outline"
              disabled={currentStep === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="text-sm text-gray-600">
              Step {currentStep} of {STEPS.length}
            </div>

            <Button
              onClick={handleNext}
              disabled={createProjectMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {currentStep === STEPS.length ? (
                <>
                  Create Project
                  <Sparkles className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
