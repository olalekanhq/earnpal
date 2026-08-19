import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Loader2, Save, Image as ImageIcon, X } from "lucide-react";

export function RewardsManager() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    cost_points: 0,
    stock_count: 0,
    is_active: true,
    image_url: ""
  });
  const [isUploading, setIsUploading] = useState(false);

  const { data: rewards, isLoading } = useQuery({
    queryKey: ["admin-rewards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rewards")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const upsertRewardMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingReward) {
        const { error } = await supabase
          .from("rewards")
          .update(data)
          .eq("id", editingReward.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("rewards")
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-rewards"] });
      setIsDialogOpen(false);
      setEditingReward(null);
      resetForm();
      toast.success(editingReward ? "Reward updated" : "Reward created");
    },
    onError: (error) => {
      toast.error("Error saving reward: " + error.message);
    }
  });

  const deleteRewardMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("rewards")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-rewards"] });
      toast.success("Reward deleted");
    },
    onError: (error) => {
      toast.error("Error deleting reward: " + error.message);
    }
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      cost_points: 0,
      stock_count: 0,
      is_active: true,
      image_url: ""
    });
  };

  const handleEdit = (reward: any) => {
    setEditingReward(reward);
    setFormData({
      title: reward.title,
      description: reward.description || "",
      cost_points: reward.cost_points,
      stock_count: reward.stock_count || 0,
      is_active: reward.is_active,
      image_url: reward.image_url || ""
    });
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const filePath = `reward-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars') // Using avatars bucket for now as it exists
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      toast.error("Error uploading image: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-black uppercase tracking-tight">Manage Rewards</h3>
          <p className="text-sm text-muted-foreground font-medium">Create and manage items users can redeem their points for.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingReward(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="rounded-xl font-black uppercase tracking-widest text-xs h-11 shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" />
              Add Reward
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl max-w-md">
            <DialogHeader>
              <DialogTitle className="font-black text-xl uppercase tracking-tight">
                {editingReward ? "Edit Reward" : "Add New Reward"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Reward Image</label>
                <div className="flex items-center gap-4">
                  {formData.image_url ? (
                    <div className="relative h-20 w-20 rounded-xl overflow-hidden border border-border">
                      <img src={formData.image_url} alt="Reward" className="h-full w-full object-cover" />
                      <button 
                        onClick={() => setFormData(prev => ({ ...prev, image_url: "" }))}
                        className="absolute top-1 right-1 bg-background/80 p-1 rounded-full text-destructive hover:bg-background"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-20 w-20 rounded-xl bg-accent/50 border border-dashed border-border flex items-center justify-center text-muted-foreground">
                      <ImageIcon className="h-6 w-6" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="rounded-xl cursor-pointer"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1 px-1">Upload a clear image of the reward (optional).</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Title</label>
                <Input 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. $10 Amazon Gift Card"
                  className="rounded-xl h-12"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Description</label>
                <Textarea 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Tell users what they'll get..."
                  className="rounded-xl min-h-[100px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Cost (Points)</label>
                  <Input 
                    type="number"
                    value={formData.cost_points} 
                    onChange={(e) => setFormData({...formData, cost_points: parseInt(e.target.value) || 0})}
                    className="rounded-xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Stock</label>
                  <Input 
                    type="number"
                    value={formData.stock_count} 
                    onChange={(e) => setFormData({...formData, stock_count: parseInt(e.target.value) || 0})}
                    className="rounded-xl h-12"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                className="rounded-xl font-bold border-border/40"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => upsertRewardMutation.mutate(formData)}
                disabled={upsertRewardMutation.isPending || !formData.title || formData.cost_points <= 0}
                className="rounded-xl font-black uppercase tracking-widest text-xs"
              >
                {upsertRewardMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                {editingReward ? "Update Reward" : "Create Reward"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6">Reward</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6 text-center">Cost</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6 text-center">Stock</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6 text-center">Status</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rewards?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground font-medium">
                  No rewards created yet.
                </TableCell>
              </TableRow>
            ) : (
              rewards?.map((reward: any) => (
                <TableRow key={reward.id} className="border-border/40 hover:bg-accent/5 transition-colors">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {reward.image_url ? (
                        <div className="h-10 w-10 rounded-lg overflow-hidden border border-border flex-shrink-0">
                          <img src={reward.image_url} alt={reward.title} className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center text-muted-foreground flex-shrink-0">
                          <ImageIcon className="h-5 w-5" />
                        </div>
                      )}
                      <div>
                        <div className="font-bold">{reward.title}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">{reward.description}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <Badge variant="outline" className="font-bold text-primary border-primary/20 bg-primary/5">
                      {reward.cost_points} pts
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center font-medium">
                    {reward.stock_count || 0}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <Badge 
                      className={cn(
                        "font-black uppercase text-[10px] tracking-wider px-2 py-0.5",
                        reward.is_active ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"
                      )}
                    >
                      {reward.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                        onClick={() => handleEdit(reward)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/5"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this reward?")) {
                            deleteRewardMutation.mutate(reward.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
