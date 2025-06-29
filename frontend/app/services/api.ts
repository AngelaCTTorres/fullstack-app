export interface Task {
       id: number;
       title: string;
       description: string;
       isCompleted: boolean;
       createdAt: string;
     }
     
     export interface CreateTaskRequest {
       title: string;
       description: string;
     }
     
     export interface UpdateTaskRequest {
       title: string;
       description: string;
       isCompleted: boolean;
     }
     
     class ApiService {
       private baseUrl: string;
     
       constructor() {

        this.baseUrl = import.meta.env.VITE_API_URL;
         // Configuración dinámica de la URL del backend
         /*this.baseUrl =
           typeof window !== 'undefined'
             ? (window.ENV?.API_URL || 'http://localhost:5234')
             : 'http://localhost:5234';*/ //desbloquear al usar local
             
            
       }
     
       private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
         const url = `${this.baseUrl}${endpoint}`;
     
         const config: RequestInit = {
           headers: {
             'Content-Type': 'application/json',
             ...options.headers,
           },
           ...options,
         };
     
         try {
           const response = await fetch(url, config);
     
           if (!response.ok) {
             throw new Error(`HTTP error! status: ${response.status}`);
           }
     
           const text = await response.text();
           return text ? JSON.parse(text) : null;
         } catch (error) {
           console.error(`API Error on ${endpoint}:`, error);
           throw error;
         }
       }
     
       async getTasks(): Promise<Task[]> {
         const data = await this.request<Task[]>('/api/tasks');
         return data ?? [];
       }
     
       async createTask(task: CreateTaskRequest): Promise<Task> {
         const data = await this.request<Task>('/api/tasks', {
           method: 'POST',
           body: JSON.stringify(task),
         });
         if (!data) throw new Error('Error creando tarea');
         return data;
       }
     
       async updateTask(id: number, task: UpdateTaskRequest): Promise<void> {
         await this.request<void>(`/api/tasks/${id}`, {
           method: 'PUT',
           body: JSON.stringify(task),
         });
       }
     
       async deleteTask(id: number): Promise<void> {
         await this.request<void>(`/api/tasks/${id}`, {
           method: 'DELETE',
         });
       }
     
       async getTaskStats(): Promise<{ total: number; completed: number; pending: number }> {
         const stats = await this.request<{ total: number; completed: number; pending: number }>(
           '/api/tasks/stats'
         );
         if (!stats) throw new Error('No se pudieron obtener estadísticas');
         return stats;
       }
     }
     
     export const apiService = new ApiService();
     