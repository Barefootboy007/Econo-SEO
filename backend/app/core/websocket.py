"""
WebSocket manager for real-time communication
Handles scraping progress updates and job notifications
"""

import asyncio
import json
from typing import Dict, List, Optional, Set
from datetime import datetime
import logging
import socketio
from fastapi import HTTPException

logger = logging.getLogger(__name__)

# Create Socket.IO server instance
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins="*",  # Configure based on your needs
    logger=True,
    engineio_logger=False
)

# Create ASGI app
socket_app = socketio.ASGIApp(
    sio,
    socketio_path='/ws/socket.io'
)


class ConnectionManager:
    """Manages WebSocket connections and rooms for job tracking"""
    
    def __init__(self):
        # Track active connections by session ID
        self.active_connections: Dict[str, str] = {}  # sid -> user_id
        # Track job subscriptions
        self.job_rooms: Dict[str, Set[str]] = {}  # job_id -> set of sids
        # Track user rooms
        self.user_rooms: Dict[str, Set[str]] = {}  # user_id -> set of sids
        
    async def connect(self, sid: str, user_id: Optional[str] = None):
        """Register a new connection"""
        self.active_connections[sid] = user_id or "anonymous"
        
        if user_id:
            if user_id not in self.user_rooms:
                self.user_rooms[user_id] = set()
            self.user_rooms[user_id].add(sid)
            
        logger.info(f"Client connected: {sid} (user: {user_id})")
        
    async def disconnect(self, sid: str):
        """Remove a connection and clean up rooms"""
        user_id = self.active_connections.get(sid)
        
        # Remove from user rooms
        if user_id and user_id in self.user_rooms:
            self.user_rooms[user_id].discard(sid)
            if not self.user_rooms[user_id]:
                del self.user_rooms[user_id]
        
        # Remove from job rooms
        for job_id, sids in list(self.job_rooms.items()):
            sids.discard(sid)
            if not sids:
                del self.job_rooms[job_id]
        
        # Remove from active connections
        if sid in self.active_connections:
            del self.active_connections[sid]
            
        logger.info(f"Client disconnected: {sid}")
    
    async def join_job_room(self, sid: str, job_id: str):
        """Add a connection to a job room for updates"""
        if job_id not in self.job_rooms:
            self.job_rooms[job_id] = set()
        self.job_rooms[job_id].add(sid)
        
        # Also join Socket.IO room
        await sio.enter_room(sid, f"job_{job_id}")
        logger.info(f"Client {sid} joined job room: {job_id}")
        
    async def leave_job_room(self, sid: str, job_id: str):
        """Remove a connection from a job room"""
        if job_id in self.job_rooms:
            self.job_rooms[job_id].discard(sid)
            if not self.job_rooms[job_id]:
                del self.job_rooms[job_id]
        
        # Also leave Socket.IO room
        await sio.leave_room(sid, f"job_{job_id}")
        logger.info(f"Client {sid} left job room: {job_id}")
    
    def get_job_subscribers(self, job_id: str) -> Set[str]:
        """Get all session IDs subscribed to a job"""
        return self.job_rooms.get(job_id, set())
    
    def get_user_sessions(self, user_id: str) -> Set[str]:
        """Get all session IDs for a user"""
        return self.user_rooms.get(user_id, set())


# Global connection manager instance
manager = ConnectionManager()


# Socket.IO event handlers
@sio.event
async def connect(sid, environ, auth):
    """Handle client connection"""
    # Extract user info from auth if provided
    user_id = None
    if auth and isinstance(auth, dict):
        user_id = auth.get('user_id')
    
    await manager.connect(sid, user_id)
    
    # Send connection confirmation
    await sio.emit('connected', {
        'message': 'Connected to WebSocket server',
        'sid': sid,
        'timestamp': datetime.utcnow().isoformat()
    }, to=sid)


