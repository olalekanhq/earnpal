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
import { Plus, Edit2, Trash2, Loader2, Save, CheckCircle2, Circle } from "lucide-react";

export function TasksManager() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    points: 0,
    category: "social",
    is_active: true
  });

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["admin-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const upsertTaskMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingTask) {
        const { error } = await supabase
          .from("tasks")
          .update(data)
          .eq("id", editingTask.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("tasks")
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tasks"] });
      setIsDialogOpen(false);
      setEditingTask(null);
      resetForm();
      toast.success(editingTask ? "Task updated" : "Task created");
    },
    onError: (error) => {
      toast.error("Error saving task: " + error.message);
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tasks"] });
      toast.success("Task deleted");
    },
    onError: (error) => {
      toast.error("Error deleting task: " + error.message);
    }
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      points: 0,
      category: "social",
      is_active: true
    });
  };

  const handleEdit = (task: any) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || "",
      points: task.points,
      category: task.category || "social",
      is_active: task.is_active
    });
    setIsDialogOpen(true);
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-black uppercase tracking-tight">Manage Tasks</h3>
          <p className="text-sm text-muted-foreground font-medium">Create activities for users to earn points.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingTask(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="rounded-xl font-black uppercase tracking-widest text-xs h-11 shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl max-w-md">
            <DialogHeader>
              <DialogTitle className="font-black text-xl uppercase tracking-tight">
                {editingTask ? "Edit Task" : "Add New Task"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Title</label>
                <Input 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Follow us on Twitter"
                  className="rounded-xl h-12"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Description</label>
                <Textarea 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="What should the user do?"
                  className="rounded-xl min-h-[80px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Reward (Points)</label>
                  <Input 
                    type="number"
                    value={formData.points} 
                    onChange={(e) => setFormData({...formData, points: parseInt(e.target.value) || 0})}
                    className="rounded-xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full rounded-xl h-12 px-3 bg-background border border-input focus:ring-2 focus:ring-primary text-sm font-bold"
                  >
                    <option value="social">Social</option>
                    <option value="daily">Daily</option>
                    <option value="survey">Survey</option>
                    <option value="offer">Offer</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn("rounded-lg px-3 font-bold", formData.is_active ? "text-green-600 bg-green-50" : "text-muted-foreground")}
                  onClick={() => setFormData({...formData, is_active: !formData.is_active})}
                >
                  {formData.is_active ? <CheckCircle2 className="h-4 w-4 mr-2" /> : <Circle className="h-4 w-4 mr-2" />}
                  {formData.is_active ? "Active" : "Inactive"}
                </Button>
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
                onClick={() => upsertTaskMutation.mutate(formData)}
                disabled={upsertTaskMutation.isPending || !formData.title || formData.points_reward <= 0}
                className="rounded-xl font-black uppercase tracking-widest text-xs"
              >
                {upsertTaskMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                {editingTask ? "Update Task" : "Create Task"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6">Task</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6 text-center">Reward</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6 text-center">Category</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6 text-center">Status</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground font-medium">
                  No tasks created yet.
                </TableCell>
              </TableRow>
            ) : (
              tasks?.map((task: any) => (
                <TableRow key={task.id} className="border-border/40 hover:bg-accent/5 transition-colors">
                  <TableCell className="px-6 py-4">
                    <div className="font-bold">{task.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">{task.description}</div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <Badge variant="outline" className="font-bold text-primary border-primary/20 bg-primary/5">
                      +{task.points_reward} pts
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <Badge variant="secondary" className="font-bold uppercase text-[10px] px-2 py-0.5 rounded-lg">
                      {task.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <Badge 
                      className={cn(
                        "font-black uppercase text-[10px] tracking-wider px-2 py-0.5",
                        task.is_active ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"
                      )}
                    >
                      {task.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                        onClick={() => handleEdit(task)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/5"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this task?")) {
                            deleteTaskMutation.mutate(task.id);
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
