#!/usr/bin/env python3
"""
FastAPI backend for Agentic Workflow Orchestrator
Serves as the Python microservice for workflow execution
"""

import asyncio
import json
import logging
import os
import sys
from datetime import datetime
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Add the server services directory to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
services_dir = os.path.join(current_dir, 'services')
sys.path.append(services_dir)

# Import the agentic workflow orchestrator
try:
    # Import from the main agentic workflow file
    sys.path.append(os.path.dirname(current_dir))
    from agentic_workflow import AgenticWorkflowOrchestrator, WorkflowTask, WorkflowResult
except ImportError:
    # Create a simplified version if the main file is not available
    from dataclasses import dataclass
    from typing import Dict, List, Any, Optional
    
    @dataclass
    class WorkflowTask:
        id: str
        type: str
        agent: str
        input_data: Dict[str, Any]
        dependencies: List[str] = None
        status: str = "pending"
        result: Optional[Dict[str, Any]] = None
        error: Optional[str] = None
        created_at: str = None
        completed_at: Optional[str] = None

        def __post_init__(self):
            if self.dependencies is None:
                self.dependencies = []
            if self.created_at is None:
                self.created_at = datetime.now().isoformat()

    @dataclass
    class WorkflowResult:
        workflow_id: str
        status: str
        tasks: List[WorkflowTask]
        final_output: Optional[Dict[str, Any]] = None
        execution_time: Optional[float] = None
        error: Optional[str] = None

    class AgenticWorkflowOrchestrator:
        def __init__(self):
            self.workflows = {}
            self.execution_history = []
        
        async def create_workflow(self, workflow_id: str, tasks: List[Dict[str, Any]]) -> WorkflowResult:
            # Mock implementation for demonstration
            start_time = datetime.now()
            
            workflow_tasks = []
            for i, task_data in enumerate(tasks):
                task = WorkflowTask(
                    id=task_data.get('id', f"task_{i}"),
                    type=task_data.get('type', 'unknown'),
                    agent=task_data.get('agent', 'unknown'),
                    input_data=task_data.get('input_data', {}),
                    dependencies=task_data.get('dependencies', [])
                )
                # Simulate task execution
                task.status = "completed"
                task.result = {
                    "success": True,
                    "content": f"Mock result for {task.agent} - {task.id}",
                    "agent": task.agent
                }
                task.completed_at = datetime.now().isoformat()
                workflow_tasks.append(task)
            
            end_time = datetime.now()
            execution_time = (end_time - start_time).total_seconds()
            
            final_output = {
                "summary": f"Workflow completed successfully with {len(workflow_tasks)} tasks",
                "total_tasks": len(workflow_tasks),
                "successful_tasks": len([t for t in workflow_tasks if t.status == "completed"]),
                "failed_tasks": len([t for t in workflow_tasks if t.status == "failed"]),
                "results": {task.id: task.result for task in workflow_tasks if task.result}
            }
            
            result = WorkflowResult(
                workflow_id=workflow_id,
                status="completed",
                tasks=workflow_tasks,
                final_output=final_output,
                execution_time=execution_time
            )
            
            self.workflows[workflow_id] = result
            self.execution_history.append(result)
            
            return result

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Pydantic models for API
class TaskInput(BaseModel):
    id: str
    type: str = "custom"
    agent: str
    input_data: Dict[str, Any]
    dependencies: List[str] = []

class WorkflowInput(BaseModel):
    workflow_id: str
    tasks: List[TaskInput]

class WorkflowStatusResponse(BaseModel):
    workflow_id: str
    status: str
    tasks: List[Dict[str, Any]]
    final_output: Optional[Dict[str, Any]] = None
    execution_time: Optional[float] = None
    error: Optional[str] = None

