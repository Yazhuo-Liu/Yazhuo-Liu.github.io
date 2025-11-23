import os
from PIL import Image

# Configuration
ROOT_DIR = 'assets/img'           # Root directory for images
GALLERY_DIR = 'assets/img/photos' # Directory for gallery photos (needs thumbnails)
THUMB_WIDTH = 400                 # Width for generated thumbnails

def convert_to_webp(file_path):
    """Convert an image to WebP format."""
    try:
        # Generate new filename with .webp extension
        file_name, ext = os.path.splitext(file_path)
        output_path = f"{file_name}.webp"

        # # Skip if WebP file already exists to avoid duplicate processing
        # if os.path.exists(output_path):
        #     print(f"Exists: {output_path}")
        #     return output_path

        with Image.open(file_path) as img:
            # Save as WebP
            img.save(output_path, 'WEBP', quality=90)
            print(f"Converted: {file_path} -> {output_path}")
            return output_path
    except Exception as e:
        print(f"Conversion failed for {file_path}: {e}")
        return None

def create_thumbnail(file_path):
    """Generate a thumbnail (xxx-thumb.webp)."""
    try:
        file_name, ext = os.path.splitext(file_path)
        thumb_path = f"{file_name}-thumb.webp"

        if os.path.exists(thumb_path):
            return

        with Image.open(file_path) as img:
            # Calculate aspect ratio
            aspect_ratio = img.height / img.width
            new_height = int(THUMB_WIDTH * aspect_ratio)
            
            # Resize image
            img.thumbnail((THUMB_WIDTH, new_height))
            
            # Save thumbnail
            img.save(thumb_path, 'WEBP', quality=90)
            print(f"Created Thumbnail: {thumb_path}")
    except Exception as e:
        print(f"Thumbnail generation failed for {file_path}: {e}")

def main():
    print("--- Starting Image Processing ---")
    
    # Walk through assets/img and its subdirectories
    for root, dirs, files in os.walk(ROOT_DIR):
        for file in files:
            if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                full_path = os.path.join(root, file)
                
                # 1. Convert original image to WebP
                convert_to_webp(full_path)

                # 2. If inside the gallery folder, generate a thumbnail
                # Check if current file is in the gallery directory
                if GALLERY_DIR in root.replace('\\', '/'): 
                    # Avoid reprocessing files that are already thumbnails
                    if '-thumb' not in file:
                        create_thumbnail(full_path)

    print("--- Processing Complete ---")

if __name__ == "__main__":
    main()