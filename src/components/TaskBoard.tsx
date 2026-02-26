import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Plus, Loader2, CheckSquare, LogOut, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';

type TaskStatus = 'todo' | 'in_progress' | 'done';

interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  created_at: string;
}

const STATUS_CONFIG: Record<TaskStatus, { label: string; className: string }> = {
  todo: { label: 'Todo', className: 'status-todo' },
  in_progress: { label: 'In Progress', className: 'status-in-progress' },
  done: { label: 'Done', className: 'status-done' },
};

const STATUS_ORDER: TaskStatus[] = ['todo', 'in_progress', 'done'];

const nextStatus = (current: TaskStatus): TaskStatus => {
  const idx = STATUS_ORDER.indexOf(current);
  return STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
};

export default function TaskBoard() {
  const { user, signOut } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load tasks');
    } else {
      setTasks(data as Task[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title || !user) return;
    if (title.length > 200) {
      toast.error('Title must be under 200 characters');
      return;
    }

    setCreating(true);
    const { error } = await supabase
      .from('tasks')
      .insert({ title, user_id: user.id, status: 'todo' });

    if (error) {
      toast.error('Failed to create task');
    } else {
      setNewTitle('');
      await fetchTasks();
    }
    setCreating(false);
  };

  const updateStatus = async (taskId: string, status: TaskStatus) => {
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));

    const { error } = await supabase
      .from('tasks')
      .update({ status })
      .eq('id', taskId);

    if (error) {
      toast.error('Failed to update status');
      await fetchTasks();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <CheckSquare className="h-4 w-4" />
            </div>
            <h1 className="text-lg font-semibold">Task Board</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-2xl px-4 py-8">
        {/* Create Task */}
        <form onSubmit={createTask} className="mb-8 flex gap-2">
          <Input
            placeholder="What needs to be done?"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            maxLength={200}
            className="flex-1"
          />
          <Button type="submit" disabled={creating || !newTitle.trim()}>
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            <span className="ml-1 hidden sm:inline">Add</span>
          </Button>
        </form>

        {/* Task List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <ClipboardList className="mb-3 h-10 w-10 opacity-40" />
            <p className="text-sm">No tasks yet. Create one above!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => {
              const config = STATUS_CONFIG[task.status];
              const next = nextStatus(task.status);
              return (
                <Card
                  key={task.id}
                  className="flex items-center justify-between gap-3 border-border p-4 transition-colors hover:bg-muted/50"
                >
                  <span className={`flex-1 text-sm ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                    {task.title}
                  </span>
                  <button
                    onClick={() => updateStatus(task.id, next)}
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${config.className} hover:opacity-80`}
                    title={`Move to ${STATUS_CONFIG[next].label}`}
                  >
                    {config.label}
                  </button>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
