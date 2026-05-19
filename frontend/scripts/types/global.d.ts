declare const __API_BASE_URL__: string;

declare global {
  interface Window {
    api: import('../api').ApiClient;
    router: import('../router').Router;
    bootstrap: typeof import('bootstrap');
    operationsFilter: import('./models').OperationsFilter;
    getOperationsFilterParams: () => Record<string, string>;
    initDashboard?: () => Promise<void>;
    __loginInitialized?: boolean;
    __registerInitialized?: boolean;
  }

  interface Event {
    readonly relatedTarget: EventTarget | null;
  }
}

export {};
