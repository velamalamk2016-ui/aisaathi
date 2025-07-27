import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Play, Plus, Trash2, CheckCircle, XCircle, Clock, Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface WorkflowTask {
  id: string;
  type: string;
  agent: string;
  input_data: Record<string, any>;
  dependencies: string[];
  status: "pending" | "running" | "completed" | "failed";
  result?: Record<string, any>;
  error?: string;
  created_at: string;
  completed_at?: string;
}

interface WorkflowResult {
  workflow_id: string;
  status: "pending" | "running" | "completed" | "failed";
  tasks: WorkflowTask[];
  final_output?: {
    summary: string;
    total_tasks: number;
    successful_tasks: number;
    failed_tasks: number;
    results: Record<string, any>;
  };
  execution_time?: number;
  error?: string;
}

const AGENTS = {
  teaching_aids: {
    name: "Teaching Aids Agent",
    description: "Generate worksheets, flashcards, and educational materials",
    icon: "📚",
    inputs: ["subject", "topic", "grade", "language", "aid_type"]
  },
  lesson_plan: {
    name: "Lesson Plan Agent", 
    description: "Create detailed lesson plans with activities",
    icon: "📝",
    inputs: ["subject", "topic", "grade", "duration", "language"]
  },
  assessment: {
    name: "Assessment Agent",
    description: "Generate quizzes, tests, and assignments",
    icon: "📊",
    inputs: ["subject", "topic", "grade", "language", "assessment_type"]
  },
  translation: {
    name: "Translation Agent",
    description: "Translate content between languages",
    icon: "🌐",
    inputs: ["text", "source_language", "target_language"]
  },
  storyteller: {
    name: "Storyteller Agent",
    description: "Create educational stories with moral lessons",
    icon: "📖",
    inputs: ["topic", "grade", "language", "moral"]
  },
  image_analysis: {
    name: "Image Analysis Agent",
    description: "Analyze educational images and extract content",
    icon: "🖼️",
    inputs: ["image_path"]
  }
};

const WORKFLOW_TEMPLATES = {
  complete_lesson: {
    name: "Complete Lesson Creation",
    description: "Create a full lesson with materials and assessment",
    tasks: [
      {
        id: "lesson_plan",
        agent: "lesson_plan",
        input_data: {
          subject: "Mathematics",
          topic: "Fractions",
          grade: "5",
          duration: 45,
          language: "english"
        }
      },
      {
        id: "teaching_materials",
        agent: "teaching_aids",
        input_data: {
          subject: "Mathematics",
          topic: "Fractions",
          grade: "5",
          language: "english",
          aid_type: "worksheet"
        },
        dependencies: ["lesson_plan"]
      },
      {
        id: "assessment",
        agent: "assessment",
        input_data: {
          subject: "Mathematics",
          topic: "Fractions",
          grade: "5",
          language: "english",
          assessment_type: "quiz"
        },
        dependencies: ["lesson_plan"]
      }
    ]
  },
  multilingual_content: {
    name: "Multilingual Content Creation",
    description: "Create content in multiple languages",
    tasks: [
      {
        id: "story_creation",
        agent: "storyteller",
        input_data: {
          topic: "Environmental Conservation",
          grade: "4",
          language: "english",
          moral: "Protect our environment"
        }
      },
      {
        id: "translate_hindi",
        agent: "translation",
        input_data: {
          text: "Story content",
          source_language: "english",
          target_language: "hindi"
        },
        dependencies: ["story_creation"]
      },
      {
        id: "translate_tamil",
        agent: "translation",
        input_data: {
          text: "Story content",
          source_language: "english",
          target_language: "tamil"
        },
        dependencies: ["story_creation"]
      }
    ]
  }
};

