#!/bin/zsh
# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip uninstall -y Flask Werkzeug Jinja2 itsdangerous click
pip install -r requirements.txt

# Run the application
echo "Starting application..."
python app.py

# Deactivate virtual environment when the app exits
deactivate
