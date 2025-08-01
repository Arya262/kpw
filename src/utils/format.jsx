export const formatFileSize = (bytes) => {
    if (!bytes || isNaN(bytes)) return "1 KB"; 
  
    const kb = bytes / 1024;
    const mb = kb / 1024;
  
    if (mb >= 1) {
      const mbValue = Math.round(mb * 10) / 10;
      return `${mbValue % 1 === 0 ? mbValue.toFixed(0) : mbValue} MB`;
    }
  
    const kbValue = Math.max(1, Math.round(kb));
    return `${kbValue} KB`;
  };