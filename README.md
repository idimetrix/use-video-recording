# use-video-recording

Use Video Recording

## Installation

To install the package, use npm:

```bash
pnpm add use-video-recording

yarn install use-video-recording

npm install use-video-recording
```

## Usage

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
            <video ref={videoRef} autoPlay playsInline muted style={{ width: '400px', height: '300px' }}>
                {videoStream && <source src={URL.createObjectURL(videoStream)} />}
            </video>

            <div>
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
                    Complete
                </button>
            </div>

            {videoSrc && (
                <div>
                    <h3>Recorded Video:</h3>
                    <video controls src={videoSrc} style={{ width: '400px', height: '300px' }}></video>
                </div>
            )}
        </div>
    );
};

export default VideoRecorder;
```

## tsup
Bundle your TypeScript library with no config, powered by esbuild.

https://tsup.egoist.dev/

## How to use this
1. install dependencies
```
# pnpm
$ pnpm install

# yarn
$ yarn install

# npm
$ npm install
```
2. Add your code to `src`
3. Add export statement to `src/index.ts`
4. Test build command to build `src`.
Once the command works properly, you will see `dist` folder.

```zsh
# pnpm
$ pnpm run build

# yarn
$ yarn run build

# npm
$ npm run build
```
5. Publish your package

```zsh
$ npm publish
```


## test package
https://www.npmjs.com/package/use-video-recording
