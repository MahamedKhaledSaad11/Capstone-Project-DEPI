import os
import sys
import uvicorn

def deploy_api():
    """
    Deploys the EVGuard FastAPI backend server.
    This runs the API that serves the trained LightGBM model.
    """
    print("="*50)
    print("🚀 Starting EVGuard API Deployment Server")
    print("="*50)
    
    # Add the backend directory to Python path so 'app.main' can be resolved
    backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend'))
    if backend_path not in sys.path:
        sys.path.insert(0, backend_path)
        
    try:
        # Run the FastAPI server via Uvicorn programmatically
        uvicorn.run(
            "app.main:app", 
            host="0.0.0.0", 
            port=8000, 
            reload=False,
            log_level="info"
        )
    except ModuleNotFoundError:
        print("Error: Could not find the backend app. Ensure you have installed backend requirements.")
        print("Hint: pip install -r backend/requirements.txt")

if __name__ == "__main__":
    deploy_api()
