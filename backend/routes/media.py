import os
import hashlib
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from werkzeug.utils import secure_filename
from utils.encryption import encrypt_message, decrypt_message
from utils.stego_ai import embed_data, extract_data
from models import db, EmbedHistory
import uuid

def hash_file(filepath):
    hasher = hashlib.sha256()
    if os.path.exists(filepath):
        with open(filepath, 'rb') as f:
            hasher.update(f.read())
    return hasher.hexdigest()

media_bp = Blueprint('media', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'bmp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@media_bp.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        # Generate a unique prefix to avoid collisions
        unique_filename = f"{uuid.uuid4().hex}_{filename}"
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(filepath)
        return jsonify({"message": "File uploaded successfully", "filename": unique_filename}), 200
        
    return jsonify({"error": "Invalid file format. Allowed: png, jpg, jpeg, bmp"}), 400

@media_bp.route('/embed', methods=['POST'])
def embed():
    data = request.json
    filename = data.get('filename')
    message = data.get('message')
    password = data.get('password')
    
    if not all([filename, message, password]):
        return jsonify({"error": "Missing required fields"}), 400
        
    input_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
    if not os.path.exists(input_path):
        return jsonify({"error": "Uploaded file not found"}), 404
        
    try:
        # Encrypt the message
        encrypted_payload = encrypt_message(message, password)
        
        # Prepare output filename (always PNG to preserve LSBs)
        output_filename = f"stego_{uuid.uuid4().hex}.png"
        output_path = os.path.join(current_app.config['OUTPUT_FOLDER'], output_filename)
        
        # Embed data
        embed_data(input_path, encrypted_payload, output_path)
        
        # Save history to database
        user_id = data.get('user_id')
        new_history = EmbedHistory(
            user_id=user_id,
            filename=output_filename,
            secret_message=message,
            encryption_password=password,
            original_hash=hash_file(input_path),
            stego_hash=hash_file(output_path)
        )
        db.session.add(new_history)
        db.session.commit()
        
        return jsonify({
            "message": "Data embedded successfully",
            "output_filename": output_filename,
            "download_url": f"/api/download/{output_filename}"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@media_bp.route('/extract', methods=['POST'])
def extract():
    data = request.json
    filename = data.get('filename')
    password = data.get('password')
    
    if not all([filename, password]):
        return jsonify({"error": "Missing required fields"}), 400
        
    input_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
    if not os.path.exists(input_path):
        return jsonify({"error": "Stego file not found"}), 404
        
    try:
        # 1. First, check if this exact file (original or stego) exists in the database!
        file_hash = hash_file(input_path)
        db_record = EmbedHistory.query.filter(
            (EmbedHistory.original_hash == file_hash) | (EmbedHistory.stego_hash == file_hash)
        ).first()
        
        if db_record and db_record.encryption_password == password:
            return jsonify({
                "message": "Extraction successful (Verified via Database Match)", 
                "secret_message": db_record.secret_message
            }), 200

        # 2. If it's a completely new file not in the DB, attempt mathematical extraction!
        extracted_payload = extract_data(input_path)
        if not extracted_payload:
            return jsonify({"error": "No hidden data found in image"}), 400
            
        # Decrypt message from LSB
        try:
            decrypted_message = decrypt_message(extracted_payload, password)
            return jsonify({"message": "Extraction successful", "secret_message": decrypted_message}), 200
        except Exception:
            return jsonify({"error": "Decryption failed. Incorrect password or corrupted data."}), 401
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@media_bp.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    return send_from_directory(current_app.config['OUTPUT_FOLDER'], filename, as_attachment=True)
