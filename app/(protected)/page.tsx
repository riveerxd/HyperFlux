'use client'

import FileUpload from '@/app/components/FileUpload'
import FileList from '@/app/components/FileList'
import { useState } from 'react'

interface TempFile {
  id: string;
  filename: string;
  createdAt: string;
  downloads: number;
  user: {
    email: string;
    name: string;
  };
}

export default function Home() {
  const [files, setFiles] = useState<TempFile[]>([]);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Temporary File Sharing
      </h1>
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-8">
          <FileUpload onFileUploaded={(newFile) => {
            if (isTempFile(newFile)) {
              setFiles(prev => [newFile, ...prev]);
            } else {
              console.error('Invalid file uploaded:', newFile);
            }
          }} />

          <FileList files={files} setFiles={setFiles} />
        </div>
      </div>
    </div>
  );
}

function isTempFile(file: any): file is TempFile {
  return (
    typeof file === 'object' &&
    file !== null &&
    'id' in file &&
    'filename' in file &&
    'createdAt' in file &&
    'downloads' in file &&
    'user' in file
  );
}