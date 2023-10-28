import cv2
import face_recognition
from PIL import Image
import glob
import time


class Encoding: 
    def __init__(self, originalPath, originalImage, img, encoding) -> None:
        self.originalPath = originalPath
        self.originalImage = originalImage
        self.img = img
        self.encoding = encoding
        self.matches = set()

    @property 
    def get_img(self):
        return self.img
    
    @property
    def get_original_img(self):
        return self.originalPath

    @property
    def get_matches(self):
        return self.matches
    
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
    print(f"Comparing {img1.get_img} and {img2.get_img}")
    is_same = face_recognition.compare_faces([img1.get_encoding], img2.get_encoding)[0]
    if is_same:
        # finding the distance level between images
        return img2.get_original_img
        distance = face_recognition.face_distance([img1.get_encoding], img2.get_encoding)
        distance = round(distance[0] * 100)

        img1.matches.add(img2)
        img2.matches.add(img1)
            
        # calcuating accuracy level between images
        accuracy = 100 - round(distance)
        print(f"Face match:  {img2.get_original_img} & {img1.get_original_img} - Accuracy level: {accuracy}")
    else:
        return None

"""
finds all faces in a single image 
in:  imagePath

returns an array of face encodings 
"""
def find_all_faces_in_image(imagePath):
    faces = []
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
        try:
            encoding = find_face_encodings(new_path) 
        except:
            continue
        face = Encoding(originalPath=imagePath, originalImage=img, img=new_path, encoding=encoding)
        faces.append(face)

    return faces


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
    image_paths = glob.glob(path + "/*")

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
            try:
                encoding = find_face_encodings(new_path) 
            except:
                continue
            i+= 1
            face = Encoding(originalPath=image, originalImage=img, img=new_path, encoding=encoding)
            faces.append(face)

    return faces

def main():
    path = './img/20230903_135847190_iOS.jpg'

    ref_faces = find_all_faces_in_image(path)

    ref_face = ref_faces[0]
    compare_faces = find_faces_in_folder('./img')

    result = find_all_matches(ref_face, compare_faces)

    print(f"Reference is in these photos {result}")

    
main()