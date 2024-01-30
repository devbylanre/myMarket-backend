import crypto from 'crypto';
import { storage } from '../configs/firebase';
import {
  StorageReference,
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from 'firebase/storage';
import path from 'path';

export const useFirebase = () => {
  // Create a unique filename
  const fileName = (originalname: string, id: string) => {
    const extension = path.extname(originalname);
    const hash = crypto.randomBytes(8).toString('hex');
    const name = `${id}-${hash}${extension}`;
    return name;
  };

  // Uploads file
  const uploadFile = async (
    buffer: Buffer,
    fileName: string,
    folder?: string
  ) => {
    const object = ref(storage, `${folder}/${fileName}`);
    const snapshot = await uploadBytes(object, buffer).then((data) => data);
    return snapshot;
  };

  // Deletes file
  const deleteFile = async (fileName: string, folder?: string) => {
    const object = ref(storage, `${folder}/${fileName}`);
    await deleteObject(object);
  };

  // Get file Url
  const getUrl = async (ref: StorageReference) => {
    const url = await getDownloadURL(ref);
    return url;
  };

  return { fileName, uploadFile, deleteFile, getUrl };
};
