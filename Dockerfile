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
ENV HOST=0.0.0.0
ENV PORT=5001

# Run the application with explicit host and port binding
CMD ["python", "app.py"]
