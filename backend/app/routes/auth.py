from flask import Blueprint, request, jsonify
from sqlalchemy import text
from datetime import datetime, timedelta
import bcrypt
import uuid

from app import get_db
from app.models.product import User, Session, ProductSubscriber, Product

auth_bp = Blueprint('auth', __name__)

def get_current_user(db):
    """
    Reads Authorization header from Flask request,
    validates the session token, and returns the User object.
    Returns None if invalid or missing.
    """
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return None
        
    token = auth_header.split(' ', 1)[1].strip()
    session = db.query(Session).filter(
        Session.token == token,
        Session.expires_at > datetime.utcnow()
    ).first()
    
    return session.user if session else None


@auth_bp.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email', '').strip()
    password = data.get('password', '')
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
        
    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters"}), 400

    db = next(get_db())
    try:
        # Check if email is already registered
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            return jsonify({"error": "An account with this email already exists"}), 409
            
        # Hash password
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Create user
        new_user = User(email=email, password_hash=password_hash, last_login_at=datetime.utcnow())
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        # Create session (7 days)
        expires_at = datetime.utcnow() + timedelta(days=7)
        new_session = Session(user_id=new_user.id, expires_at=expires_at)
        db.add(new_session)
        db.commit()
        db.refresh(new_session)
        
        return jsonify({
            "session_token": new_session.token,
            "email": new_user.email,
            "message": "Account created successfully."
        }), 201

    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


@auth_bp.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email', '').strip()
    password = data.get('password', '')
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    db = next(get_db())
    try:
        user = db.query(User).filter(User.email == email).first()
        
        if not user or not bcrypt.checkpw(password.encode('utf-8'), user.password_hash.encode('utf-8')):
            return jsonify({"error": "Invalid email or password."}), 401
            
        # Update last login
        user.last_login_at = datetime.utcnow()
        db.commit()
        
        # Create new session
        expires_at = datetime.utcnow() + timedelta(days=7)
        new_session = Session(user_id=user.id, expires_at=expires_at)
        db.add(new_session)
        db.commit()
        db.refresh(new_session)
        
        return jsonify({
            "session_token": new_session.token,
            "email": user.email,
            "message": "Logged in successfully."
        }), 200

    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


@auth_bp.route('/auth/me', methods=['GET'])
def get_me():
    db = next(get_db())
    try:
        user = get_current_user(db)
        if not user:
            return jsonify({"error": "Unauthorized"}), 401
            
        return jsonify({
            "id": user.id,
            "email": user.email
        }), 200
    finally:
        db.close()


@auth_bp.route('/auth/logout', methods=['POST'])
def logout():
    db = next(get_db())
    try:
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({"error": "Unauthorized"}), 401
            
        token = auth_header.split(' ', 1)[1].strip()
        session = db.query(Session).filter(Session.token == token).first()
        
        if session:
            db.delete(session)
            db.commit()
            
        return jsonify({"message": "Logged out successfully."}), 200
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


@auth_bp.route('/dashboard', methods=['GET'])
def get_dashboard():
    db = next(get_db())
    try:
        user = get_current_user(db)
        if not user:
            return jsonify({"error": "Unauthorized"}), 401
            
        subscriptions = db.query(ProductSubscriber).filter(ProductSubscriber.user_id == user.id).all()
        
        tracked = []
        for sub in subscriptions:
            product = sub.product
            tracked.append({
                "subscription_id": sub.id,
                "target_price": float(sub.target_price) if sub.target_price else None,
                "unsubscribe_token": sub.unsubscribe_token,
                "subscribed_at": sub.subscribed_at.isoformat() if sub.subscribed_at else None,
                "product": product.to_dict()
            })
            
        return jsonify({
            "email": user.email,
            "tracked": tracked
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()
