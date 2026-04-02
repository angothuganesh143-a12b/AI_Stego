import cv2
import numpy as np

DELIMITER = "::::END::::"

def embed_data(image_path, text, output_path):
    """
    Embeds text into the LSBs of an image using extremely fast Numpy vectorization.
    Returns True if successful, False otherwise.
    """
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError("Could not read carrier image")
        
    data = text + DELIMITER
    # Convert text to binary string, then an array of uint8 integers (0 and 1)
    binary_string = ''.join(format(ord(char), '08b') for char in data)
    bits_to_embed = np.array(list(binary_string), dtype=np.uint8)
    
    data_len = len(bits_to_embed)
    
    height, width, channels = img.shape
    total_pixels = height * width * channels
    
    if data_len > total_pixels:
        raise ValueError("Hidden message is too large to fit in this image")
        
    # Flatten the image
    flat_img = img.flatten()
    
    # Vectorized LSB replacement
    # 1. Clear the LSB of the first 'data_len' pixels (using 254 instead of ~1 to avoid uint8 overflow with -2)
    flat_img[:data_len] = flat_img[:data_len] & 254
    
    # 2. Set the LSB to our message bits
    flat_img[:data_len] = flat_img[:data_len] | bits_to_embed
    
    # Reshape and save
    stego_img = flat_img.reshape(height, width, channels)
    cv2.imwrite(output_path, stego_img)
    return True

def extract_data(image_path):
    """
    Extracts LSB encoded data from an image using Numpy vectorization.
    Returns the extracted string or None if delimiter is not found.
    """
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError("Could not read modified image")
        
    # Flatten and extract LSB from all pixels instantly
    flat_img = img.flatten()
    lsb_array = flat_img & 1
    
    # Must be a multiple of 8 to pack bits into bytes
    valid_len = (len(lsb_array) // 8) * 8
    lsb_array = lsb_array[:valid_len]
    
    # Pack bits back into bytes (ASCII integers)
    byte_array = np.packbits(lsb_array)
    
    # Convert the bytes sequence to a raw byte string
    extracted_bytes = byte_array.tobytes()
    
    # Search for the delimiter in the bytes
    delimiter_bytes = DELIMITER.encode('utf-8')
    end_idx = extracted_bytes.find(delimiter_bytes)
    
    if end_idx != -1:
        # We found the delimiter! Cut off the data and decode it safely.
        extracted_message = extracted_bytes[:end_idx]
        return extracted_message.decode('utf-8', errors='ignore')
        
    return None
