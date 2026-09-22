import os
import sys
import subprocess
import time
import webbrowser

def start_project():
    print("=" * 60)
    print(" 🌀 METEORA Satellite Cyclone Intelligence Platform Launcher")
    print("=" * 60)

    project_dir = os.path.dirname(os.path.abspath(__file__))
    frontend_dir = os.path.join(project_dir, "frontend_source")

    print("\n[1/2] Launching React Vite Frontend (Port 5173)...")
    if os.name == 'nt':
        frontend_proc = subprocess.Popen(
            ["cmd", "/c", "npm run dev"],
            cwd=frontend_dir,
            creationflags=subprocess.CREATE_NEW_CONSOLE
        )
    else:
        frontend_proc = subprocess.Popen(["npm", "run", "dev"], cwd=frontend_dir)

    time.sleep(2)

    print("\n[2/2] Opening Web Browser on http://localhost:5173/ ...")
    webbrowser.open("http://localhost:5173/")

    print("\n[3/3] Starting Django REST & ML Backend (Port 8000)...")
    print("-" * 60)
    print(" React Frontend:  http://localhost:5173/")
    print(" Django Backend:  http://127.0.0.1:8000/")
    print("-" * 60 + "\n")

    sys.stdout.flush()

    # Run Django backend in main process
    subprocess.run([sys.executable, "manage.py", "runserver", "0.0.0.0:8000"], cwd=project_dir)

if __name__ == "__main__":
    start_project()
