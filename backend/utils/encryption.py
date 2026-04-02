import base64
import os
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend

def _get_key(password: str, salt: bytes) -> bytes:
    """Generate a 256-bit key from the password and salt."""
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
        backend=default_backend()
    )
    return kdf.derive(password.encode())

def encrypt_message(message: str, password: str) -> str:
    """
    Encrypts a string message using AES-256-GCM.
    Returns a base64 encoded string containing salt + nonce + ciphertext + tag.
    """
    salt = os.urandom(16)
    key = _get_key(password, salt)
    nonce = os.urandom(12)
    
    cipher = Cipher(algorithms.AES(key), modes.GCM(nonce), backend=default_backend())
    encryptor = cipher.encryptor()
    
    message_bytes = message.encode('utf-8')
    ciphertext = encryptor.update(message_bytes) + encryptor.finalize()
    
    # Pack everything together
    encrypted_data = salt + nonce + encryptor.tag + ciphertext
    return base64.b64encode(encrypted_data).decode('utf-8')

def decrypt_message(encrypted_b64: str, password: str) -> str:
    """
    Decrypts the base64 encoded payload back into the original string.
    """
    encrypted_data = base64.b64decode(encrypted_b64.encode('utf-8'))
    
    # Extract parts
    salt = encrypted_data[:16]
    nonce = encrypted_data[16:28]
    tag = encrypted_data[28:44]
    ciphertext = encrypted_data[44:]
    
    key = _get_key(password, salt)
    
    cipher = Cipher(algorithms.AES(key), modes.GCM(nonce, tag), backend=default_backend())
    decryptor = cipher.decryptor()
    
    decrypted_bytes = decryptor.update(ciphertext) + decryptor.finalize()
    return decrypted_bytes.decode('utf-8')
