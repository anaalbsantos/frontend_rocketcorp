import React, { useState } from 'react';
import { FiUpload, FiTrash } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface HistoryRecord {
  id: string;
  fileName: string;
  size: string;
}

const Historico: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<HistoryRecord[]>([]);
  const [filesParaEnviar, setFilesParaEnviar] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

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
    if (files.length > 10) {
      toast.error('Você só pode selecionar até 10 arquivos por vez.');
      return;
    }

    const novosRegistros: HistoryRecord[] = files.map((file) => ({
      id: Date.now().toString() + Math.random(),
      fileName: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(2)}mb`,
    }));

    setUploadedFiles((prev) => [...prev, ...novosRegistros]);
    setFilesParaEnviar((prev) => [...prev, ...files]);
  };

  const handleDeleteFile = (id: string) => {
    setUploadedFiles((prevUploaded) => {
      const indexToRemove = prevUploaded.findIndex((file) => file.id === id);
      if (indexToRemove === -1) return prevUploaded;

      setFilesParaEnviar((prevFiles) =>
        prevFiles.filter((_, index) => index !== indexToRemove)
      );

      return prevUploaded.filter((file) => file.id !== id);
    });
  };

  const enviarArquivos = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      toast.error('Token não encontrado.');
      return;
    }

    if (filesParaEnviar.length === 0) {
      toast.error('Nenhum arquivo selecionado para envio.');
      return;
    }

    const formData = new FormData();
    filesParaEnviar.forEach((file) => {
      formData.append('files', file);
    });

    const uploadPromise = fetch('http://localhost:3000/etl/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }).then(async (response) => {
      if (!response.ok) {
        const erro = await response.text();
        throw new Error(`Erro no upload: ${erro}`);
      }
      return response;
    });

    try {
      await toast.promise(uploadPromise, {
        loading: 'Enviando arquivos...',
        success: 'Upload realizado com sucesso!',
        error: (err) => err.message || 'Erro ao enviar os arquivos.',
      });

      setUploadedFiles([]);
      setFilesParaEnviar([]);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col gap-6">
      <div className="bg-white p-6 py-8 shadow">
        <h1 className="text-2xl font-normal text-gray-800">Importar histórico</h1>
      </div>

      <div className="flex flex-col bg-white gap-8 p-6 rounded-lg m-6">
        <div
          className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors duration-200 ${
            isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
          }`}
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
              <p className="text-lg font-medium text-gray-700">Envie até 10 arquivos</p>
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
                Nenhum arquivo selecionado
              </li>
            ) : (
              uploadedFiles.map((record) => (
                <li
                  key={record.id}
                  className="p-4 border-b border-gray-200 hover:bg-gray-50 grid grid-cols-12 gap-1 items-center"
                >
                  <div className="col-span-8 text-gray-800 truncate max-w-[300px] phone:max-w-[200px] phone:overflow-x-auto phone:whitespace-nowrap phone:pr-2" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {record.fileName}
                  </div>
                  <div className="col-span-2 text-right text-gray-600">{record.size}</div>
                  <div className="col-span-2 flex justify-center">
                    <button
                      onClick={() => handleDeleteFile(record.id)}
                      className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors phone:-mr-8"
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

        <div className="flex justify-end">
          <button
            onClick={enviarArquivos}
            className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
          >
            Enviar arquivos
          </button>
        </div>
      </div>
    </div>
  );
};

export default Historico;
