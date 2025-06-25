import React, { useState, useEffect } from 'react';
import { FiUpload, FiTrash } from 'react-icons/fi';

interface HistoryRecord {
  id: string;
  fileName: string;
  size: string;
}

const Historico: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<HistoryRecord[]>([]);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  useEffect(() => {
    const mockData: HistoryRecord[] = [
      { id: '1', fileName: 'historicoCICLO2024.1', size: '129mb' },
      { id: '2', fileName: 'historicoCICLO2024.2', size: '140mb' },
      { id: '3', fileName: 'historicoCICLO2025.1', size: '135mb' },
    ];
    setUploadedFiles(mockData);
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      handleFiles(Array.from(event.target.files));
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    if (event.dataTransfer.files) {
      handleFiles(Array.from(event.dataTransfer.files));
    }
  };

  const handleFiles = (files: File[]) => {
    files.forEach(file => {
      const newRecord: HistoryRecord = {
        id: Date.now().toString(),
        fileName: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)}mb`,
      };
      setUploadedFiles(prev => [...prev, newRecord]);
    });
  };

  const handleDeleteFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col gap-6">

      <div className="bg-white p-6 py-8 shadow">
        <h1 className="text-2xl font-semibold text-gray-800">Importar histórico</h1>
      </div>

      <div className="flex flex-col bg-white gap-8 p-6 rounded-lg m-6">

        <div
          className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors duration-200
            ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            multiple
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="flex flex-col items-center justify-center">
              <FiUpload className="text-gray-400 text-5xl mb-4" />
              <p className="text-lg font-medium text-gray-700">Escolha um arquivo</p>
              <p className="text-sm text-gray-500 mt-2">
                Clique para procurar ou arraste e solte seu arquivo .xlsx ou .xls
              </p>
            </div>
          </label>
        </div>

        <div>
          <ul>
            <li className="p-4 border-b border-gray-200 text-gray-600 font-medium grid grid-cols-12 gap-4">
              <div className="col-span-8">Nome do arquivo</div>
              <div className="col-span-2 text-right hidden lg:block">Tamanho</div>
              <div className="col-span-2 text-center hidden lg:block">Ações</div>
            </li>

            {uploadedFiles.length === 0 ? (
              <li className="p-4 text-center text-gray-500 col-span-12">
                Nenhum histórico importado ainda.
              </li>
            ) : (
              uploadedFiles.map((record) => (
                <li
                  key={record.id}
                  className="p-4 border-b border-gray-200 hover:bg-gray-50 grid grid-cols-12 gap-4 items-center"
                >
                  <div className="col-span-8 text-gray-800 truncate max-w-[300px]">{record.fileName}</div>
                  <div className="col-span-2 text-right text-gray-600">{record.size}</div>
                  <div className="col-span-2 flex justify-center">
                    <button
                      onClick={() => handleDeleteFile(record.id)}
                      className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors"
                      aria-label={`Excluir ${record.fileName}`}
                    >
                      <FiTrash className="text-lg" />
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

      </div>
    </div>
  );
};

export default Historico;
