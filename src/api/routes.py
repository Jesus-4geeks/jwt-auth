"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
import re

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)

def is_valid_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():
    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }
    return jsonify(response_body), 200

# ================================
# AUTHENTICATION ENDPOINTS
# ================================

@api.route('/signup', methods=['POST'])
def signup():
    """Register a new user"""
    try:
        # Get data from request
        data = request.get_json()
        
        if not data:
            raise APIException("No data provided", status_code=400)
        
        email = data.get('email')
        password = data.get('password')
        first_name = data.get('first_name', '')
        last_name = data.get('last_name', '')
        
        # Validate required fields
        if not email or not password:
            raise APIException("Email and password are required", status_code=400)
        
        # Validate email format
        if not is_valid_email(email):
            raise APIException("Invalid email format", status_code=400)
        
        # Validate password length
        if len(password) < 6:
            raise APIException("Password must be at least 6 characters long", status_code=400)
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            raise APIException("User already exists with this email", status_code=400)
        
        # Create new user
        new_user = User(
            email=email,
            first_name=first_name,
            last_name=last_name,
            is_active=True
        )
        new_user.set_password(password)
        
        # Save to database
        db.session.add(new_user)
        db.session.commit()
        
        # Create access token (convert user_id to string)
        access_token = create_access_token(identity=str(new_user.id))
        
        return jsonify({
            "message": "User created successfully",
            "user": new_user.serialize(),
            "access_token": access_token
        }), 201
        
    except APIException as e:
        db.session.rollback()
        raise e
    except Exception as e:
        db.session.rollback()
        raise APIException(f"An error occurred during signup: {str(e)}", status_code=500)

@api.route('/login', methods=['POST'])
def login():
    """Authenticate user and return token"""
    try:
        # Get data from request
        data = request.get_json()
        
        if not data:
            raise APIException("No data provided", status_code=400)
        
        email = data.get('email')
        password = data.get('password')
        
        # Validate required fields
        if not email or not password:
            raise APIException("Email and password are required", status_code=400)
        
        # Find user by email
        user = User.query.filter_by(email=email).first()
        
        # Validate user exists and password is correct
        if not user or not user.check_password(password):
            raise APIException("Invalid email or password", status_code=401)
        
        # Check if user is active
        if not user.is_active:
            raise APIException("Account is deactivated", status_code=401)
        
        # Create access token (convert user_id to string)
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            "message": "Login successful",
            "user": user.serialize(),
            "access_token": access_token
        }), 200
        
    except APIException as e:
        raise e
    except Exception as e:
        raise APIException(f"An error occurred during login: {str(e)}", status_code=500)

@api.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get current user profile (protected route)"""
    try:
        # Get current user ID from JWT token (convert back to int)
        current_user_id = int(get_jwt_identity())
        
        # Find user by ID
        user = User.query.get(current_user_id)
        
        if not user:
            raise APIException("User not found", status_code=404)
        
        return jsonify({
            "user": user.serialize()
        }), 200
        
    except APIException as e:
        raise e
    except Exception as e:
        raise APIException(f"An error occurred: {str(e)}", status_code=500)

@api.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update current user profile (protected route)"""
    try:
        # Get current user ID from JWT token (convert back to int)
        current_user_id = int(get_jwt_identity())
        
        # Find user by ID
        user = User.query.get(current_user_id)
        
        if not user:
            raise APIException("User not found", status_code=404)
        
        # Get data from request
        data = request.get_json()
        
        if not data:
            raise APIException("No data provided", status_code=400)
        
        # Update user fields
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'email' in data:
            # Validate email format
            if not is_valid_email(data['email']):
                raise APIException("Invalid email format", status_code=400)
            
            # Check if email is already taken by another user
            existing_user = User.query.filter_by(email=data['email']).first()
            if existing_user and existing_user.id != user.id:
                raise APIException("Email already exists", status_code=400)
            
            user.email = data['email']
        
        # Save changes
        db.session.commit()
        
        return jsonify({
            "message": "Profile updated successfully",
            "user": user.serialize()
        }), 200
        
    except APIException as e:
        db.session.rollback()
        raise e
    except Exception as e:
        db.session.rollback()
        raise APIException(f"An error occurred: {str(e)}", status_code=500)

@api.route('/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    """Change user password (protected route)"""
    try:
        # Get current user ID from JWT token (convert back to int)
        current_user_id = int(get_jwt_identity())
        
        # Find user by ID
        user = User.query.get(current_user_id)
        
        if not user:
            raise APIException("User not found", status_code=404)
        
        # Get data from request
        data = request.get_json()
        
        if not data:
            raise APIException("No data provided", status_code=400)
        
        current_password = data.get('current_password')
        new_password = data.get('new_password')
        
        # Validate required fields
        if not current_password or not new_password:
            raise APIException("Current password and new password are required", status_code=400)
        
        # Validate current password
        if not user.check_password(current_password):
            raise APIException("Current password is incorrect", status_code=401)
        
        # Validate new password length
        if len(new_password) < 6:
            raise APIException("New password must be at least 6 characters long", status_code=400)
        
        # Set new password
        user.set_password(new_password)
        db.session.commit()
        
        return jsonify({
            "message": "Password changed successfully"
        }), 200
        
    except APIException as e:
        db.session.rollback()
        raise e
    except Exception as e:
        db.session.rollback()
        raise APIException(f"An error occurred: {str(e)}", status_code=500)

# ================================
# PROTECTED ROUTES (EXAMPLES)
# ================================

@api.route('/private', methods=['GET'])
@jwt_required()
def private():
    """Example of a private route that requires authentication"""
    try:
        # Get current user ID from JWT token (convert back to int)
        current_user_id = int(get_jwt_identity())
        
        # Find user by ID
        user = User.query.get(current_user_id)
        
        return jsonify({
            "message": f"Hello {user.email}! This is a private route.",
            "user_id": current_user_id
        }), 200
        
    except Exception as e:
        raise APIException(f"An error occurred: {str(e)}", status_code=500)

@api.route('/users', methods=['GET'])
@jwt_required()
def get_all_users():
    """Get all users (protected route - admin only in real apps)"""
    try:
        users = User.query.all()
        users_list = [user.serialize() for user in users]
        
        return jsonify({
            "users": users_list,
            "total": len(users_list)
        }), 200
        
    except Exception as e:
        raise APIException(f"An error occurred: {str(e)}", status_code=500)