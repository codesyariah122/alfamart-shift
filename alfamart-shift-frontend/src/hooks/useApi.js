import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../config/api';
import toast from 'react-hot-toast';

// Schedule hooks
export const useSchedules = (month, year) => {
  return useQuery(
    ['schedules', month, year],
    () => api.get(`/schedules?month=${month}&year=${year}`).then(res => res.data),
    {
      enabled: !!month && !!year,
    }
  );
};

export const useGenerateSchedule = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (data) => api.post('/schedules/generate', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['schedules']);
        toast.success('Jadwal berhasil di-generate!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Gagal generate jadwal');
      },
    }
  );
};

export const useDailySchedule = (date) => {
  return useQuery(
    ['dailySchedule', date],
    () => api.get(`/schedules/daily?date=${date}`).then(res => res.data),
    {
      enabled: !!date,
    }
  );
};

// Employee hooks
export const useEmployees = () => {
  return useQuery(
    ['employees'],
    () => api.get('/employees').then(res => res.data)
  );
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, data }) => api.put(`/employees/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['employees']);
        toast.success('Data karyawan berhasil diupdate!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Gagal update karyawan');
      },
    }
  );
};

// Store hooks
export const useUpdateStoreSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, data }) => api.put(`/stores/${id}/settings`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['stores']);
        toast.success('Pengaturan berhasil disimpan!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Gagal simpan pengaturan');
      },
    }
  );
};