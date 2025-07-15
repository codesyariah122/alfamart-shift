// src/context/ScheduleContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';
import { useQueryClient } from 'react-query';

const ScheduleContext = createContext();

export const useSchedule = () => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
};

// API Base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const ScheduleProvider = ({ children }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  // API Functions
  const scheduleAPI = {
    // Get schedules for specific month
    getSchedulesByMonth: async (year, month) => {
      const response = await fetch(
        `${API_BASE_URL}/schedules?year=${year}&month=${month + 1}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch schedules');
      }
      return response.json();
    },

    // Generate new schedule for a month
    generateSchedule: async (scheduleData) => {
      setIsGenerating(true);
      try {
        const response = await fetch(`${API_BASE_URL}/schedules/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(scheduleData),
        });
        
        if (!response.ok) {
          throw new Error('Failed to generate schedule');
        }
        
        const result = await response.json();
        
        // Invalidate and refetch schedule data
        queryClient.invalidateQueries(['schedules', scheduleData.year, scheduleData.month]);
        
        return result;
      } finally {
        setIsGenerating(false);
      }
    },

    // Save individual schedule entry
    saveScheduleEntry: async (scheduleEntry) => {
      const response = await fetch(`${API_BASE_URL}/schedules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleEntry),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save schedule entry');
      }
      
      return response.json();
    },

    // Update schedule entry
    updateScheduleEntry: async (scheduleId, scheduleEntry) => {
      const response = await fetch(`${API_BASE_URL}/schedules/${scheduleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleEntry),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update schedule entry');
      }
      
      return response.json();
    },

    // Delete schedule for a month
    deleteMonthSchedule: async (year, month) => {
      const response = await fetch(
        `${API_BASE_URL}/schedules?year=${year}&month=${month + 1}`,
        { method: 'DELETE' }
      );
      
      if (!response.ok) {
        throw new Error('Failed to delete schedule');
      }
      
      return response.json();
    },

    // Get employees
    getEmployees: async () => {
      const response = await fetch(`${API_BASE_URL}/employees`);
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      return response.json();
    },

    // Get shift types
    getShiftTypes: async () => {
      const response = await fetch(`${API_BASE_URL}/shift-types`);
      if (!response.ok) {
        throw new Error('Failed to fetch shift types');
      }
      return response.json();
    }
  };

  // Generate schedule and sync with database
  const generateAndSaveSchedule = useCallback(async (generateParams) => {
    try {
      const { year, month, employees, shiftTypes, rules } = generateParams;
      
      // Prepare schedule data
      const scheduleData = {
        year,
        month,
        employees,
        shiftTypes,
        rules,
        generated_at: new Date().toISOString(),
        generated_by: 'system' // atau user ID yang sedang login
      };

      // Call API to generate schedule
      const result = await scheduleAPI.generateSchedule(scheduleData);
      
      // Update current month to match generated schedule
      setCurrentMonth(new Date(year, month - 1, 1));
      
      return result;
    } catch (error) {
      console.error('Error generating schedule:', error);
      throw error;
    }
  }, [queryClient]);

  // Change current month and invalidate cache
  const changeMonth = useCallback((newMonth) => {
    setCurrentMonth(newMonth);
    
    // Invalidate cache for the new month
    const year = newMonth.getFullYear();
    const month = newMonth.getMonth();
    queryClient.invalidateQueries(['schedules', year, month]);
  }, [queryClient]);

  // Refresh current month data
  const refreshCurrentMonth = useCallback(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    queryClient.invalidateQueries(['schedules', year, month]);
  }, [currentMonth, queryClient]);

  const value = {
    // State
    currentMonth,
    isGenerating,
    
    // API functions
    scheduleAPI,
    
    // Actions
    generateAndSaveSchedule,
    changeMonth,
    refreshCurrentMonth,
    setCurrentMonth,
    
    // Helper functions
    getCurrentMonthKey: () => ({
      year: currentMonth.getFullYear(),
      month: currentMonth.getMonth()
    }),
    
    formatMonthKey: (year, month) => `${year}-${String(month + 1).padStart(2, '0')}`,
  };

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
};