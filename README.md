# useVideoRecording

[![npm version](https://badge.fury.io/js/use-video-recording.svg)](https://badge.fury.io/js/use-video-recording)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-16.8+-61dafb.svg)](https://reactjs.org/)

A professional, feature-rich React hook for video recording with comprehensive MediaRecorder API support. Built with TypeScript, thoroughly tested, and production-ready.

## ✨ Features

- 🎥 **Full Recording Control** - Start, pause, resume, and stop video recording
- 🎛️ **Advanced Configuration** - Custom video/audio constraints and encoder options  
- 📱 **Cross-Platform** - Works with device cameras, screen sharing, and audio sources
- 🔄 **Real-time Feedback** - Live video stream preview and recording status
- 💾 **Download Support** - Built-in functionality to download recorded videos
- ⏱️ **Duration Tracking** - Real-time recording duration with pause handling
- 🚨 **Error Handling** - Comprehensive error states and user-friendly messages
- 🎯 **TypeScript** - Full type safety and IntelliSense support
- ⚡ **Performance** - Optimized with React hooks and memory management
- 🧪 **Well Tested** - Comprehensive test suite with 80%+ coverage

## 📦 Installation

```bash
# npm
npm install use-video-recording

# yarn
yarn add use-video-recording

# pnpm
pnpm add use-video-recording
```

## 🚀 Quick Start

```tsx
import React, { useRef } from 'react';
import { useVideoRecording } from 'use-video-recording';

function VideoRecorder() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const {
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    downloadRecording,
    isRecording,
    isPaused,
    isSupported,
    videoStream,
    error,
    duration
  } = useVideoRecording();

  // Connect video stream to video element
  React.useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream]);

  if (!isSupported) {
    return <div>Video recording is not supported in this browser</div>;
  }

  return (
    <div>
      <h2>Video Recorder</h2>
      
      {/* Live preview */}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        style={{ width: '100%', maxWidth: '500px', height: 'auto' }}
      />
      
      {/* Recording controls */}
      <div style={{ margin: '16px 0', display: 'flex', gap: '8px' }}>
        <button 
          onClick={() => startRecording()}
          disabled={isRecording}
        >
          Start Recording
        </button>
        
        <button 
          onClick={pauseRecording}
          disabled={!isRecording || isPaused}
        >
          Pause
        </button>
        
        <button 
          onClick={resumeRecording}
          disabled={!isRecording || !isPaused}
        >
          Resume
        </button>
        
        <button 
          onClick={stopRecording}
          disabled={!isRecording}
        >
          Stop
        </button>
        
        <button 
          onClick={() => downloadRecording()}
          disabled={isRecording}
        >
          Download
        </button>
      </div>
      
      {/* Status display */}
      <div>
        <p>Status: {isRecording ? (isPaused ? 'Paused' : 'Recording') : 'Stopped'}</p>
        <p>Duration: {duration}s</p>
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      </div>
    </div>
  );
}
```

## 📚 API Reference

### useVideoRecording(options?)

The main hook that provides video recording functionality.

#### Parameters

- `options` (optional): Configuration object with the following properties:
  - `mimeType?: string` - Video MIME type (e.g., 'video/webm', 'video/mp4')
  - `audioBitsPerSecond?: number` - Audio encoding bitrate
  - `videoBitsPerSecond?: number` - Video encoding bitrate  
  - `bitsPerSecond?: number` - Overall encoding bitrate

#### Returns

An object containing:

##### Methods

- **`startRecording(constraints?): Promise<void>`**
  - Starts video recording with optional media constraints
  - `constraints`: MediaStreamConstraints (default: `{ video: true, audio: true }`)

- **`pauseRecording(): void`**
  - Pauses the current recording

- **`resumeRecording(): void`**
  - Resumes a paused recording

- **`stopRecording(): void`**
  - Stops the current recording and cleans up resources

- **`completeRecording(): Promise<string | null>`**
  - Returns a blob URL for the recorded video

- **`downloadRecording(filename?): Promise<void>`**
  - Downloads the recorded video
  - `filename`: Optional filename (default: auto-generated)

##### State Properties

- **`isRecording: boolean`** - Whether recording is currently active
- **`isPaused: boolean`** - Whether recording is currently paused
- **`isSupported: boolean`** - Whether MediaRecorder is supported
- **`videoStream: MediaStream | null`** - Current video stream for preview
- **`error: string | null`** - Current error message, if any
- **`duration: number`** - Current recording duration in seconds

## 🔧 Advanced Usage

### Custom Video Constraints

```tsx
const { startRecording } = useVideoRecording();

// HD video recording
await startRecording({
  video: { 
    width: 1280, 
    height: 720,
    frameRate: 30
  },
  audio: true
});

// Screen sharing
const displayStream = await navigator.mediaDevices.getDisplayMedia({
  video: true,
  audio: true
});
```

### Custom Encoding Options

```tsx
const { startRecording } = useVideoRecording({
  mimeType: 'video/webm;codecs=vp9',
  videoBitsPerSecond: 2500000, // 2.5 Mbps
  audioBitsPerSecond: 128000   // 128 kbps
});
```

### Error Handling

```tsx
const { error, startRecording } = useVideoRecording();

React.useEffect(() => {
  if (error) {
    console.error('Recording error:', error);
    // Handle error (show notification, etc.)
  }
}, [error]);
```

### Recording with Custom Processing

```tsx
const { completeRecording } = useVideoRecording();

const handleSave = async () => {
  const videoUrl = await completeRecording();
  if (videoUrl) {
    // Upload to server, process, etc.
    const response = await fetch('/api/upload-video', {
      method: 'POST',
      body: await fetch(videoUrl).then(r => r.blob())
    });
  }
};
```

## 🌐 Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome/Chromium | ✅ 47+ | Full support |
| Firefox | ✅ 29+ | Full support |
| Safari | ✅ 14.1+ | Full support |
| Edge | ✅ 79+ | Full support |
| IE | ❌ | Not supported |

## 📋 Requirements

- React 16.8+ (hooks support)
- Modern browser with MediaRecorder API
- User permission for camera/microphone access
- HTTPS context (required for getUserMedia in production)

## 🧪 Testing

The package includes comprehensive tests covering all functionality:

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🛠️ Development

```bash
# Clone the repository
git clone https://github.com/idimetrix/use-video-recording.git

# Install dependencies
npm install

# Run tests
npm test

# Build the package
npm run build

# Run type checking
npm run typecheck
```

## 📝 Common Issues

### Camera Permission Denied
```tsx
const { error } = useVideoRecording();

// Check for permission errors
if (error?.includes('denied') || error?.includes('Permission')) {
  // Show user-friendly message about enabling camera access
}
```

### HTTPS Required
MediaRecorder API requires HTTPS in production. For local development, use `localhost` or enable HTTPS.

### Browser Compatibility
Always check `isSupported` before showing recording UI:

```tsx
const { isSupported } = useVideoRecording();

if (!isSupported) {
  return <div>Please use a modern browser that supports video recording</div>;
}
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Dmitrii Selikhov** - *Initial work* - [@idimetrix](https://github.com/idimetrix)

## 🙏 Acknowledgments

- Built with [tsup](https://tsup.egoist.dev/) for fast TypeScript bundling
- Tested with [Jest](https://jestjs.io/) and [React Testing Library](https://testing-library.com/react)
- Thanks to all contributors and the React community

## 🔗 Links

- [NPM Package](https://www.npmjs.com/package/use-video-recording)
- [GitHub Repository](https://github.com/idimetrix/use-video-recording)
- [Issues](https://github.com/idimetrix/use-video-recording/issues)
- [MediaRecorder API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)

---

<div align="center">
  
**⭐ Star this repository if it helped you! ⭐**

Made with ❤️ by [Dmitrii Selikhov](https://linkedin.com/in/dimetrix)

</div>