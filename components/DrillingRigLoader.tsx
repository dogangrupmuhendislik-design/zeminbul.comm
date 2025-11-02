import * as React from 'react';
import { LoaderIcon } from './icons';

const DrillingRigLoader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-gray-700 dark:text-gray-300" aria-live="polite" aria-busy="true">
      <LoaderIcon className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400" />
      <p className="mt-4 text-lg font-semibold">
        Yükleniyor...
      </p>
    </div>
  );
};

export default DrillingRigLoader;
