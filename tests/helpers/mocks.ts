import { vi } from 'vitest';

export function createMockPuppeteer() {
  const mockPage = {
    setViewport: vi.fn().mockResolvedValue(undefined),
    setContent: vi.fn().mockResolvedValue(undefined),
    pdf: vi.fn().mockResolvedValue(Buffer.from('%PDF-1.4 mock')),
    close: vi.fn().mockResolvedValue(undefined),
  };

  const mockBrowser = {
    newPage: vi.fn().mockResolvedValue(mockPage),
    close: vi.fn().mockResolvedValue(undefined),
    on: vi.fn(),
  };

  return {
    launch: vi.fn().mockResolvedValue(mockBrowser),
    mockBrowser,
    mockPage,
  };
}
