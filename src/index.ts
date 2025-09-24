import { useState, useRef, useCallback, useEffect } from "react";

interface UseVideoRecordingOptions {
  mimeType?: string;
  audioBitsPerSecond?: number;
  videoBitsPerSecond?: number;
  bitsPerSecond?: number;
}

interface UseVideoRecording {
  startRecording: (constraints?: MediaStreamConstraints) => Promise<void>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  stopRecording: () => void;
  completeRecording: () => Promise<string | null>;
  downloadRecording: (filename?: string) => Promise<void>;
  isRecording: boolean;
  isPaused: boolean;
  isSupported: boolean;
  videoStream: MediaStream | null;
  error: string | null;
  duration: number;
}

export const useVideoRecording = (
  options: UseVideoRecordingOptions = {},
): UseVideoRecording => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const videoChunks = useRef<Blob[]>([]);
  const startTime = useRef<number>(0);
  const pausedTime = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check MediaRecorder support
  const isSupported =
    typeof window !== "undefined" &&
    "MediaRecorder" in window &&
    navigator?.mediaDevices?.getUserMedia !== undefined;

  // Cleanup function
  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop());
    }
    setVideoStream(null);
    setIsRecording(false);
    setIsPaused(false);
    setDuration(0);
    startTime.current = 0;
    pausedTime.current = 0;
  }, [videoStream]);

  const startRecording = useCallback(
    async (
      constraints: MediaStreamConstraints = { video: true, audio: true },
    ) => {
      if (!isSupported) {
        setError("MediaRecorder is not supported in this browser");
        return;
      }

      if (isRecording) {
        setError("Recording is already in progress");
        return;
      }

      try {
        setError(null);
        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        // Configure MediaRecorder options
        const recorderOptions: MediaRecorderOptions = {};
        if (
          options.mimeType &&
          MediaRecorder.isTypeSupported(options.mimeType)
        ) {
          recorderOptions.mimeType = options.mimeType;
        }
        if (options.audioBitsPerSecond)
          recorderOptions.audioBitsPerSecond = options.audioBitsPerSecond;
        if (options.videoBitsPerSecond)
          recorderOptions.videoBitsPerSecond = options.videoBitsPerSecond;
        if (options.bitsPerSecond)
          recorderOptions.bitsPerSecond = options.bitsPerSecond;

        const recorder = new MediaRecorder(stream, recorderOptions);
        mediaRecorder.current = recorder;
        setVideoStream(stream);
        videoChunks.current = [];
        startTime.current = Date.now();
        pausedTime.current = 0;

        recorder.ondataavailable = (event: BlobEvent) => {
          if (event.data.size > 0) {
            videoChunks.current.push(event.data);
          }
        };

        recorder.onstop = () => {
          cleanup();
        };

        recorder.onerror = (event) => {
          setError(
            `Recording error: ${event.error?.message || "Unknown error"}`,
          );
          cleanup();
        };

        recorder.start(1000); // Collect data every second
        setIsRecording(true);

        // Start duration timer
        intervalRef.current = setInterval(() => {
          if (startTime.current && !isPaused) {
            setDuration(
              Math.floor(
                (Date.now() - startTime.current - pausedTime.current) / 1000,
              ),
            );
          }
        }, 1000);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to access camera/microphone";
        setError(errorMessage);
        console.error("Error accessing media devices:", err);
      }
    },
    [isSupported, isRecording, isPaused, options, cleanup],
  );

  const pauseRecording = useCallback(() => {
    if (
      isRecording &&
      !isPaused &&
      mediaRecorder.current &&
      mediaRecorder.current.state === "recording"
    ) {
      mediaRecorder.current.pause();
      setIsPaused(true);
      pausedTime.current +=
        Date.now() - (startTime.current + pausedTime.current);
    }
  }, [isRecording, isPaused]);

  const resumeRecording = useCallback(() => {
    if (
      isRecording &&
      isPaused &&
      mediaRecorder.current &&
      mediaRecorder.current.state === "paused"
    ) {
      mediaRecorder.current.resume();
      setIsPaused(false);
      startTime.current = Date.now() - duration * 1000;
    }
  }, [isRecording, isPaused, duration]);

  const stopRecording = useCallback(() => {
    if (
      isRecording &&
      mediaRecorder.current &&
      mediaRecorder.current.state !== "inactive"
    ) {
      mediaRecorder.current.stop();
    }
  }, [isRecording]);

  const completeRecording = useCallback((): Promise<string | null> => {
    return new Promise((resolve) => {
      if (videoChunks.current.length > 0) {
        const mimeType = options.mimeType || "video/webm";
        const videoBlob = new Blob(videoChunks.current, { type: mimeType });
        const videoUrl = URL.createObjectURL(videoBlob);
        resolve(videoUrl);
      } else {
        resolve(null);
      }
    });
  }, [options.mimeType]);

  const downloadRecording = useCallback(
    async (filename = `recording-${Date.now()}.webm`) => {
      const videoUrl = await completeRecording();
      if (videoUrl) {
        const a = document.createElement("a");
        a.href = videoUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(videoUrl);
      }
    },
    [completeRecording],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    completeRecording,
    downloadRecording,
    isRecording,
    isPaused,
    isSupported,
    videoStream,
    error,
    duration,
  };
};
