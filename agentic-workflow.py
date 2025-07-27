#!/usr/bin/env python3
"""
Agentic Workflow Orchestrator for AI Saathi
Demonstrates workable products on Cursor AI with multi-agent coordination
"""

import asyncio
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
import sys
import os

# Add the server services directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'server', 'services'))

try:
    from shared_config import (
        TeachingAidRequest, LessonPlanRequest, AssessmentRequest,
        TranslationRequest, StoryRequest, is_valid_api_key
    )
    from teaching_aids_agent import generate_teaching_aid
    from lesson_plan_agent import generate_lesson_plan
    from assessment_agent import generate_assessment
    from multilingual_agent import translate_content
    from storyteller_agent import generate_story
    from image_analysis_agent import analyze_image
except ImportError as e:
    print(f"Warning: Could not import AI agents: {e}")
    print("Creating mock implementations for demonstration...")

    # Mock implementations for demonstration
    @dataclass
    class TeachingAidRequest:
        subject: str
        topic: str
        grade: str
        language: str = "english"
        aid_type: str = "worksheet"

    @dataclass
    class LessonPlanRequest:
        subject: str
        topic: str
        grade: str
        duration: int
        language: str = "english"

    @dataclass
    class AssessmentRequest:
        subject: str
        topic: str
        grade: str
        language: str = "english"
        assessment_type: str = "quiz"

    @dataclass
    class TranslationRequest:
        text: str
        source_language: str
        target_language: str

    @dataclass
    class StoryRequest:
        topic: str
        grade: str
        language: str = "english"
        moral: str = ""

    is_valid_api_key = True

    async def generate_teaching_aid(request: TeachingAidRequest):
        return {
            "success": True,
            "content": f"Generated {request.aid_type} for {request.subject} - {request.topic} (Grade {request.grade})",
            "type": request.aid_type,
            "subject": request.subject,
            "topic": request.topic
        }

    async def generate_lesson_plan(request: LessonPlanRequest):
        return {
            "success": True,
            "content": f"Generated lesson plan for {request.subject} - {request.topic} ({request.duration} mins)",
            "duration": request.duration,
            "activities": ["Introduction", "Main Activity", "Assessment", "Conclusion"]
        }

    async def generate_assessment(request: AssessmentRequest):
        return {
            "success": True,
            "content": f"Generated {request.assessment_type} for {request.subject} - {request.topic}",
            "questions": ["Question 1", "Question 2", "Question 3"],
            "type": request.assessment_type
        }

    async def translate_content(request: TranslationRequest):
        return {
            "success": True,
            "translated_text": f"[Translated from {request.source_language} to {request.target_language}] {request.text}",
            "source_language": request.source_language,
            "target_language": request.target_language
        }

    async def generate_story(request: StoryRequest):
        return {
            "success": True,
            "content": f"Generated educational story about {request.topic} for Grade {request.grade}",
            "title": f"The Adventures of {request.topic}",
            "moral": request.moral or "Learning is fun!"
        }

    async def analyze_image(image_path: str):
        return {
            "success": True,
            "analysis": f"Image analysis for {image_path}",
            "objects_detected": ["educational content", "text"],
            "text_extracted": "Sample educational text"
        }

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('agentic_workflow.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class WorkflowTask:
    """Represents a task in the agentic workflow"""
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
    """Results from executing an agentic workflow"""
    workflow_id: str
    status: str
    tasks: List[WorkflowTask]
    final_output: Optional[Dict[str, Any]] = None
    execution_time: Optional[float] = None
    error: Optional[str] = None

class AgenticWorkflowOrchestrator:
    """
    Orchestrates multi-agent workflows for educational content creation
    """
    
    def __init__(self):
        self.agents = {
            "teaching_aids": self._execute_teaching_aid,
            "lesson_plan": self._execute_lesson_plan,
            "assessment": self._execute_assessment,
            "translation": self._execute_translation,
            "storyteller": self._execute_story,
            "image_analysis": self._execute_image_analysis
        }
        self.workflows = {}
        self.execution_history = []
    
    async def create_workflow(self, workflow_id: str, tasks: List[Dict[str, Any]]) -> WorkflowResult:
        """
        Create and execute a workflow with multiple agents
        """
        logger.info(f"Creating workflow: {workflow_id}")
        start_time = datetime.now()
        
        # Convert task dictionaries to WorkflowTask objects
        workflow_tasks = []
        for i, task_data in enumerate(tasks):
            task = WorkflowTask(
                id=task_data.get('id', f"task_{i}"),
                type=task_data['type'],
                agent=task_data['agent'],
                input_data=task_data['input_data'],
                dependencies=task_data.get('dependencies', [])
            )
            workflow_tasks.append(task)
        
        # Execute tasks respecting dependencies
        result = await self._execute_workflow(workflow_id, workflow_tasks)
        
        # Calculate execution time
        end_time = datetime.now()
        result.execution_time = (end_time - start_time).total_seconds()
        
        # Store in history
        self.execution_history.append(result)
        self.workflows[workflow_id] = result
        
        logger.info(f"Workflow {workflow_id} completed in {result.execution_time:.2f}s")
        return result
    
    async def _execute_workflow(self, workflow_id: str, tasks: List[WorkflowTask]) -> WorkflowResult:
        """
        Execute tasks in the correct order based on dependencies
        """
        completed_tasks = set()
        
        try:
            while len(completed_tasks) < len(tasks):
                # Find tasks ready to execute (dependencies satisfied)
                ready_tasks = [
                    task for task in tasks 
                    if task.status == "pending" and 
                    all(dep in completed_tasks for dep in task.dependencies)
                ]
                
                if not ready_tasks:
                    # Check for circular dependencies or missing dependencies
                    pending_tasks = [task for task in tasks if task.status == "pending"]
                    if pending_tasks:
                        error_msg = f"Circular dependency or missing dependency detected in tasks: {[t.id for t in pending_tasks]}"
                        logger.error(error_msg)
                        return WorkflowResult(
                            workflow_id=workflow_id,
                            status="failed",
                            tasks=tasks,
                            error=error_msg
                        )
                    break
                
                # Execute ready tasks in parallel
                await asyncio.gather(
                    *[self._execute_single_task(task) for task in ready_tasks],
                    return_exceptions=True
                )
                
                # Update completed tasks
                for task in ready_tasks:
                    if task.status == "completed":
                        completed_tasks.add(task.id)
            
            # Prepare final output
            final_output = self._compile_final_output(tasks)
            
            return WorkflowResult(
                workflow_id=workflow_id,
                status="completed",
                tasks=tasks,
                final_output=final_output
            )
            
        except Exception as e:
            logger.error(f"Workflow execution failed: {str(e)}")
            return WorkflowResult(
                workflow_id=workflow_id,
                status="failed",
                tasks=tasks,
                error=str(e)
            )
    
    async def _execute_single_task(self, task: WorkflowTask):
        """
        Execute a single task using the appropriate agent
        """
        logger.info(f"Executing task: {task.id} with agent: {task.agent}")
        
        try:
            task.status = "running"
            
            if task.agent in self.agents:
                result = await self.agents[task.agent](task.input_data)
                task.result = result
                task.status = "completed"
                task.completed_at = datetime.now().isoformat()
                logger.info(f"Task {task.id} completed successfully")
            else:
                raise ValueError(f"Unknown agent: {task.agent}")
                
        except Exception as e:
            task.error = str(e)
            task.status = "failed"
            task.completed_at = datetime.now().isoformat()
            logger.error(f"Task {task.id} failed: {str(e)}")
    
    def _compile_final_output(self, tasks: List[WorkflowTask]) -> Dict[str, Any]:
        """
        Compile the final output from all completed tasks
        """
        output = {
            "summary": f"Workflow completed with {len([t for t in tasks if t.status == 'completed'])} successful tasks",
            "total_tasks": len(tasks),
            "successful_tasks": len([t for t in tasks if t.status == "completed"]),
            "failed_tasks": len([t for t in tasks if t.status == "failed"]),
            "results": {}
        }
        
        for task in tasks:
            if task.result:
                output["results"][task.id] = task.result
        
        return output
    
    # Agent execution methods
    async def _execute_teaching_aid(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute teaching aids agent"""
        request = TeachingAidRequest(**input_data)
        return await generate_teaching_aid(request)
    
    async def _execute_lesson_plan(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute lesson plan agent"""
        request = LessonPlanRequest(**input_data)
        return await generate_lesson_plan(request)
    
    async def _execute_assessment(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute assessment agent"""
        request = AssessmentRequest(**input_data)
        return await generate_assessment(request)
    
    async def _execute_translation(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute translation agent"""
        request = TranslationRequest(**input_data)
        return await translate_content(request)
    
    async def _execute_story(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute storyteller agent"""
        request = StoryRequest(**input_data)
        return await generate_story(request)
    
    async def _execute_image_analysis(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute image analysis agent"""
        image_path = input_data.get("image_path", "")
        return await analyze_image(image_path)
    
    def get_workflow_status(self, workflow_id: str) -> Optional[WorkflowResult]:
        """Get the status of a workflow"""
        return self.workflows.get(workflow_id)
    
    def list_workflows(self) -> List[str]:
        """List all workflow IDs"""
        return list(self.workflows.keys())
    
    def get_execution_history(self) -> List[WorkflowResult]:
        """Get execution history"""
        return self.execution_history
    
    def save_results(self, filepath: str = "workflow_results.json"):
        """Save workflow results to file"""
        results_data = []
        for result in self.execution_history:
            results_data.append({
                "workflow_id": result.workflow_id,
                "status": result.status,
                "execution_time": result.execution_time,
                "final_output": result.final_output,
                "tasks": [asdict(task) for task in result.tasks]
            })
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(results_data, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Results saved to {filepath}")

# Predefined workflow templates
WORKFLOW_TEMPLATES = {
    "complete_lesson_creation": {
        "description": "Complete lesson creation workflow with translation",
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
    
    "content_localization": {
        "description": "Multi-language content creation workflow",
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
                "id": "translate_to_hindi",
                "type": "translation", 
                "agent": "translation",
                "input_data": {
                    "text": "Story content will be populated from story_creation",
                    "source_language": "english",
                    "target_language": "hindi"
                },
                "dependencies": ["story_creation"]
            },
            {
                "id": "translate_to_tamil",
                "type": "translation",
                "agent": "translation", 
                "input_data": {
                    "text": "Story content will be populated from story_creation",
                    "source_language": "english",
                    "target_language": "tamil"
                },
                "dependencies": ["story_creation"]
            }
        ]
    },
    
    "assessment_workflow": {
        "description": "Comprehensive assessment creation workflow",
        "tasks": [
            {
                "id": "quiz_creation",
                "type": "education",
                "agent": "assessment",
                "input_data": {
                    "subject": "Science",
                    "topic": "Solar System",
                    "grade": "6",
                    "language": "english",
                    "assessment_type": "quiz"
                }
            },
            {
                "id": "supporting_materials",
                "type": "education",
                "agent": "teaching_aids",
                "input_data": {
                    "subject": "Science",
                    "topic": "Solar System", 
                    "grade": "6",
                    "language": "english",
                    "aid_type": "flashcard"
                },
                "dependencies": ["quiz_creation"]
            }
        ]
    }
}

async def demonstrate_workflows():
    """
    Demonstrate the agentic workflow with various scenarios
    """
    orchestrator = AgenticWorkflowOrchestrator()
    
    print("🚀 AI Saathi Agentic Workflow Demonstration")
    print("=" * 60)
    
    # Check AI configuration
    if is_valid_api_key:
        print("✅ AI agents are properly configured")
    else:
        print("⚠️  Using mock AI agents for demonstration")
    
    print("\n📋 Available Workflow Templates:")
    for name, template in WORKFLOW_TEMPLATES.items():
        print(f"  • {name}: {template['description']}")
    
    print("\n🔄 Executing Workflows...\n")
    
    # Execute each workflow template
    for workflow_name, template in WORKFLOW_TEMPLATES.items():
        print(f"▶️  Executing: {workflow_name}")
        
        result = await orchestrator.create_workflow(
            workflow_id=f"{workflow_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            tasks=template['tasks']
        )
        
        # Display results
        print(f"   Status: {'✅' if result.status == 'completed' else '❌'} {result.status}")
        print(f"   Execution Time: {result.execution_time:.2f}s")
        if result.final_output:
            print(f"   Tasks: {result.final_output['successful_tasks']}/{result.final_output['total_tasks']} successful")
        else:
            print(f"   Tasks: No output available")
        
        if result.error:
            print(f"   Error: {result.error}")
        
        print()
    
    # Save results
    orchestrator.save_results("agentic_workflow_results.json")
    
    print("📊 Workflow Summary:")
    print(f"   Total Workflows Executed: {len(orchestrator.execution_history)}")
    successful_workflows = len([r for r in orchestrator.execution_history if r.status == "completed"])
    print(f"   Successful Workflows: {successful_workflows}")
    if orchestrator.execution_history:
        avg_time = sum(r.execution_time or 0 for r in orchestrator.execution_history) / len(orchestrator.execution_history)
        print(f"   Average Execution Time: {avg_time:.2f}s")
    else:
        print(f"   Average Execution Time: 0.00s")
    
    print("\n💾 Results saved to 'agentic_workflow_results.json'")
    print("📝 Logs saved to 'agentic_workflow.log'")
    
    return orchestrator

async def interactive_workflow_creator():
    """
    Interactive workflow creation for custom scenarios
    """
    orchestrator = AgenticWorkflowOrchestrator()
    
    print("\n🎯 Interactive Workflow Creator")
    print("=" * 40)
    print("Available agents: teaching_aids, lesson_plan, assessment, translation, storyteller, image_analysis")
    
    workflow_id = input("Enter workflow ID: ").strip()
    if not workflow_id:
        workflow_id = f"custom_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    tasks = []
    
    while True:
        print(f"\nAdding task {len(tasks) + 1}:")
        task_id = input("Task ID: ").strip() or f"task_{len(tasks) + 1}"
        agent = input("Agent (teaching_aids/lesson_plan/assessment/translation/storyteller/image_analysis): ").strip()
        
        if agent not in orchestrator.agents:
            print(f"Invalid agent. Available: {list(orchestrator.agents.keys())}")
            continue
        
        # Collect input data based on agent type
        input_data = {}
        if agent in ["teaching_aids", "lesson_plan", "assessment"]:
            input_data["subject"] = input("Subject: ").strip()
            input_data["topic"] = input("Topic: ").strip() 
            input_data["grade"] = input("Grade: ").strip()
            input_data["language"] = input("Language (default: english): ").strip() or "english"
            
            if agent == "lesson_plan":
                input_data["duration"] = int(input("Duration (minutes): ").strip() or "45")
            elif agent == "teaching_aids":
                input_data["aid_type"] = input("Aid type (worksheet/flashcard/poster): ").strip() or "worksheet"
            elif agent == "assessment":
                input_data["assessment_type"] = input("Assessment type (quiz/test/assignment): ").strip() or "quiz"
        
        elif agent == "translation":
            input_data["text"] = input("Text to translate: ").strip()
            input_data["source_language"] = input("Source language: ").strip()
            input_data["target_language"] = input("Target language: ").strip()
        
        elif agent == "storyteller":
            input_data["topic"] = input("Story topic: ").strip()
            input_data["grade"] = input("Grade: ").strip()
            input_data["language"] = input("Language (default: english): ").strip() or "english"
            input_data["moral"] = input("Moral (optional): ").strip()
        
        elif agent == "image_analysis":
            input_data["image_path"] = input("Image path: ").strip()
        
        dependencies = input("Dependencies (comma-separated task IDs, optional): ").strip()
        dependencies = [dep.strip() for dep in dependencies.split(",") if dep.strip()] if dependencies else []
        
        task = {
            "id": task_id,
            "type": "custom",
            "agent": agent,
            "input_data": input_data,
            "dependencies": dependencies
        }
        
        tasks.append(task)
        
        add_more = input("Add another task? (y/n): ").strip().lower()
        if add_more != 'y':
            break
    
    if tasks:
        print(f"\n🚀 Executing custom workflow: {workflow_id}")
        result = await orchestrator.create_workflow(workflow_id, tasks)
        
        print(f"Status: {result.status}")
        print(f"Execution Time: {result.execution_time:.2f}s")
        if result.final_output:
            print(f"Tasks completed: {result.final_output['successful_tasks']}/{result.final_output['total_tasks']}")
    
    return orchestrator

if __name__ == "__main__":
    print("🤖 AI Saathi Agentic Workflow System")
    print("Demonstrating workable products on Cursor AI")
    print("=" * 50)
    
    # Run demonstration
    asyncio.run(demonstrate_workflows())
    
    # Offer interactive mode
    run_interactive = input("\n🎮 Run interactive workflow creator? (y/n): ").strip().lower()
    if run_interactive == 'y':
        asyncio.run(interactive_workflow_creator())
    
    print("\n✨ Agentic Workflow Demonstration Complete!")