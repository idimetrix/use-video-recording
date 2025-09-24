import "@testing-library/jest-dom";

// Mock DOM APIs
Object.defineProperty(window, "URL", {
  value: {
    createObjectURL: jest.fn(() => "mock-blob-url"),
    revokeObjectURL: jest.fn(),
  },
  writable: true,
});

// Mock performance.now if not available
if (typeof performance === "undefined") {
  (global as any).performance = {
    now: jest.fn(() => Date.now()),
  };
}

// Mock MediaRecorder support detection
Object.defineProperty(window, "MediaRecorder", {
  value: class MockMediaRecorder {
    static isTypeSupported = jest.fn(() => true);

    state: "inactive" | "recording" | "paused" = "inactive";
    ondataavailable: ((event: any) => void) | null = null;
    onstop: (() => void) | null = null;
    onerror: ((event: any) => void) | null = null;

    constructor(_stream: MediaStream, _options?: MediaRecorderOptions) {
      this.state = "inactive";
    }

    start = jest.fn(() => {
      this.state = "recording";
    });

    stop = jest.fn(() => {
      this.state = "inactive";
      if (this.onstop) this.onstop();
    });

    pause = jest.fn(() => {
      this.state = "paused";
    });

    resume = jest.fn(() => {
      this.state = "recording";
    });
  },
  writable: true,
});

// Mock navigator.mediaDevices
Object.defineProperty(navigator, "mediaDevices", {
  value: {
    getUserMedia: jest.fn(),
  },
  writable: true,
});
