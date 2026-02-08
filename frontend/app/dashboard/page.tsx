"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Plus, Calendar, CheckCircle2, Circle, Filter, BarChart3, Loader2 } from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { TaskForm } from "@/components/task-form";
import { TaskList } from "@/components/task-list";
import { api } from "@/lib/api";
import { ModeToggle } from "@/components/ui/mode-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Task } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const userId = session?.user?.id;

  useEffect(() => {
    if (sessionLoading) return;

    if (!session?.user) {
      router.push("/sign-in");
      return;
    }

    const fetchTasks = async () => {
      try {
        const fetchedTasks = await api.tasks.list(session.user.id);
        setTasks(fetchedTasks);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [session, sessionLoading, router]);

  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const activeTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const handleTaskCreated = (newTask: Task) => {
    setTasks((prev) => [newTask, ...prev]);
    setShowTaskForm(false);
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
  };

  const handleTaskDeleted = (taskId: number) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary p-2 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Todo App</h1>
            </div>
            
            {/* Stats Overview - Hidden on mobile */}
            <div className="hidden md:flex items-center gap-6 ml-8">
              <div className="flex items-center gap-2 text-sm">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Total: </span>
                <span className="font-medium">{totalTasks}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-muted-foreground">Completed: </span>
                <span className="font-medium">{completedTasks}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Circle className="h-4 w-4 text-yellow-500" />
                <span className="text-muted-foreground">Active: </span>
                <span className="font-medium">{activeTasks}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Completion: </span>
                <span className="font-medium">{completionRate}%</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <ModeToggle />
            {/* Profile Dropdown */}
            <div className="relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium uppercase">
                      {session.user.email.charAt(0)}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium text-foreground leading-none">
                        {session.user.name || session.user.email.split('@')[0]}
                      </p>
                      <p className="text-xs text-muted-foreground leading-none">
                        {session.user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card rounded-xl border p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Overview</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Total Tasks</span>
                  </div>
                  <span className="font-medium">{totalTasks}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-muted-foreground">Completed</span>
                  </div>
                  <span className="font-medium text-green-500">{completedTasks}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Circle className="h-4 w-4 text-yellow-500" />
                    <span className="text-muted-foreground">Active</span>
                  </div>
                  <span className="font-medium text-yellow-500">{activeTasks}</span>
                </div>
                
                <div className="pt-2">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Progress</span>
                    </div>
                    <span className="text-sm font-medium">{completionRate}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mt-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-500 ease-out" 
                      style={{ width: `${completionRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-xl border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Filters</h2>
              </div>
              
              <div className="space-y-2">
                <Button
                  variant={filter === 'all' ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setFilter('all')}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  All Tasks
                  <span className="ml-auto">{totalTasks}</span>
                </Button>
                
                <Button
                  variant={filter === 'active' ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setFilter('active')}
                >
                  <Circle className="mr-2 h-4 w-4 text-yellow-500" />
                  Active
                  <span className="ml-auto">{activeTasks}</span>
                </Button>
                
                <Button
                  variant={filter === 'completed' ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setFilter('completed')}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                  Completed
                  <span className="ml-auto">{completedTasks}</span>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Add Task Section */}
            <section className="bg-card rounded-xl border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Add New Task</h2>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowTaskForm(!showTaskForm)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {showTaskForm ? "Cancel" : "New Task"}
                </Button>
              </div>
              
              {showTaskForm && (
                <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                  {userId && (
                    <TaskForm 
                      userId={userId} 
                      onTaskCreated={handleTaskCreated}
                      onCancel={() => setShowTaskForm(false)}
                    />
                  )}
                </div>
              )}
            </section>

            {/* Task List Section */}
            <section className="bg-card rounded-xl border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">
                    Your Tasks
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      ({filteredTasks.length} {filter === 'all' ? 'total' : filter})
                    </span>
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <select 
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'completed')}
                    className="bg-background border rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : error ? (
                <div className="rounded-lg border bg-destructive/10 p-4 text-destructive">
                  {error}
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-foreground">No tasks</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {filter === 'completed' 
                      ? "You haven't completed any tasks yet." 
                      : filter === 'active' 
                        ? "All tasks are completed! Great job!" 
                        : "Get started by creating a new task."}
                  </p>
                  {filter === 'all' && (
                    <div className="mt-6">
                      <Button onClick={() => setShowTaskForm(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Task
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <TaskList
                  tasks={filteredTasks}
                  userId={userId || ""}
                  onTaskUpdated={handleTaskUpdated}
                  onTaskDeleted={handleTaskDeleted}
                />
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}