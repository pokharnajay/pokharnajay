export type Scene = {
  elements: any[];
  appState: Record<string, any>;
  files: Record<string, any>;
};

export type DiagramMeta = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
};

export type Diagram = DiagramMeta & { scene: Scene };

export const emptyScene = (): Scene => ({ elements: [], appState: {}, files: {} });
