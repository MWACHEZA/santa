import { useState, useEffect, useCallback } from 'react';
import { ApiResponse } from '../services/api';

// Generic API hook for handling loading states and errors
export function useApi<T = any>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (apiCall: () => Promise<ApiResponse<T>>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall();
      
      if (response.success) {
        setData(response.data || null);
      } else {
        setError(response.message || 'An error occurred');
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
    setData,
    setError,
    setLoading
  };
}

// Specific hook for paginated data
export function usePaginatedApi<T = any>() {
  const [data, setData] = useState<T[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (apiCall: () => Promise<ApiResponse<any>>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall();
      
      if (response.success && response.data) {
        // Handle different response structures
        if (response.data.items) {
          setData(response.data.items);
        } else if (Array.isArray(response.data)) {
          setData(response.data);
        } else {
          // Check for common array property names
          const arrayData = response.data.news || 
                           response.data.events || 
                           response.data.announcements || 
                           response.data.users || 
                           response.data.categories || 
                           response.data.images || 
                           [];
          setData(arrayData);
        }
        
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      } else {
        setError(response.message || 'An error occurred');
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData([]);
    setPagination({ page: 1, limit: 10, total: 0, pages: 0 });
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    pagination,
    loading,
    error,
    execute,
    reset,
    setData,
    setPagination,
    setError,
    setLoading
  };
}

// Hook for form submissions
export function useApiSubmit<T = any>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submit = useCallback(async (apiCall: () => Promise<ApiResponse<T>>) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      const response = await apiCall();
      
      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.message || 'Submission failed');
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Submission failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
    setLoading(false);
  }, []);

  return {
    loading,
    error,
    success,
    submit,
    reset,
    setError,
    setSuccess
  };
}

// Hook for file uploads
export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  const upload = useCallback(async (apiCall: () => Promise<ApiResponse<any>>) => {
    try {
      setUploading(true);
      setError(null);
      setProgress(0);
      
      // Simulate progress for now (in a real implementation, you'd track actual upload progress)
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 100);
      
      const response = await apiCall();
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if (response.success) {
        if (response.data?.file) {
          setUploadedFiles(prev => [...prev, response.data.file]);
        } else if (response.data?.files) {
          setUploadedFiles(prev => [...prev, ...response.data.files]);
        }
      } else {
        setError(response.message || 'Upload failed');
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      throw err;
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000); // Reset progress after a delay
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setProgress(0);
    setUploading(false);
    setUploadedFiles([]);
  }, []);

  return {
    uploading,
    progress,
    error,
    uploadedFiles,
    upload,
    reset,
    setError,
    setUploadedFiles
  };
}

// Hook for real-time data (polling)
export function usePolling<T = any>(
  apiCall: () => Promise<ApiResponse<T>>,
  interval: number = 30000, // 30 seconds default
  enabled: boolean = true
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall();
      
      if (response.success) {
        setData(response.data || null);
      } else {
        setError(response.message || 'Failed to fetch data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    if (!enabled) return;

    // Initial fetch
    fetchData();

    // Set up polling
    const intervalId = setInterval(fetchData, interval);

    return () => clearInterval(intervalId);
  }, [fetchData, interval, enabled]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}

// Hook for optimistic updates
export function useOptimisticUpdate<T = any>() {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const optimisticAdd = useCallback((item: T, apiCall: () => Promise<ApiResponse<T>>) => {
    // Add item optimistically
    setData(prev => [...prev, item]);
    
    // Make API call
    apiCall()
      .then(response => {
        if (response.success && response.data) {
          // Replace optimistic item with real data
          setData(prev => prev.map(prevItem => 
            prevItem === item ? response.data as T : prevItem
          ));
        } else {
          // Remove optimistic item on failure
          setData(prev => prev.filter(prevItem => prevItem !== item));
          setError(response.message || 'Failed to add item');
        }
      })
      .catch(err => {
        // Remove optimistic item on error
        setData(prev => prev.filter(prevItem => prevItem !== item));
        setError(err.message || 'Failed to add item');
      });
  }, []);

  const optimisticUpdate = useCallback((
    id: string | number, 
    updates: Partial<T>, 
    apiCall: () => Promise<ApiResponse<T>>
  ) => {
    // Update item optimistically
    setData(prev => prev.map(item => 
      (item as any).id === id ? { ...item, ...updates } : item
    ));
    
    // Make API call
    apiCall()
      .then(response => {
        if (response.success && response.data) {
          // Replace with real data
          setData(prev => prev.map(item => 
            (item as any).id === id ? response.data as T : item
          ));
        } else {
          // Revert optimistic update on failure
          setData(prev => prev.map(item => 
            (item as any).id === id ? { ...item, ...updates } : item
          ));
          setError(response.message || 'Failed to update item');
        }
      })
      .catch(err => {
        // Revert optimistic update on error
        setData(prev => prev.map(item => 
          (item as any).id === id ? { ...item, ...updates } : item
        ));
        setError(err.message || 'Failed to update item');
      });
  }, []);

  const optimisticDelete = useCallback((
    id: string | number, 
    apiCall: () => Promise<ApiResponse<any>>
  ) => {
    // Find and store the item to delete
    const itemToDelete = data.find(item => (item as any).id === id);
    
    // Remove item optimistically
    setData(prev => prev.filter(item => (item as any).id !== id));
    
    // Make API call
    apiCall()
      .then(response => {
        if (!response.success) {
          // Restore item on failure
          if (itemToDelete) {
            setData(prev => [...prev, itemToDelete]);
          }
          setError(response.message || 'Failed to delete item');
        }
      })
      .catch(err => {
        // Restore item on error
        if (itemToDelete) {
          setData(prev => [...prev, itemToDelete]);
        }
        setError(err.message || 'Failed to delete item');
      });
  }, [data]);

  return {
    data,
    loading,
    error,
    setData,
    setLoading,
    setError,
    optimisticAdd,
    optimisticUpdate,
    optimisticDelete
  };
}

export default {
  useApi,
  usePaginatedApi,
  useApiSubmit,
  useFileUpload,
  usePolling,
  useOptimisticUpdate
};
