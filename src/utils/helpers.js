/**
 * Mengubah path file lokal Windows menjadi URL yang aman untuk browser/Electron
 * Contoh: "C:\Gambar\foto.jpg" -> "local-resource:///C:/Gambar/foto.jpg"
 */
export const toLocalResourceUrl = (filePath) => {
  if (!filePath) return '';

  const normalized = filePath.replace(/\\/g, '/');
  return `local-resource:///${encodeURI(normalized)}`;
};

/**
 * Memformat ukuran file bytes menjadi KB atau MB
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 KB';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

/**
 * Mendapatkan nama file tanpa ekstensi dari objek File
 */
export const getFileNameWithoutExt = (fileName) => {
  return fileName.split('.').slice(0, -1).join('.');
};