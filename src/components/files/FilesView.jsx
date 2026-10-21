import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { api, getFileUrl } from '../../services/api';
import {
  FolderGit2, Search, Upload, FileText, FileCode, Image, FileArchive,
  Download, Filter, Check, Eye
} from 'lucide-react';

export const FilesView = () => {
  const { files, loadFiles } = useApp();
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('all');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('brandId', brandFilter === 'all' ? 'shared' : brandFilter);
      await api.uploadFile(formData);
      await loadFiles();
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (name) => {
    const ext = name?.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp', 'svg'].includes(ext)) {
      return <Image className="w-5 h-5 text-blue-500" />;
    }
    if (['zip', 'rar', 'tar', 'gz'].includes(ext)) {
      return <FileArchive className="w-5 h-5 text-amber-500" />;
    }
    if (['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json'].includes(ext)) {
      return <FileCode className="w-5 h-5 text-emerald-500" />;
    }
    return <FileText className="w-5 h-5 text-purple-500" />;
  };

  const filteredFiles = files.filter(f => {
    const matchesBrand = brandFilter === 'all' || f.brandId === brandFilter || f.brandId === 'shared';
    const matchesSearch = !search || f.name?.toLowerCase().includes(search.toLowerCase());
    return matchesBrand && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F5F5F5] dark:bg-[#1E1E1E] min-w-0 overflow-hidden select-none">
      {/* Header */}
      <header className="h-14 bg-white dark:bg-[#252525] border-b border-gray-200 dark:border-gray-800 px-4 md:px-6 flex items-center justify-between flex-wrap gap-2 flex-none shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center">
            <FolderGit2 className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm md:text-base text-gray-900 dark:text-white">
              Company Files
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Upload input trigger */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs text-white bg-[#5B5FC7] hover:bg-[#4F52B2] shadow-sm transition-all cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{uploading ? 'Uploading...' : 'Upload File'}</span>
          </button>
        </div>
      </header>

      {/* Filter and Search Bar */}
      <div className="p-4 md:px-6 bg-white dark:bg-[#252525] border-b border-gray-200/80 dark:border-gray-800 flex items-center justify-between gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by file name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Brand Filter Pills */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-gray-400 font-semibold mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            Brand:
          </span>
          {['all', 'wegrow', 'skillcampus', 'bschool'].map(b => (
            <button
              type="button"
              key={b}
              onClick={() => setBrandFilter(b)}
              className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-all ${
                brandFilter === b
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Files List / Table */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {filteredFiles.length === 0 ? (
          <div className="text-center py-16 text-gray-400 dark:text-gray-500 text-xs">
            No files found matching your filters.
          </div>
        ) : (
          <div className="bg-white dark:bg-[#282828] rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/75 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 font-bold">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Brand</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Uploaded By</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                {filteredFiles.map(file => (
                  <tr
                    key={file._id}
                    className="hover:bg-gray-50/60 dark:hover:bg-gray-700/20 transition-all text-gray-800 dark:text-gray-200"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {getFileIcon(file.name)}
                        <span className="font-bold truncate max-w-xs">{file.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 capitalize">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        {file.brandId}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                      {formatSize(file.size)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-5 h-5 rounded-full text-white text-[9px] font-bold flex items-center justify-center shadow-xs"
                          style={{ backgroundColor: file.uploader?.color || '#5B5FC7' }}
                        >
                          {file.uploader?.name?.substring(0, 2).toUpperCase() || 'WX'}
                        </div>
                        <span className="truncate">{file.uploader?.name || 'Team Member'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-400">
                      {new Date(file.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <a
                        href={getFileUrl(file.url)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
