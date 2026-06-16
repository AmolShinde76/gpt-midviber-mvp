"""
Memory management module for conversation history
Maintains the last 5 Q&A pairs per user session for context injection
"""

import time
import threading
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta


@dataclass
class QAPair:
    """Represents a single Question-Answer pair in conversation memory"""
    question: str
    answer: str
    timestamp: float
    document_id: str


@dataclass
class SessionMemory:
    """Represents a user's conversation session for a specific document"""
    session_id: str
    document_id: str
    qa_pairs: List[QAPair]
    last_activity: float
    created_at: float


class MemoryManager:
    """Manages conversation memory for all user sessions"""

    def __init__(self, max_pairs_per_session: int = 5, session_timeout_hours: int = 24):
        self.max_pairs_per_session = max_pairs_per_session
        self.session_timeout = timedelta(hours=session_timeout_hours)
        self.sessions: Dict[str, SessionMemory] = {}
        # Start cleanup thread
        self.cleanup_thread = threading.Thread(target=self._cleanup_worker, daemon=True)
        self.cleanup_thread.start()

    def get_session_memory(self, session_id: str) -> Optional[SessionMemory]:
        """Retrieve session memory if it exists and hasn't expired"""
        session = self.sessions.get(session_id)
        if session and not self._is_session_expired(session):
            session.last_activity = time.time()
            return session
        elif session:
            # Remove expired session
            del self.sessions[session_id]
        return None

    def create_session(self, session_id: str, document_id: str) -> SessionMemory:
        """Create a new session memory"""
        session = SessionMemory(
            session_id=session_id,
            document_id=document_id,
            qa_pairs=[],
            last_activity=time.time(),
            created_at=time.time()
        )
        self.sessions[session_id] = session
        return session

    def add_qa_pair(self, session_id: str, question: str, answer: str, document_id: str) -> bool:
        """Add a Q&A pair to session memory. Returns True if successful."""
        try:
            session = self.sessions.get(session_id)
            if not session:
                # Create session if it doesn't exist
                session = self.create_session(session_id, document_id)

            # Verify document matches
            if session.document_id != document_id:
                return False

            # Create new QA pair
            qa_pair = QAPair(
                question=question,
                answer=answer,
                timestamp=time.time(),
                document_id=document_id
            )

            # Add to session and maintain max pairs limit
            session.qa_pairs.append(qa_pair)
            if len(session.qa_pairs) > self.max_pairs_per_session:
                session.qa_pairs = session.qa_pairs[-self.max_pairs_per_session:]

            session.last_activity = time.time()
            return True
        except Exception:
            return False

    def get_context_for_question(self, session_id: str, current_document_id: str) -> str:
        """Get formatted conversation context for the current question"""
        session = self.get_session_memory(session_id)
        if not session or session.document_id != current_document_id:
            return ""

        if not session.qa_pairs:
            return ""

        # Format context as readable conversation history
        context_parts = []
        total_length = 0
        max_length = 4000  # Limit total context length to avoid API limits
        
        for qa in reversed(session.qa_pairs[-self.max_pairs_per_session:]):
            qa_text = f"Q: {qa.question}\nA: {qa.answer}\n\n"
            if total_length + len(qa_text) > max_length:
                break
            context_parts.insert(0, qa_text)
            total_length += len(qa_text)

        context = "".join(context_parts).strip()
        return f"Previous conversation:\n{context}\n\n" if context else ""

    def clear_session(self, session_id: str) -> bool:
        """Clear all memory for a session"""
        if session_id in self.sessions:
            del self.sessions[session_id]
            return True
        return False

    def get_session_stats(self) -> Dict:
        """Get statistics about current memory usage"""
        active_sessions = len([s for s in self.sessions.values() if not self._is_session_expired(s)])
        total_pairs = sum(len(s.qa_pairs) for s in self.sessions.values() if not self._is_session_expired(s))
        return {
            "active_sessions": active_sessions,
            "total_sessions": len(self.sessions),
            "total_qa_pairs": total_pairs,
            "max_pairs_per_session": self.max_pairs_per_session
        }

    def _is_session_expired(self, session: SessionMemory) -> bool:
        """Check if a session has expired"""
        return time.time() - session.last_activity > self.session_timeout.total_seconds()

    def _cleanup_worker(self):
        """Background worker to clean up expired sessions"""
        while True:
            try:
                time.sleep(3600)  # Clean up every hour
                expired_sessions = [
                    sid for sid, session in self.sessions.items()
                    if self._is_session_expired(session)
                ]
                for sid in expired_sessions:
                    del self.sessions[sid]
                if expired_sessions:
                    print(f"Cleaned up {len(expired_sessions)} expired sessions")
            except Exception as e:
                print(f"Error in cleanup worker: {e}")


# Global memory manager instance
memory_manager = MemoryManager()


def generate_session_id(document_id: str) -> str:
    """Generate a unique session ID for a document"""
    import uuid
    import hashlib

    # Create a unique session ID that includes document ID for isolation
    unique_string = f"{document_id}_{uuid.uuid4()}_{int(time.time())}"
    # Hash it to keep it reasonably short
    session_hash = hashlib.md5(unique_string.encode()).hexdigest()[:16]
    return f"session_{document_id[:8]}_{session_hash}"