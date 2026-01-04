import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Brain, Users, DollarSign, Handshake, Loader2 } from "lucide-react";
import { useLocation } from "wouter";

const userTypes = [
  {
    id: "founder" as const,
    name: "Founder",
    icon: Brain,
    description: "I have a business idea to launch",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "freelancer" as const,
    name: "Freelancer / Expert",
    icon: Users,
    description: "I sell my skills and services",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "investor" as const,
    name: "Investor",
    icon: DollarSign,
    description: "I invest in promising projects",
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "collaborator" as const,
    name: "Co-Founder / Partner",
    icon: Handshake,
    description: "I want to join projects as partner",
    color: "from-orange-500 to-red-500",
  },
];

export default function ProfileSetup() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [selectedType, setSelectedType] = useState<string | null>(user?.userType || null);
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [location, setLocation] = useState(user?.location || "");
  const [website, setWebsite] = useState(user?.website || "");
  const [isLoading, setIsLoading] = useState(false);

  const updateProfileMutation = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      navigate("/");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) return;

    setIsLoading(true);
    try {
      await updateProfileMutation.mutateAsync({
        name: name || undefined,
        bio: bio || undefined,
        location: location || undefined,
        website: website || undefined,
        userType: selectedType as "founder" | "freelancer" | "investor" | "collaborator",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-2xl mb-4">
            <Brain className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Welcome to Synapse
          </h1>
          <p className="text-xl text-gray-600">Complete your profile to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Role Selection */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Choose Your Role</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {userTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSelectedType(type.id)}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      selectedType === type.id
                        ? `border-purple-500 bg-purple-50 shadow-lg`
                        : `border-gray-200 hover:border-purple-200`
                    }`}
                  >
                    <div className={`bg-gradient-to-r ${type.color} p-3 rounded-lg w-fit mb-3`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-1">{type.name}</h3>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Profile Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Profile Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, Country"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Website</label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={!selectedType || isLoading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-lg font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Continue to Dashboard"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