export default function AgenticWorkflow() {
  const [workflows, setWorkflows] = useState<WorkflowResult[]>([]);
  const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({
    id: "",
    tasks: [] as any[]
  });
  const [newTask, setNewTask] = useState({
    id: "",
    agent: "",
    input_data: {} as Record<string, any>,
    dependencies: [] as string[]
  });

  const executeWorkflow = async (workflowData: any) => {
    setIsExecuting(true);
    try {
      const response = await fetch('/api/agentic-workflow/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workflowData),
      });

      if (!response.ok) {
        throw new Error('Failed to execute workflow');
      }

      const result: WorkflowResult = await response.json();
      setCurrentWorkflow(result);
      setWorkflows(prev => [result, ...prev]);

      toast({
        title: "Workflow Executed",
        description: `Workflow ${result.workflow_id} completed with ${result.final_output?.successful_tasks}/${result.final_output?.total_tasks} successful tasks`,
      });

    } catch (error) {
      console.error('Workflow execution failed:', error);
      toast({
        title: "Execution Failed",
        description: "Failed to execute workflow. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const executeTemplate = async (templateKey: string) => {
    const template = WORKFLOW_TEMPLATES[templateKey as keyof typeof WORKFLOW_TEMPLATES];
    if (!template) return;

    const workflowData = {
      workflow_id: `${templateKey}_${Date.now()}`,
      tasks: template.tasks
    };

    await executeWorkflow(workflowData);
  };

  const addTask = () => {
    if (!newTask.id || !newTask.agent) {
      toast({
        title: "Missing Information",
        description: "Please provide task ID and select an agent",
        variant: "destructive",
      });
      return;
    }

    const task = {
      id: newTask.id,
      type: "custom",
      agent: newTask.agent,
      input_data: { ...newTask.input_data },
      dependencies: [...newTask.dependencies]
    };

    setNewWorkflow(prev => ({
      ...prev,
      tasks: [...prev.tasks, task]
    }));

    // Reset form
    setNewTask({
      id: "",
      agent: "",
      input_data: {},
      dependencies: []
    });

    toast({
      title: "Task Added",
      description: `Task ${task.id} has been added to the workflow`,
    });
  };

  const removeTask = (taskId: string) => {
    setNewWorkflow(prev => ({
      ...prev,
      tasks: prev.tasks.filter(task => task.id !== taskId)
    }));
  };

  const executeCustomWorkflow = async () => {
    if (newWorkflow.tasks.length === 0) {
      toast({
        title: "No Tasks",
        description: "Please add at least one task to the workflow",
        variant: "destructive",
      });
      return;
    }

    const workflowData = {
      workflow_id: newWorkflow.id || `custom_${Date.now()}`,
      tasks: newWorkflow.tasks
    };

    await executeWorkflow(workflowData);

    // Reset form
    setNewWorkflow({
      id: "",
      tasks: []
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "running":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "running":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Zap className="h-6 w-6 text-blue-600" />
        <h1 className="text-3xl font-bold">Agentic Workflow Orchestrator</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Workflows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workflows.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Successful Workflows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {workflows.filter(w => w.status === "completed").length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Active Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {Object.keys(AGENTS).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">Quick Templates</TabsTrigger>
          <TabsTrigger value="custom">Custom Workflow</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="agents">Available Agents</TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Templates</CardTitle>
              <CardDescription>
                Pre-configured workflows for common educational tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(WORKFLOW_TEMPLATES).map(([key, template]) => (
                <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{template.name}</h3>
                    <p className="text-sm text-gray-600">{template.description}</p>
                    <div className="flex gap-1 mt-2">
                      {template.tasks.map((task, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {AGENTS[task.agent as keyof typeof AGENTS]?.icon} {task.agent}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    onClick={() => executeTemplate(key)}
                    disabled={isExecuting}
                    className="ml-4"
                  >
                    {isExecuting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                    Execute
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Custom Workflow</CardTitle>
                <CardDescription>
                  Build your own workflow by combining multiple agents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="workflowId">Workflow ID</Label>
                  <Input
                    id="workflowId"
                    value={newWorkflow.id}
                    onChange={(e) => setNewWorkflow(prev => ({ ...prev, id: e.target.value }))}
                    placeholder="Enter workflow ID"
                  />
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Add Task</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="taskId">Task ID</Label>
                      <Input
                        id="taskId"
                        value={newTask.id}
                        onChange={(e) => setNewTask(prev => ({ ...prev, id: e.target.value }))}
                        placeholder="task_1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="agent">Agent</Label>
                      <Select
                        value={newTask.agent}
                        onValueChange={(value) => setNewTask(prev => ({ ...prev, agent: value, input_data: {} }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an agent" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(AGENTS).map(([key, agent]) => (
                            <SelectItem key={key} value={key}>
                              {agent.icon} {agent.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {newTask.agent && (
                      <div className="space-y-2">
                        <Label>Agent Inputs</Label>
                        {AGENTS[newTask.agent as keyof typeof AGENTS]?.inputs.map((input) => (
                          <div key={input}>
                            <Label htmlFor={input} className="text-xs">
                              {input.replace('_', ' ').toUpperCase()}
                            </Label>
                            <Input
                              id={input}
                              value={newTask.input_data[input] || ""}
                              onChange={(e) => setNewTask(prev => ({
                                ...prev,
                                input_data: { ...prev.input_data, [input]: e.target.value }
                              }))}
                              placeholder={`Enter ${input}`}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <div>
                      <Label htmlFor="dependencies">Dependencies</Label>
                      <Input
                        id="dependencies"
                        value={newTask.dependencies.join(", ")}
                        onChange={(e) => setNewTask(prev => ({
                          ...prev,
                          dependencies: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                        }))}
                        placeholder="task_1, task_2"
                      />
                    </div>

                    <Button onClick={addTask} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Task
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Workflow Preview</CardTitle>
                <CardDescription>
                  Review your workflow before execution
                </CardDescription>
              </CardHeader>
              <CardContent>
                {newWorkflow.tasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No tasks added yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {newWorkflow.tasks.map((task, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="font-medium">{task.id}</div>
                          <div className="text-sm text-gray-600">
                            {AGENTS[task.agent as keyof typeof AGENTS]?.icon} {task.agent}
                          </div>
                          {task.dependencies.length > 0 && (
                            <div className="text-xs text-blue-600">
                              Depends on: {task.dependencies.join(", ")}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeTask(task.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    
                    <Button
                      onClick={executeCustomWorkflow}
                      disabled={isExecuting}
                      className="w-full mt-4"
                    >
                      {isExecuting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Play className="h-4 w-4 mr-2" />
                      )}
                      Execute Workflow
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Results</CardTitle>
              <CardDescription>
                View execution history and results
              </CardDescription>
            </CardHeader>
            <CardContent>
              {workflows.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No workflows executed yet
                </div>
              ) : (
                <div className="space-y-4">
                  {workflows.map((workflow, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(workflow.status)}
                          <span className="font-medium">{workflow.workflow_id}</span>
                          <Badge className={getStatusColor(workflow.status)}>
                            {workflow.status}
                          </Badge>
                        </div>
                        {workflow.execution_time && (
                          <span className="text-sm text-gray-500">
                            {workflow.execution_time.toFixed(2)}s
                          </span>
                        )}
                      </div>

                      {workflow.final_output && (
                        <div className="grid grid-cols-3 gap-4 mb-3">
                          <div className="text-center">
                            <div className="text-2xl font-bold">{workflow.final_output.total_tasks}</div>
                            <div className="text-sm text-gray-600">Total Tasks</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {workflow.final_output.successful_tasks}
                            </div>
                            <div className="text-sm text-gray-600">Successful</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">
                              {workflow.final_output.failed_tasks}
                            </div>
                            <div className="text-sm text-gray-600">Failed</div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        {workflow.tasks.map((task, taskIndex) => (
                          <div key={taskIndex} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(task.status)}
                              <span>{task.id}</span>
                              <Badge variant="outline" className="text-xs">
                                {AGENTS[task.agent as keyof typeof AGENTS]?.icon} {task.agent}
                              </Badge>
                            </div>
                            {task.error && (
                              <span className="text-red-500 text-xs">{task.error}</span>
                            )}
                          </div>
                        ))}
                      </div>

                      {workflow.final_output && (
                        <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                          <strong>Summary:</strong> {workflow.final_output.summary}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(AGENTS).map(([key, agent]) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">{agent.icon}</span>
                    {agent.name}
                  </CardTitle>
                  <CardDescription>{agent.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label className="text-sm font-medium">Required Inputs:</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {agent.inputs.map((input) => (
                        <Badge key={input} variant="outline" className="text-xs">
                          {input}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {currentWorkflow && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Last workflow "{currentWorkflow.workflow_id}" completed with {currentWorkflow.final_output?.successful_tasks}/{currentWorkflow.final_output?.total_tasks} successful tasks in {currentWorkflow.execution_time?.toFixed(2)}s
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}