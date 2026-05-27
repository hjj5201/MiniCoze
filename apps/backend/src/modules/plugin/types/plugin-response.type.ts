export interface PluginResponse {
  id: string;
  type: string;
  name: string;
  description: string;
  tools: Array<{
    name: string;
    description: string;
  }>;
  createdAt: string;
  updatedAt: string;
}