@sio.event
async def disconnect(sid):
    """Handle client disconnection"""
    await manager.disconnect(sid)


@sio.event
async def join_scraping_job(sid, data):
    """Subscribe to scraping job updates"""
    try:
        job_id = data.get('job_id')
        if not job_id:
            await sio.emit('error', {
                'message': 'job_id is required'
            }, to=sid)
            return
        
        await manager.join_job_room(sid, job_id)
        
        # Send confirmation
        await sio.emit('joined_job', {
            'job_id': job_id,
            'message': f'Subscribed to job {job_id} updates'
        }, to=sid)
        
    except Exception as e:
        logger.error(f"Error joining job room: {e}")
        await sio.emit('error', {
            'message': str(e)
        }, to=sid)


@sio.event
async def leave_scraping_job(sid, data):
    """Unsubscribe from scraping job updates"""
    try:
        job_id = data.get('job_id')
        if not job_id:
            await sio.emit('error', {
                'message': 'job_id is required'
            }, to=sid)
            return
        
        await manager.leave_job_room(sid, job_id)
        
        # Send confirmation
        await sio.emit('left_job', {
            'job_id': job_id,
            'message': f'Unsubscribed from job {job_id} updates'
        }, to=sid)
        
    except Exception as e:
        logger.error(f"Error leaving job room: {e}")
        await sio.emit('error', {
            'message': str(e)
        }, to=sid)


# Helper functions for emitting events from other parts of the application
async def emit_scraping_progress(
    job_id: str,
    progress: int,
    status: str,
    message: str,
    current_url: Optional[str] = None,
    pages_scraped: Optional[int] = None,
    total_pages: Optional[int] = None,
    errors: Optional[List[str]] = None
):
    """Emit scraping progress to all subscribers of a job"""
    
    data = {
        'job_id': job_id,
        'progress': progress,
        'status': status,
        'message': message,
        'timestamp': datetime.utcnow().isoformat()
    }
    
    # Add optional fields
    if current_url is not None:
        data['current_url'] = current_url
    if pages_scraped is not None:
        data['pages_scraped'] = pages_scraped
    if total_pages is not None:
        data['total_pages'] = total_pages
    if errors:
        data['errors'] = errors
    
    # Emit to job room
    room = f"job_{job_id}"
    await sio.emit('scraping_progress', data, room=room)
    
    logger.info(f"Emitted progress for job {job_id}: {progress}% - {message}")


async def emit_scraping_complete(
    job_id: str,
    success: bool,
    pages_scraped: int,
    total_pages: int,
    duration: Optional[float] = None,
    errors: Optional[List[str]] = None
):
    """Emit scraping completion event"""
    
    data = {
        'job_id': job_id,
        'success': success,
        'pages_scraped': pages_scraped,
        'total_pages': total_pages,
        'timestamp': datetime.utcnow().isoformat()
    }
    
    if duration is not None:
        data['duration'] = duration
    if errors:
        data['errors'] = errors
    
    # Emit to job room
    room = f"job_{job_id}"
    await sio.emit('scraping_complete', data, room=room)
    
    logger.info(f"Emitted completion for job {job_id}: success={success}, pages={pages_scraped}/{total_pages}")


async def emit_scraping_error(
    job_id: str,
    error: str,
    error_type: Optional[str] = None
):
    """Emit scraping error event"""
    
    data = {
        'job_id': job_id,
        'error': error,
        'error_type': error_type or 'general',
        'timestamp': datetime.utcnow().isoformat()
    }
    
    # Emit to job room
    room = f"job_{job_id}"
    await sio.emit('scraping_error', data, room=room)
    
    logger.error(f"Emitted error for job {job_id}: {error}")


async def broadcast_to_user(user_id: str, event: str, data: dict):
    """Broadcast an event to all sessions of a specific user"""
    sessions = manager.get_user_sessions(user_id)
    for sid in sessions:
        await sio.emit(event, data, to=sid)