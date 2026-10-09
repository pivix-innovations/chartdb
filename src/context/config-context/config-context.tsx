import { createContext } from 'react';
import { emptyFn } from '@/lib/utils';
import type { DesignDBConfig } from '@/lib/domain/config';

export interface ConfigContext {
    config?: DesignDBConfig;
    updateConfig: (params: {
        config?: Partial<DesignDBConfig>;
        updateFn?: (config: DesignDBConfig) => DesignDBConfig;
    }) => Promise<void>;
}

export const ConfigContext = createContext<ConfigContext>({
    config: undefined,
    updateConfig: emptyFn,
});