# FastAPI app
app = FastAPI(
    title="AI Saathi Agentic Workflow API",
    description="Backend API for orchestrating educational AI agent workflows",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global orchestrator instance
orchestrator = AgenticWorkflowOrchestrator()

@app.get("/")
async def root():
    return {
        "message": "AI Saathi Agentic Workflow API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "agentic-workflow-api",
        "total_workflows": len(orchestrator.execution_history),
        "active_workflows": len([w for w in orchestrator.workflows.values() if w.status == "running"])
    }

@app.post("/api/agentic-workflow/execute", response_model=WorkflowStatusResponse)
async def execute_workflow(workflow_input: WorkflowInput, background_tasks: BackgroundTasks):
    """
    Execute an agentic workflow with multiple tasks
    """
    try:
        logger.info(f"Executing workflow: {workflow_input.workflow_id}")
        
        # Convert Pydantic models to dictionaries
        tasks_data = []
        for task in workflow_input.tasks:
            tasks_data.append({
                "id": task.id,
                "type": task.type,
                "agent": task.agent,
                "input_data": task.input_data,
                "dependencies": task.dependencies
            })
        
        # Execute workflow
        result = await orchestrator.create_workflow(
            workflow_id=workflow_input.workflow_id,
            tasks=tasks_data
        )
        
        # Convert WorkflowResult to response format
        response = WorkflowStatusResponse(
            workflow_id=result.workflow_id,
            status=result.status,
            tasks=[asdict(task) for task in result.tasks],
            final_output=result.final_output,
            execution_time=result.execution_time,
            error=result.error
        )
        
        logger.info(f"Workflow {workflow_input.workflow_id} completed successfully")
        return response
        
    except Exception as e:
        logger.error(f"Workflow execution failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Workflow execution failed: {str(e)}")

@app.get("/api/agentic-workflow/status/{workflow_id}", response_model=WorkflowStatusResponse)
async def get_workflow_status(workflow_id: str):
    """
    Get the status of a specific workflow
    """
    result = orchestrator.get_workflow_status(workflow_id)
    if not result:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    return WorkflowStatusResponse(
        workflow_id=result.workflow_id,
        status=result.status,
        tasks=[asdict(task) for task in result.tasks],
        final_output=result.final_output,
        execution_time=result.execution_time,
        error=result.error
    )

@app.get("/api/agentic-workflow/list")
async def list_workflows():
    """
    List all workflow IDs and their status
    """
    workflows = []
    for workflow_id in orchestrator.list_workflows():
        result = orchestrator.get_workflow_status(workflow_id)
        if result:
            workflows.append({
                "workflow_id": workflow_id,
                "status": result.status,
                "execution_time": result.execution_time,
                "total_tasks": result.final_output.get('total_tasks', 0) if result.final_output else 0,
                "successful_tasks": result.final_output.get('successful_tasks', 0) if result.final_output else 0
            })
    
    return {"workflows": workflows, "total": len(workflows)}

@app.get("/api/agentic-workflow/history")
async def get_execution_history():
    """
    Get workflow execution history
    """
    history = []
    for result in orchestrator.get_execution_history():
        history.append({
            "workflow_id": result.workflow_id,
            "status": result.status,
            "execution_time": result.execution_time,
            "final_output": result.final_output,
            "created_at": result.tasks[0].created_at if result.tasks else datetime.now().isoformat()
        })
    
    return {"history": history, "total": len(history)}

@app.post("/api/agentic-workflow/templates/execute/{template_name}")
async def execute_template(template_name: str):
    """
    Execute a predefined workflow template
    """
    templates = {
        "complete_lesson": {
            "workflow_id": f"complete_lesson_{int(datetime.now().timestamp())}",
            "tasks": [
                {
                    "id": "lesson_plan",
                    "type": "education",
                    "agent": "lesson_plan",
                    "input_data": {
                        "subject": "Mathematics",
                        "topic": "Fractions",
                        "grade": "5",
                        "duration": 45,
                        "language": "english"
                    }
                },
                {
                    "id": "teaching_materials",
                    "type": "education",
                    "agent": "teaching_aids",
                    "input_data": {
                        "subject": "Mathematics",
                        "topic": "Fractions",
                        "grade": "5",
                        "language": "english",
                        "aid_type": "worksheet"
                    },
                    "dependencies": ["lesson_plan"]
                },
                {
                    "id": "assessment",
                    "type": "education",
                    "agent": "assessment",
                    "input_data": {
                        "subject": "Mathematics",
                        "topic": "Fractions",
                        "grade": "5",
                        "language": "english",
                        "assessment_type": "quiz"
                    },
                    "dependencies": ["lesson_plan"]
                }
            ]
        },
        "multilingual_content": {
            "workflow_id": f"multilingual_{int(datetime.now().timestamp())}",
            "tasks": [
                {
                    "id": "story_creation",
                    "type": "education",
                    "agent": "storyteller",
                    "input_data": {
                        "topic": "Environmental Conservation",
                        "grade": "4",
                        "language": "english",
                        "moral": "Protect our environment"
                    }
                },
                {
                    "id": "translate_hindi",
                    "type": "translation",
                    "agent": "translation",
                    "input_data": {
                        "text": "Story content",
                        "source_language": "english",
                        "target_language": "hindi"
                    },
                    "dependencies": ["story_creation"]
                }
            ]
        }
    }
    
    if template_name not in templates:
        raise HTTPException(status_code=404, detail="Template not found")
    
    template = templates[template_name]
    workflow_input = WorkflowInput(**template)
    
    return await execute_workflow(workflow_input, BackgroundTasks())

@app.get("/api/agentic-workflow/agents")
async def get_available_agents():
    """
    Get information about available agents
    """
    agents = {
        "teaching_aids": {
            "name": "Teaching Aids Agent",
            "description": "Generate worksheets, flashcards, and educational materials",
            "inputs": ["subject", "topic", "grade", "language", "aid_type"]
        },
        "lesson_plan": {
            "name": "Lesson Plan Agent",
            "description": "Create detailed lesson plans with activities",
            "inputs": ["subject", "topic", "grade", "duration", "language"]
        },
        "assessment": {
            "name": "Assessment Agent",
            "description": "Generate quizzes, tests, and assignments",
            "inputs": ["subject", "topic", "grade", "language", "assessment_type"]
        },
        "translation": {
            "name": "Translation Agent",
            "description": "Translate content between languages",
            "inputs": ["text", "source_language", "target_language"]
        },
        "storyteller": {
            "name": "Storyteller Agent",
            "description": "Create educational stories with moral lessons",
            "inputs": ["topic", "grade", "language", "moral"]
        },
        "image_analysis": {
            "name": "Image Analysis Agent",
            "description": "Analyze educational images and extract content",
            "inputs": ["image_path"]
        }
    }
    
    return {"agents": agents, "total": len(agents)}

if __name__ == "__main__":
    print("🚀 Starting AI Saathi Agentic Workflow API Server")
    print("API Documentation: http://localhost:8001/docs")
    print("Health Check: http://localhost:8001/health")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8001,
        log_level="info"
    )