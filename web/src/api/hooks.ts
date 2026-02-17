import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { apiClient } from './client';
import type { CreateWorkspaceRequest, Workspace } from '../types';

// Query keys as constants for consistency
export const workspaceKeys = {
  all: ['workspaces'] as const,
  detail: (name: string) => ['workspaces', name] as const,
};

export const templateKeys = {
  all: ['templates'] as const,
};

// SSE configuration
const SSE_CONFIG = {
  maxRetries: 5,
  baseDelay: 1000,
  maxDelay: 30000,
} as const;

/**
 * SSE hook for real-time workspace updates with exponential backoff
 */
export function useWorkspaceSSE() {
  const queryClient = useQueryClient();
  const retryCountRef = useRef(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let isMounted = true;

    const connect = () => {
      if (!isMounted) return;

      // Clean up existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const eventSource = new EventSource('/api/v1/events');
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        retryCountRef.current = 0; // Reset retry count on successful connection
        console.log('SSE connection established');
      };

      eventSource.onmessage = (event) => {
        try {
          const { type, data } = JSON.parse(event.data);
          if (type === 'workspaces') {
            // Update the workspaces list cache
            queryClient.setQueryData(workspaceKeys.all, data as Workspace[]);
            
            // Also update individual workspace detail caches
            (data as Workspace[]).forEach((workspace) => {
              queryClient.setQueryData(
                workspaceKeys.detail(workspace.metadata.name),
                workspace
              );
            });
            
            console.log(`SSE: Updated ${(data as Workspace[]).length} workspaces`);
          }
        } catch (err) {
          console.error('Failed to parse SSE event:', err);
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        eventSourceRef.current = null;

        if (!isMounted) return;

        // Exponential backoff with max retries
        if (retryCountRef.current < SSE_CONFIG.maxRetries) {
          const delay = Math.min(
            SSE_CONFIG.baseDelay * Math.pow(2, retryCountRef.current),
            SSE_CONFIG.maxDelay
          );
          retryCountRef.current++;
          console.warn(`SSE connection error, retrying in ${delay}ms (attempt ${retryCountRef.current}/${SSE_CONFIG.maxRetries})`);
          timeoutRef.current = setTimeout(connect, delay);
        } else {
          console.error('SSE max retries reached, falling back to polling');
        }
      };
    };

    connect();

    return () => {
      isMounted = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [queryClient]);
}

export function useTemplates() {
  return useQuery({
    queryKey: templateKeys.all,
    queryFn: () => apiClient.listTemplates(),
    staleTime: 5 * 60 * 1000, // 5 minutes - templates don't change often
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
}

export function useWorkspaces() {
  useWorkspaceSSE();

  return useQuery({
    queryKey: workspaceKeys.all,
    queryFn: () => apiClient.listWorkspaces(),
    staleTime: Infinity, // SSE keeps data fresh
    refetchOnWindowFocus: false, // SSE handles updates
  });
}

export function useWorkspace(name: string) {
  useWorkspaceSSE(); // Connect to SSE for real-time updates

  return useQuery({
    queryKey: workspaceKeys.detail(name),
    queryFn: () => apiClient.getWorkspace(name),
    enabled: Boolean(name),
    staleTime: Infinity, // SSE keeps data fresh
    refetchOnWindowFocus: false, // SSE handles updates
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWorkspaceRequest) => apiClient.createWorkspace(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
    },
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => apiClient.deleteWorkspace(name),
    // Optimistic update
    onMutate: async (name) => {
      await queryClient.cancelQueries({ queryKey: workspaceKeys.all });
      const previousWorkspaces = queryClient.getQueryData<Workspace[]>(workspaceKeys.all);
      
      queryClient.setQueryData<Workspace[]>(workspaceKeys.all, (old) =>
        old?.filter((ws) => ws.metadata.name !== name) ?? []
      );
      
      return { previousWorkspaces };
    },
    onError: (_err, _name, context) => {
      // Rollback on error
      if (context?.previousWorkspaces) {
        queryClient.setQueryData(workspaceKeys.all, context.previousWorkspaces);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
    },
  });
}

export function useStartWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => apiClient.startWorkspace(name),
    // Optimistic update - SSE will provide the real update
    onMutate: async (name) => {
      await queryClient.cancelQueries({ queryKey: workspaceKeys.all });
      const previousWorkspaces = queryClient.getQueryData<Workspace[]>(workspaceKeys.all);
      
      queryClient.setQueryData<Workspace[]>(workspaceKeys.all, (old) =>
        old?.map((ws) =>
          ws.metadata.name === name
            ? { ...ws, spec: { ...ws.spec, desiredStatus: 'Running' as const } }
            : ws
        ) ?? []
      );
      
      return { previousWorkspaces };
    },
    onError: (_err, _name, context) => {
      if (context?.previousWorkspaces) {
        queryClient.setQueryData(workspaceKeys.all, context.previousWorkspaces);
      }
    },
    // Don't invalidate - let SSE handle the real update
  });
}

export function useStopWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => apiClient.stopWorkspace(name),
    // Optimistic update - SSE will provide the real update
    onMutate: async (name) => {
      await queryClient.cancelQueries({ queryKey: workspaceKeys.all });
      const previousWorkspaces = queryClient.getQueryData<Workspace[]>(workspaceKeys.all);
      
      queryClient.setQueryData<Workspace[]>(workspaceKeys.all, (old) =>
        old?.map((ws) =>
          ws.metadata.name === name
            ? { ...ws, spec: { ...ws.spec, desiredStatus: 'Stopped' as const } }
            : ws
        ) ?? []
      );
      
      return { previousWorkspaces };
    },
    onError: (_err, _name, context) => {
      if (context?.previousWorkspaces) {
        queryClient.setQueryData(workspaceKeys.all, context.previousWorkspaces);
      }
    },
    // Don't invalidate - let SSE handle the real update
  });
}
