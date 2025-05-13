FROM python:3.9-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Make port 5001 available
EXPOSE 5001

# Set environment variables
ENV FLASK_APP=app.py
ENV FLASK_ENV=production

# Run the application with explicit host and port binding
CMD ["python", "-c", "import os; from app import app; app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5001)), debug=False)"]
