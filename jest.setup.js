import '@testing-library/jest-dom';

// Mock the ResizeObserver
global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// Mock window.scrollTo
window.scrollTo = jest.fn();

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
};

// Mock fetch
global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({}),
        ok: true,
    })
); 