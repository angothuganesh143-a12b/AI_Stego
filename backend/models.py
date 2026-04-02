from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False) # hashed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "created_at": self.created_at.isoformat()
        }

class EmbedHistory(db.Model):
    __tablename__ = 'embed_history'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True) # nullable if user is not logged in somehow
    filename = db.Column(db.String(255), nullable=False)
    secret_message = db.Column(db.Text, nullable=False)
    encryption_password = db.Column(db.String(255), nullable=False)
    original_hash = db.Column(db.String(255), nullable=True)
    stego_hash = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

