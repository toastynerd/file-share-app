from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import os
import uuid
import json
from datetime import datetime

app = Flask(__name__)
app.secret_key = os.urandom(24)

# Store active sessions
active_sessions = {}

@app.route('/')
def index():
    """Home page - entry point for the application"""
    return render_template('index.html')

@app.route('/create_session', methods=['POST'])
def create_session():
    """Create a new transfer session"""
    session_id = str(uuid.uuid4())
    active_sessions[session_id] = {
        'created_at': datetime.now().isoformat(),
        'files': [],
        'connected': False
    }
    return jsonify({'session_id': session_id})

@app.route('/session/<session_id>')
def view_session(session_id):
    """View a specific session"""
    if session_id not in active_sessions:
        return redirect(url_for('index'))
    
    return render_template('session.html', session_id=session_id)

@app.route('/connect/<session_id>', methods=['GET'])
def connect_page(session_id):
    """Page for phone to connect to a session"""
    if session_id not in active_sessions:
        return redirect(url_for('index'))
    
    return render_template('connect.html', session_id=session_id)

@app.route('/api/connect/<session_id>', methods=['POST'])
def connect_session(session_id):
    """API endpoint for phone to connect to a session"""
    if session_id not in active_sessions:
        return jsonify({'error': 'Session not found'}), 404
    
    active_sessions[session_id]['connected'] = True
    return jsonify({'success': True})

@app.route('/api/session/<session_id>/status', methods=['GET'])
def session_status(session_id):
    """Check if a session is connected"""
    if session_id not in active_sessions:
        return jsonify({'error': 'Session not found'}), 404
    
    return jsonify({
        'connected': active_sessions[session_id]['connected'],
        'created_at': active_sessions[session_id]['created_at']
    })

@app.route('/api/session/<session_id>/files', methods=['GET'])
def list_files(session_id):
    """List files available for transfer"""
    if session_id not in active_sessions:
        return jsonify({'error': 'Session not found'}), 404
    
    return jsonify({'files': active_sessions[session_id]['files']})

@app.route('/api/session/<session_id>/files', methods=['POST'])
def add_files(session_id):
    """Add files from phone to the session"""
    if session_id not in active_sessions:
        return jsonify({'error': 'Session not found'}), 404
    
    files_data = request.json.get('files', [])
    active_sessions[session_id]['files'] = files_data
    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
