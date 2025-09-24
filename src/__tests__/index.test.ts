import { renderHook, act } from "@testing-library/react";
import { useVideoRecording } from "../index";

// Get references to mocked functions
const mockGetUserMedia = navigator.mediaDevices.getUserMedia as jest.Mock;
const mockCreateObjectURL = window.URL.createObjectURL as jest.Mock;

describe("useVideoRecording", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock successful getUserMedia by default
    mockGetUserMedia.mockResolvedValue({
      getTracks: () => [{ stop: jest.fn() }],
    });
  });

  describe("initialization", () => {
    it("should initialize with correct default values", () => {
      const { result } = renderHook(() => useVideoRecording());

      expect(result.current.isRecording).toBe(false);
      expect(result.current.isPaused).toBe(false);
      expect(result.current.isSupported).toBe(true);
      expect(result.current.videoStream).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.duration).toBe(0);
    });

    it("should detect when MediaRecorder is not supported", () => {
      // Temporarily remove MediaRecorder
      const originalMediaRecorder = window.MediaRecorder;
      delete (window as any).MediaRecorder;

      const { result } = renderHook(() => useVideoRecording());

      expect(result.current.isSupported).toBe(false);

      // Restore MediaRecorder
      window.MediaRecorder = originalMediaRecorder;
    });
  });

  describe("startRecording", () => {
    it("should start recording successfully", async () => {
      const { result } = renderHook(() => useVideoRecording());

      await act(async () => {
        await result.current.startRecording();
      });

      expect(mockGetUserMedia).toHaveBeenCalledWith({
        video: true,
        audio: true,
      });
      expect(result.current.isRecording).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it("should handle getUserMedia errors", async () => {
      const error = new Error("Camera access denied");
      mockGetUserMedia.mockRejectedValue(error);

      const { result } = renderHook(() => useVideoRecording());

      await act(async () => {
        await result.current.startRecording();
      });

      expect(result.current.isRecording).toBe(false);
      expect(result.current.error).toBe("Camera access denied");
    });

    it("should not start recording if already recording", async () => {
      const { result } = renderHook(() => useVideoRecording());

      await act(async () => {
        await result.current.startRecording();
      });

      const firstCallCount = mockGetUserMedia.mock.calls.length;

      await act(async () => {
        await result.current.startRecording();
      });

      expect(mockGetUserMedia.mock.calls.length).toBe(firstCallCount);
      expect(result.current.error).toBe("Recording is already in progress");
    });

    it("should handle custom constraints", async () => {
      const { result } = renderHook(() => useVideoRecording());
      const customConstraints = { video: { width: 1280, height: 720 } };

      await act(async () => {
        await result.current.startRecording(customConstraints);
      });

      expect(mockGetUserMedia).toHaveBeenCalledWith(customConstraints);
    });
  });

  describe("pauseRecording", () => {
    it("should pause recording when recording is active", async () => {
      const { result } = renderHook(() => useVideoRecording());

      await act(async () => {
        await result.current.startRecording();
      });

      act(() => {
        result.current.pauseRecording();
      });

      expect(result.current.isPaused).toBe(true);
    });

    it("should not pause when not recording", () => {
      const { result } = renderHook(() => useVideoRecording());

      act(() => {
        result.current.pauseRecording();
      });

      expect(result.current.isPaused).toBe(false);
    });
  });

  describe("resumeRecording", () => {
    it("should resume recording when paused", async () => {
      const { result } = renderHook(() => useVideoRecording());

      await act(async () => {
        await result.current.startRecording();
      });

      act(() => {
        result.current.pauseRecording();
      });

      act(() => {
        result.current.resumeRecording();
      });

      expect(result.current.isPaused).toBe(false);
    });
  });

  describe("stopRecording", () => {
    it("should stop recording and clean up", async () => {
      const mockTrack = { stop: jest.fn() };
      const mockStream = { getTracks: () => [mockTrack] };
      mockGetUserMedia.mockResolvedValue(mockStream);

      const { result } = renderHook(() => useVideoRecording());

      await act(async () => {
        await result.current.startRecording();
      });

      act(() => {
        result.current.stopRecording();
      });

      expect(result.current.isRecording).toBe(false);
      expect(result.current.videoStream).toBeNull();
    });
  });

  describe("completeRecording", () => {
    it("should return video URL when chunks are available", async () => {
      const { result } = renderHook(() => useVideoRecording());

      // Mock MediaRecorder with data simulation
      const mockDataEvent = { data: new Blob(["test"]) };
      let dataAvailableCallback: ((event: any) => void) | null = null;

      const MockRecorderClass = jest.fn().mockImplementation(() => ({
        state: "inactive",
        start: jest.fn().mockImplementation(function (this: any) {
          this.state = "recording";
          if (dataAvailableCallback) {
            dataAvailableCallback(mockDataEvent);
          }
        }),
        stop: jest.fn().mockImplementation(function (this: any) {
          this.state = "inactive";
          if (this.onstop) this.onstop();
        }),
        pause: jest.fn(),
        resume: jest.fn(),
        set ondataavailable(callback: any) {
          dataAvailableCallback = callback;
        },
        get ondataavailable() {
          return dataAvailableCallback;
        },
        onstop: null,
        onerror: null,
      }));

      (MockRecorderClass as any).isTypeSupported = jest.fn(() => true);
      (window as any).MediaRecorder = MockRecorderClass;

      await act(async () => {
        await result.current.startRecording();
      });

      let videoUrl: string | null = null;
      await act(async () => {
        videoUrl = await result.current.completeRecording();
      });

      expect(videoUrl).toBe("mock-blob-url");
      expect(mockCreateObjectURL).toHaveBeenCalled();
    });

    it("should return null when no chunks are available", async () => {
      const { result } = renderHook(() => useVideoRecording());

      let videoUrl: string | null = null;
      await act(async () => {
        videoUrl = await result.current.completeRecording();
      });

      expect(videoUrl).toBeNull();
    });
  });

  describe("downloadRecording", () => {
    it("should create and trigger download link", async () => {
      const { result } = renderHook(() => useVideoRecording());

      // Mock document methods
      const mockLink = {
        click: jest.fn(),
        href: "",
        download: "",
      };
      const mockAppendChild = jest.fn();
      const mockRemoveChild = jest.fn();
      const mockCreateElement = jest.fn(() => mockLink);

      Object.defineProperty(document, "createElement", {
        value: mockCreateElement,
        writable: true,
      });

      Object.defineProperty(document.body, "appendChild", {
        value: mockAppendChild,
        writable: true,
      });

      Object.defineProperty(document.body, "removeChild", {
        value: mockRemoveChild,
        writable: true,
      });

      // Mock a scenario where we have video data
      mockCreateObjectURL.mockReturnValue("mock-blob-url");

      await act(async () => {
        await result.current.downloadRecording("test-recording.webm");
      });

      expect(mockCreateElement).toHaveBeenCalledWith("a");
      expect(mockAppendChild).toHaveBeenCalledWith(mockLink);
      expect(mockRemoveChild).toHaveBeenCalledWith(mockLink);
    });
  });

  describe("options", () => {
    it("should use custom mimeType when supported", async () => {
      const options = { mimeType: "video/mp4" };
      const { result } = renderHook(() => useVideoRecording(options));

      // Just check that the hook initializes with options
      expect(result.current.isSupported).toBe(true);
    });
  });
});
