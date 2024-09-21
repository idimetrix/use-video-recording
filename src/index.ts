import { useState, useRef } from 'react';

interface UseVideoRecording {
    startRecording: () => void;
    pauseRecording: () => void;
    resumeRecording: () => void;
    stopRecording: () => void;
    completeRecording: () => Promise<string | null>;
    isRecording: boolean;
    isPaused: boolean;
    videoStream: MediaStream | null;
}

export const useVideoRecording = (): UseVideoRecording => {
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const videoChunks = useRef<Blob[]>([]);

    const startRecording = async () => {
        if (!isRecording && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                mediaRecorder.current = new MediaRecorder(stream);
                setVideoStream(stream);
                videoChunks.current = [];

                mediaRecorder.current.ondataavailable = (event: BlobEvent) => {
                    videoChunks.current.push(event.data);
                };

                mediaRecorder.current.onstop = () => {
                    setIsRecording(false);
                    setIsPaused(false);
                    stream.getTracks().forEach(track => track.stop());
                    setVideoStream(null);
                };

                mediaRecorder.current.start();
                setIsRecording(true);
            } catch (error) {
                console.error('Error accessing camera', error);
            }
        }
    };

    const pauseRecording = () => {
        if (isRecording && !isPaused && mediaRecorder.current) {
            mediaRecorder.current.pause();
            setIsPaused(true);
        }
    };

    const resumeRecording = () => {
        if (isRecording && isPaused && mediaRecorder.current) {
            mediaRecorder.current.resume();
            setIsPaused(false);
        }
    };

    const stopRecording = () => {
        if (isRecording && mediaRecorder.current) {
            mediaRecorder.current.stop();
            setIsRecording(false);
        }
    };

    const completeRecording = (): Promise<string | null> => {
        return new Promise((resolve) => {
            if (videoChunks.current.length > 0) {
                const videoBlob = new Blob(videoChunks.current, { type: 'video/webm' });
                const videoUrl = URL.createObjectURL(videoBlob);
                resolve(videoUrl);
            } else {
                resolve(null);
            }
        });
    };

    return {
        startRecording,
        pauseRecording,
        resumeRecording,
        stopRecording,
        completeRecording,
        isRecording,
        isPaused,
        videoStream,
    };
};
