#!/usr/bin/env python3
"""
Quick test script for the agentic workflow system
"""
import asyncio
import requests
import json
import time

async def test_basic_workflow():
    print("🧪 Testing Basic Agentic Workflow")
    print("=" * 40)
    
    # Test simple workflow without dependencies
    workflow_data = {
        "workflow_id": "test_simple_workflow",
        "tasks": [
            {
                "id": "task1",
                "type": "education",
                "agent": "teaching_aids",
                "input_data": {
                    "subject": "Math",
                    "topic": "Addition",
                    "grade": "3",
                    "language": "english",
                    "aid_type": "worksheet"
                }
            }
        ]
    }
    
    try:
        # Test if API is available
        response = requests.get("http://localhost:8001/health", timeout=5)
        if response.status_code == 200:
            print("✅ Python API is running")
            
            # Execute workflow
            response = requests.post(
                "http://localhost:8001/api/agentic-workflow/execute",
                json=workflow_data,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Workflow executed successfully: {result['workflow_id']}")
                print(f"   Status: {result['status']}")
                print(f"   Execution time: {result['execution_time']:.3f}s")
                print(f"   Tasks completed: {len([t for t in result['tasks'] if t['status'] == 'completed'])}/{len(result['tasks'])}")
            else:
                print(f"❌ Workflow execution failed: {response.status_code}")
                print(f"   Response: {response.text}")
        else:
            print(f"❌ Python API health check failed: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Could not connect to Python API: {e}")
        print("   Make sure the Python API is running on port 8001")
    
    print("\n" + "=" * 40)

def test_workflow_templates():
    print("🧪 Testing Workflow Templates")
    print("=" * 40)
    
    templates = ["complete_lesson", "multilingual_content"]
    
    for template in templates:
        try:
            response = requests.post(
                f"http://localhost:8001/api/agentic-workflow/templates/execute/{template}",
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Template '{template}' executed successfully")
                print(f"   Workflow ID: {result['workflow_id']}")
                print(f"   Status: {result['status']}")
            else:
                print(f"❌ Template '{template}' failed: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Could not execute template '{template}': {e}")
    
    print("\n" + "=" * 40)

def test_agents_info():
    print("🧪 Testing Agents Information")
    print("=" * 40)
    
    try:
        response = requests.get("http://localhost:8001/api/agentic-workflow/agents", timeout=5)
        
        if response.status_code == 200:
            agents = response.json()
            print(f"✅ Retrieved {agents['total']} available agents:")
            for agent_id, agent_info in agents['agents'].items():
                print(f"   • {agent_id}: {agent_info['name']}")
        else:
            print(f"❌ Failed to get agents info: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Could not get agents info: {e}")
    
    print("\n" + "=" * 40)

if __name__ == "__main__":
    print("🚀 AI Saathi Agentic Workflow Test Suite")
    print("=" * 50)
    print()
    
    # Wait a moment for API to be ready if it was just started
    print("⏳ Waiting for API to be ready...")
    time.sleep(2)
    
    # Run tests
    asyncio.run(test_basic_workflow())
    test_agents_info()
    test_workflow_templates()
    
    print("✨ Test suite completed!")
    print("\n🎯 To use the full system:")
    print("   1. Run: ./start-agentic-workflow.sh")
    print("   2. Open: http://localhost:5000/agents/agentic-workflow")
    print("   3. Try the interactive workflow builder!")