import cv2
import face_recognition
from PIL import Image
import glob
import time
from pathlib import Path
import sys
import os

class Encoding: 
    def __init__(self, originalPath, originalImage, img, encoding) -> None:
        self.originalPath = originalPath
        self.originalImage = originalImage
        self.img = img
        self.encoding = encoding

    @property 
    def get_img(self):
        return self.img
    
    @property
    def get_original_img(self):
        return self.originalPath
    
    @property
    def get_encoding(self):
        return self.encoding
    

def find_face_encodings(image_path):
    # reading image
    image = cv2.imread(image_path)
    # get face encodings from the image
    face_enc = face_recognition.face_encodings(image)
    # return face encodings
    return face_enc[0]

"""
compares two face encodings 
in: img1: face encoding
    img2: face encoding 

returns an image path if true, None if false 
"""
def compare_faces(img1, img2):
    is_same = face_recognition.compare_faces([img1.get_encoding], img2.get_encoding)[0]
    if is_same:
        # finding the distance level between images
        return img2.get_original_img
        #use below if  more info is wanted 
        distance = face_recognition.face_distance([img1.get_encoding], img2.get_encoding)
        distance = round(distance[0] * 100)
            
        # calcuating accuracy level between images
        accuracy = 100 - round(distance)
        print(f"Face match:  {img2.get_original_img} & {img1.get_original_img} - Accuracy level: {accuracy}")
    else:
        return None

"""
finds all faces in a single image 
in:  imagePath

returns a dict of {path_to_cropped_face : cropped_image_source_path}
"""
def find_all_faces_in_image(imagePath):
    face_paths = dict()
    img = face_recognition.load_image_file(imagePath)
    face_locations = face_recognition.face_locations(img)
    i = 0
    for face_location in face_locations:
        # Print the location of each face in this image
        top, right, bottom, left = face_location
        # You can access the actual face itself like this:
        face_image = img[top:bottom, left:right]
        new_image = Image.fromarray(face_image)
        new_path = f"./saved_imgs/ref_img_{i}.jpg"
        i+= 1
        new_image.save(new_path)
        face_paths.update({new_path :  imagePath})

    return face_paths


"""
create a face encoding from a cropped image  
in:  cropped_img_path, original_image_path

returns a face encoding 
"""
def create_face_encoding(cropped_img_path, original_image_path):
    try:
        encoding = find_face_encodings(cropped_img_path) 
        face = Encoding(originalPath=original_image_path, originalImage=face_recognition.load_image_file(original_image_path), img=cropped_img_path, encoding=encoding)
        return face
    except:
        return None


"""
finds all photos containing a specific person 
in:  reference Encoding type image to compare all others to 
     array of Encodings being compared to reference image

returns a set of image paths 
"""
def find_all_matches(refImg, faces): #finds all photos containing a specific person 
    matches = set()
    for img in faces:
        if img.get_original_img in matches: 
            continue 
        result = compare_faces(refImg, img)    
        if result is not None:
            matches.add(result)        

    return matches 


"""
finds all face encodings in a folder 
in:  path to find all face encodings in 

returns an array of face encodings  
"""
def find_faces_in_folder(path):
    image_paths = path

    faces = []
    i = 0
    for image in image_paths:
        img = face_recognition.load_image_file(image)
        face_locations = face_recognition.face_locations(img)

        for face_location in face_locations:
            # Print the location of each face in this image
            top, right, bottom, left = face_location
            # You can access the actual face itself like this:
            face_image = img[top:bottom, left:right]
            pil_image = Image.fromarray(face_image)
            new_path = f"./saved_imgs/img_{i}.jpg"
            pil_image.save(new_path)
            
            face = create_face_encoding(new_path, image)
            if face is not None:
                faces.append(face)
                i+=1
                
    return faces


def faces_from_input():
    path = input("\nPlease provide the relative path to a photo that the reference individual is in\n >> ")
    file_path = Path(path)

    while not file_path.is_file():
        path = input("Can't find file, please check input and try again (0 to exit) \n >> ")
        if path == '0':
            exit(0)
        file_path = Path(path)

    ref_faces = find_all_faces_in_image(path)

    if (len(ref_faces.keys()) == 0):
        print("\nNo individuals found in the provided photo. Try again? Y/N")
        while path.lower() != 'y' and path.lower() != 'n':
            path = input("Try again? Y/N >>")
        if path.lower() == 'y':
            faces_from_input()
        elif path.lower() == 'n':
                exit(0)
    

    ref_image = input('\n./saved_imgs folder contains all the faces found in the photo. Please provide the path to desired individual (ex: ./saved_imgs/ref_img_0.jpg) \n >> ')
    ref_image_path = Path(ref_image)

    while not ref_image_path.is_file():
        ref_image = input("Can't find file, please check input and try again (0 to exit) \n >> ")
        if ref_image == '0':
            exit(0)
        ref_image_path = Path(ref_image)

    face = create_face_encoding(ref_image, ref_faces.get(ref_image))
    
    if face is not None:
        return face 
    else: 
        prompt = input("\nCould not find any faces in provided photo. Try again? Y/N>> ")
        while prompt.lower() != 'y' and prompt.lower() != 'n':
            prompt = input("Try again? Y/N >>")
        if prompt.lower() == 'y':
            faces_from_input()
        else:
            exit(0)

def delete_saved_images(saved_images_path):
    files_to_delete = glob.glob(f'{saved_images_path}/*')
    for f in files_to_delete:
        os.remove(f)

def main_deprecated():
    saved_images_path = './saved_imgs'
    stored_photos_path = './img'
    delete_saved_images(saved_images_path)

    if not os.path.exists(saved_images_path):
        os.makedirs(saved_images_path)

    ref_face  = faces_from_input()
    compare_faces = find_faces_in_folder(stored_photos_path)
    result = find_all_matches(ref_face, compare_faces)
    
    delete_saved_images(saved_images_path)
        
    print(f"Reference is in these photos: {result}")


def main():
    saved_images_path = './saved_imgs'
    if sys.argv[1] == "faces_in_image":
        delete_saved_images(saved_images_path)
        if not os.path.exists(saved_images_path):
            os.makedirs(saved_images_path)
        print(find_all_faces_in_image(sys.argv[2]))
    if sys.argv[1] == "find_photos_of_person":
        ref_face = create_face_encoding(sys.argv[2], sys.argv[3])
        folder = sys.argv[4].split(',')
        compare_faces = find_faces_in_folder(folder)
        result = find_all_matches(ref_face, compare_faces)
        print(list(result))
    

main()
