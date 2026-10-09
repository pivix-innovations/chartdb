import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

if (typeof globalThis.localStorage === 'undefined') {
    const values = new Map<string, string>();
    const memoryStorage: Storage = {
        get length() {
            return values.size;
        },
        clear: () => values.clear(),
        getItem: (key) => values.get(key) ?? null,
        key: (index) => Array.from(values.keys())[index] ?? null,
        removeItem: (key) => values.delete(key),
        setItem: (key, value) => values.set(String(key), String(value)),
    };
    Object.defineProperty(globalThis, 'localStorage', {
        configurable: true,
        value: memoryStorage,
    });
}

expect.extend(matchers);

afterEach(() => {
    cleanup();
});
