# use-video-recording

A powerful and easy-to-use React hook for video recording functionality. This hook provides a complete interface for recording video using the MediaRecorder API with support for pause, resume, and stop operations.

## Features

- 🎥 Start, pause, resume, and stop video recording
- 🎛️ Complete control over recording state
- 📱 Works with device cameras
- 🔄 Real-time video stream access
- 💾 Generate video blobs for download or upload
- 🎯 TypeScript support
- ⚡ Lightweight and performant

## Installation

```bash
# npm
npm install use-video-recording

# yarn
yarn add use-video-recording

# pnpm
pnpm add use-video-recording
```

## Quick Start

```tsx
import React, { useRef, useState } from 'react';
import { useVideoRecording } from 'use-video-recording';

const VideoRecorder: React.FC = () => {
    const {
        startRecording,
        pauseRecording,
        resumeRecording,
        stopRecording,
        completeRecording,
        isRecording,
        isPaused,
        videoStream
    } = useVideoRecording();

    const [videoSrc, setVideoSrc] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const handleComplete = async () => {
        const videoUrl = await completeRecording();
        setVideoSrc(videoUrl);
    };

    return (
        <div>
            <h2>Video Recorder</h2>
            
            {/* Live preview */}
            {videoStream && (
                <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    style={{ width: '400px', height: '300px', border: '1px solid #ccc' }}
                    srcObject={videoStream}
                />
            )}

            {/* Controls */}
            <div style={{ margin: '10px 0' }}>
                <button onClick={startRecording} disabled={isRecording}>
                    Start Recording
                </button>
                <button onClick={pauseRecording} disabled={!isRecording || isPaused}>
                    Pause
                </button>
                <button onClick={resumeRecording} disabled={!isRecording || !isPaused}>
                    Resume
                </button>
                <button onClick={stopRecording} disabled={!isRecording}>
                    Stop
                </button>
                <button onClick={handleComplete}>
                    Complete & Generate Video
                </button>
            </div>

            {/* Recording status */}
            <div>
                Status: {isRecording ? (isPaused ? 'Paused' : 'Recording') : 'Stopped'}
            </div>

            {/* Recorded video playback */}
            {videoSrc && (
                <div style={{ marginTop: '20px' }}>
                    <h3>Recorded Video:</h3>
                    <video 
                        controls 
                        src={videoSrc} 
                        style={{ width: '400px', height: '300px', border: '1px solid #ccc' }}
                    />
                </div>
            )}
        </div>
    );
};

export default VideoRecorder;
```

## API Reference

### useVideoRecording()

Returns an object with the following properties and methods:

#### Methods

- **`startRecording(): void`** - Starts video recording from the user's camera
- **`pauseRecording(): void`** - Pauses the current recording
- **`resumeRecording(): void`** - Resumes a paused recording
- **`stopRecording(): void`** - Stops the current recording
- **`completeRecording(): Promise<string | null>`** - Generates a video URL from recorded chunks

#### State Properties

- **`isRecording: boolean`** - Whether recording is currently active
- **`isPaused: boolean`** - Whether recording is currently paused
- **`videoStream: MediaStream | null`** - The current video stream for live preview

## Advanced Usage

### Downloading Recorded Video

```tsx
const handleDownload = async () => {
    const videoUrl = await completeRecording();
    if (videoUrl) {
        const a = document.createElement('a');
        a.href = videoUrl;
        a.download = `recording-${Date.now()}.webm`;
        a.click();
    }
};
```

### Custom Recording Options

```tsx
// The hook uses default MediaRecorder options, but you can extend functionality
// by accessing the videoStream and creating your own MediaRecorder instance
```

## Browser Compatibility

- Chrome/Chromium 47+
- Firefox 29+
- Safari 14.1+
- Edge 79+

## Requirements

- React 16.8+ (hooks support)
- Modern browser with MediaRecorder API support
- User permission for camera access

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [Dmitrii Selikhov](https://github.com/idimetrix)

## Links

- [NPM Package](https://www.npmjs.com/package/use-video-recording)
- [GitHub Repository](https://github.com/idimetrix/use-video-recording)
- [Issues](https://github.com/idimetrix/use-video-recording/issues)
