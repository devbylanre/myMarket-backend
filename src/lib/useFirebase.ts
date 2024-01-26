import { initializeApp } from 'firebase/app';
import crypto from 'crypto';
import firebaseConfig from '../configs/firebase';
import {
  StorageReference,
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from 'firebase/storage';
import path from 'path';

export const useFirebase = () => {
  const firebaseApp = initializeApp(firebaseConfig);
  const storage = getStorage(firebaseApp);

  const fileName = (originalname: string, id: string) => {
    const extension = path.extname(originalname);
    const hash = crypto.randomBytes(8).toString('hex');
    const name = `${id}-${hash}${extension}`;
    return name;
  };

  const uploadFile = async (
    buffer: Buffer,
    fileName: string,
    folder?: string
  ) => {
    const object = ref(storage, `${folder}/${fileName}`);
    const snapshot = await uploadBytes(object, buffer);
    return snapshot;
  };

  const deleteFile = async (fileName: string, folder?: string) => {
    const object = ref(storage, `${folder}/${fileName}`);
    await deleteObject(object);
  };

  const getUrl = async (ref: StorageReference) => {
    const url = await getDownloadURL(ref);
    return url;
  };

  return { fileName, uploadFile, deleteFile, getUrl };
};
