// =========================================
// AUDIO MANAGEMENT FOR SONGFORGE
// =========================================

// Audio system state
window.SongForge.audio = {
    beatAudio: null,
    vocalAudio: null,
    isRecording: false,
    isPaused: false,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    beatVolume: 0.7,
    vocalVolume: 0.8,
    beatMuted: false,
    vocalMuted: false,
    beatSolo: false,
    vocalSolo: false,
    recordings: [],
    activeRecording: null,
    analyser: null,
    dataArray: null
};

// =========================================
// AUDIO INITIALIZATION
// =========================================

/**
 * Initialize audio system
 */
function initializeAudio() {
    setupAudioControls();
    setupVolumeControls();
    setupRecordingControls();
    setupDragAndDrop();
    
    // Check microphone permissions
    checkMicrophonePermissions();
    
    console.log('Audio system initialized');
}

/**
 * Check microphone permissions
 */
async function checkMicrophonePermissions() {
    try {
        if (navigator.permissions) {
            const permission = await navigator.permissions.query({ name: 'microphone' });
            console.log('Microphone permission:', permission.state);
            
            permission.addEventListener('change', () => {
                console.log('Microphone permission changed:', permission.state);
                updateRecordingUI();
            });
        }
    } catch (error) {
        console.log('Permission API not supported');
    }
}

// =========================================
// BEAT FILE HANDLING
// =========================================

/**
 * Handle beat file upload
 */
async function handleBeatFile(file) {
    try {
        // Validate file
        if (!validateAudioFile(file)) {
            showNotification('Please select a valid audio file (MP3, WAV, OGG)', 'error');
            return false;
        }
        
        // Check file size (150MB limit)
        if (file.size > 150 * 1024 * 1024) {
            showNotification('File size must be less than 150MB', 'error');
            return false;
        }
        
        showLoadingNotification('Loading beat file...');
        
        // Create audio element
        const audio = new Audio();
        const url = URL.createObjectURL(file);
        
        // Wait for audio to load
        await new Promise((resolve, reject) => {
            audio.addEventListener('loadedmetadata', resolve);
            audio.addEventListener('error', reject);
            audio.src = url;
        });
        
        // Store beat information
        window.SongForge.audio.beatAudio = audio;
        window.SongForge.currentProject.beatFile = {
            name: file.name,
            url: url,
            file: file,
            duration: audio.duration,
            size: file.size
        };
        
        // Update UI
        updateBeatUI(file, audio.duration);
        
        // Setup audio visualization
        setupAudioVisualization(audio);
        
        hideLoadingNotification();
        showNotification('Beat loaded successfully!', 'success');
        
        return true;
        
    } catch (error) {
        hideLoadingNotification();
        handleError(error, 'Beat file loading');
        return false;
    }
}

/**
 * Remove beat file
 */
function removeBeatFile() {
    if (window.SongForge.audio.beatAudio) {
        // Stop playback
        stopAudio();
        
        // Clean up
        if (window.SongForge.currentProject.beatFile) {
            URL.revokeObjectURL(window.SongForge.currentProject.beatFile.url);
        }
        
        // Reset state
        window.SongForge.audio.beatAudio = null;
        window.SongForge.currentProject.beatFile = null;
        
        // Update UI
        document.getElementById('beatInfo').classList.add('hidden');
        document.getElementById('beatDropZone').style.display = 'block';
        document.getElementById('beatInput').value = '';
        
        showNotification('Beat removed', 'info');
    }
}

/**
 * Update beat UI
 */
function updateBeatUI(file, duration) {
    const beatName = document.getElementById('beatName');
    const beatInfo = document.getElementById('beatInfo');
    const beatDropZone = document.getElementById('beatDropZone');
    
    if (beatName && beatInfo && beatDropZone) {
        beatName.innerHTML = `
            <div class="flex flex-col">
                <span class="font-medium">${file.name}</span>
                <span class="text-xs text-gray-500">
                    ${formatDuration(duration)} • ${formatFileSize(file.size)}
                </span>
            </div>
        `;
        
        beatInfo.classList.remove('hidden');
        beatDropZone.style.display = 'none';
    }
}

/**
 * Validate audio file
 */
function validateAudioFile(file) {
    const validTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'];
    return validTypes.some(type => file.type.includes(type.split('/')[1]));
}

// =========================================
// AUDIO RECORDING
// =========================================

/**
 * Start recording
 */
async function startRecording() {
    try {
        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            }
        });
        
        // Create media recorder
        const options = { mimeType: 'audio/webm' };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options.mimeType = 'audio/mp4';
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options.mimeType = '';
            }
        }
        
        window.SongForge.mediaRecorder = new MediaRecorder(stream, options);
        window.SongForge.recordedChunks = [];
        
        // Set up event handlers
        window.SongForge.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                window.SongForge.recordedChunks.push(event.data);
            }
        };
        
        window.SongForge.mediaRecorder.onstop = () => {
            handleRecordingStop();
            stream.getTracks().forEach(track => track.stop());
        };
        
        // Start recording
        window.SongForge.mediaRecorder.start(1000); // Collect data every second
        window.SongForge.audio.isRecording = true;
        
        updateRecordingUI();
        showNotification('Recording started', 'success');
        
    } catch (error) {
        handleError(error, 'Recording start');
        showNotification('Failed to access microphone', 'error');
    }
}

/**
 * Stop recording
 */
function stopRecording() {
    if (window.SongForge.mediaRecorder && window.SongForge.audio.isRecording) {
        window.SongForge.mediaRecorder.stop();
        window.SongForge.audio.isRecording = false;
        updateRecordingUI();
    }
}

/**
 * Handle recording stop
 */
function handleRecordingStop() {
    const blob = new Blob(window.SongForge.recordedChunks, { 
        type: window.SongForge.mediaRecorder.mimeType || 'audio/webm' 
    });
    
    const recording = {
        id: generateId(),
        name: `Recording ${window.SongForge.audio.recordings.length + 1}`,
        blob: blob,
        url: URL.createObjectURL(blob),
        duration: 0, // Will be calculated when audio loads
        timestamp: new Date(),
        mimeType: blob.type
    };
    
    // Calculate duration
    const audio = new Audio(recording.url);
    audio.addEventListener('loadedmetadata', () => {
        recording.duration = audio.duration;
        updateRecordingInList(recording);
    });
    
    // Add to recordings list
    window.SongForge.audio.recordings.push(recording);
    window.SongForge.currentProject.recordings.push(recording);
    
    // Update UI
    addRecordingToList(recording);
    
    showNotification('Recording saved', 'success');
}

/**
 * Toggle recording
 */
function toggleRecording() {
    if (window.SongForge.audio.isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
}

/**
 * Update recording UI
 */
function updateRecordingUI() {
    const recordBtn = document.getElementById('recordBtn');
    const recordStatus = document.getElementById('recordStatus');
    
    if (recordBtn && recordStatus) {
        if (window.SongForge.audio.isRecording) {
            recordBtn.classList.add('recording');
            recordBtn.innerHTML = '<i data-lucide="square" class="w-6 h-6"></i>';
            recordStatus.textContent = 'Recording... Click to stop';
            recordBtn.classList.remove('bg-red-500', 'hover:bg-red-600');
            recordBtn.classList.add('bg-red-600', 'animate-pulse');
        } else {
            recordBtn.classList.remove('recording', 'animate-pulse');
            recordBtn.innerHTML = '<i data-lucide="mic" class="w-6 h-6"></i>';
            recordStatus.textContent = 'Click to start recording';
            recordBtn.classList.remove('bg-red-600');
            recordBtn.classList.add('bg-red-500', 'hover:bg-red-600');
        }
        
        lucide.createIcons();
    }
}

/**
 * Add recording to list
 */
function addRecordingToList(recording) {
    const container = document.getElementById('recordingsList');
    if (!container) return;
    
    const recordingElement = document.createElement('div');
    recordingElement.className = 'recording-item flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600';
    recordingElement.dataset.recordingId = recording.id;
    
    recordingElement.innerHTML = `
        <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <i data-lucide="mic" class="w-4 h-4 text-white"></i>
            </div>
            <div>
                <p class="font-medium text-sm">${recording.name}</p>
                <p class="text-xs text-gray-500">
                    ${formatDate(recording.timestamp, 'time')} • 
                    <span id="duration-${recording.id}">Loading...</span>
                </p>
            </div>
        </div>
        <div class="flex items-center space-x-2">
            <button onclick="playRecording('${recording.id}')" 
                    class="p-1 text-primary hover:text-primary-dark transition-colors"
                    title="Play recording">
                <i data-lucide="play" class="w-4 h-4"></i>
            </button>
            <button onclick="setAsVocal('${recording.id}')" 
                    class="p-1 text-green-500 hover:text-green-600 transition-colors"
                    title="Use as vocal track">
                <i data-lucide="check" class="w-4 h-4"></i>
            </button>
            <button onclick="downloadRecording('${recording.id}')" 
                    class="p-1 text-blue-500 hover:text-blue-600 transition-colors"
                    title="Download recording">
                <i data-lucide="download" class="w-4 h-4"></i>
            </button>
            <button onclick="deleteRecording('${recording.id}')" 
                    class="p-1 text-red-500 hover:text-red-600 transition-colors"
                    title="Delete recording">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
        </div>
    `;
    
    container.appendChild(recordingElement);
    lucide.createIcons();
}

/**
 * Update recording duration in list
 */
function updateRecordingInList(recording) {
    const durationSpan = document.getElementById(`duration-${recording.id}`);
    if (durationSpan) {
        durationSpan.textContent = formatDuration(recording.duration);
    }
}

/**
 * Play recording
 */
function playRecording(recordingId) {
    const recording = window.SongForge.audio.recordings.find(r => r.id === recordingId);
    if (!recording) return;
    
    // Stop current playback
    if (window.SongForge.currentPlayback) {
        window.SongForge.currentPlayback.pause();
    }
    
    // Play recording
    window.SongForge.currentPlayback = new Audio(recording.url);
    window.SongForge.currentPlayback.play();
    
    showNotification(`Playing ${recording.name}`, 'info', 1500);
}

/**
 * Set recording as vocal track
 */
function setAsVocal(recordingId) {
    const recording = window.SongForge.audio.recordings.find(r => r.id === recordingId);
    if (!recording) return;
    
    window.SongForge.audio.vocalAudio = new Audio(recording.url);
    window.SongForge.audio.activeRecording = recording;
    
    showNotification(`${recording.name} set as vocal track`, 'success');
}

/**
 * Download recording
 */
function downloadRecording(recordingId) {
    const recording = window.SongForge.audio.recordings.find(r => r.id === recordingId);
    if (!recording) return;
    
    const a = document.createElement('a');
    a.href = recording.url;
    a.download = `${recording.name}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    showNotification('Recording downloaded', 'success');
}

/**
 * Delete recording
 */
function deleteRecording(recordingId) {
    showConfirmDialog('Are you sure you want to delete this recording?', () => {
        const recordingIndex = window.SongForge.audio.recordings.findIndex(r => r.id === recordingId);
        if (recordingIndex !== -1) {
            const recording = window.SongForge.audio.recordings[recordingIndex];
            
            // Clean up URL
            URL.revokeObjectURL(recording.url);
            
            // Remove from arrays
            window.SongForge.audio.recordings.splice(recordingIndex, 1);
            window.SongForge.currentProject.recordings = window.SongForge.currentProject.recordings.filter(r => r.id !== recordingId);
            
            // Remove from UI
            const element = document.querySelector(`[data-recording-id="${recordingId}"]`);
            if (element) {
                element.remove();
            }
            
            showNotification('Recording deleted', 'info');
        }
    });
}

// =========================================
// AUDIO PLAYBACK CONTROLS
// =========================================

/**
 * Play audio (beat and/or vocal)
 */
function playAudio() {
    try {
        const { beatAudio, vocalAudio, beatMuted, vocalMuted, beatSolo, vocalSolo } = window.SongForge.audio;
        
        // Determine what to play based on solo/mute states
        const shouldPlayBeat = beatAudio && !beatMuted && (!vocalSolo || beatSolo);
        const shouldPlayVocal = vocalAudio && !vocalMuted && (!beatSolo || vocalSolo);
        
        if (shouldPlayBeat) {
            beatAudio.currentTime = window.SongForge.audio.currentTime;
            beatAudio.play();
        }
        
        if (shouldPlayVocal) {
            vocalAudio.currentTime = window.SongForge.audio.currentTime;
            vocalAudio.play();
        }
        
        if (!shouldPlayBeat && !shouldPlayVocal) {
            showNotification('No audio to play', 'info');
            return;
        }
        
        window.SongForge.audio.isPlaying = true;
        window.SongForge.audio.isPaused = false;
        
        updatePlaybackUI();
        
    } catch (error) {
        handleError(error, 'Audio playback');
    }
}

/**
 * Pause audio
 */
function pauseAudio() {
    const { beatAudio, vocalAudio } = window.SongForge.audio;
    
    if (beatAudio) beatAudio.pause();
    if (vocalAudio) vocalAudio.pause();
    
    window.SongForge.audio.isPlaying = false;
    window.SongForge.audio.isPaused = true;
    
    updatePlaybackUI();
}

/**
 * Stop audio
 */
function stopAudio() {
    const { beatAudio, vocalAudio } = window.SongForge.audio;
    
    if (beatAudio) {
        beatAudio.pause();
        beatAudio.currentTime = 0;
    }
    
    if (vocalAudio) {
        vocalAudio.pause();
        vocalAudio.currentTime = 0;
    }
    
    window.SongForge.audio.isPlaying = false;
    window.SongForge.audio.isPaused = false;
    window.SongForge.audio.currentTime = 0;
    
    updatePlaybackUI();
}

/**
 * Toggle playback
 */
function togglePlayback() {
    if (window.SongForge.audio.isPlaying) {
        pauseAudio();
    } else {
        playAudio();
    }
}

/**
 * Update playback UI
 */
function updatePlaybackUI() {
    const playBtn = document.getElementById('playBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    
    if (playBtn && pauseBtn) {
        if (window.SongForge.audio.isPlaying) {
            playBtn.classList.add('opacity-50');
            pauseBtn.classList.remove('opacity-50');
        } else {
            playBtn.classList.remove('opacity-50');
            pauseBtn.classList.add('opacity-50');
        }
    }
}

// =========================================
// VOLUME AND MIXING CONTROLS
// =========================================

/**
 * Set beat volume
 */
function setBeatVolume(volume) {
    window.SongForge.audio.beatVolume = volume / 100;
    
    if (window.SongForge.audio.beatAudio && !window.SongForge.audio.beatMuted) {
        window.SongForge.audio.beatAudio.volume = window.SongForge.audio.beatVolume;
    }
}

/**
 * Set vocal volume
 */
function setVocalVolume(volume) {
    window.SongForge.audio.vocalVolume = volume / 100;
    
    if (window.SongForge.audio.vocalAudio && !window.SongForge.audio.vocalMuted) {
        window.SongForge.audio.vocalAudio.volume = window.SongForge.audio.vocalVolume;
    }
}

/**
 * Toggle beat mute
 */
function toggleBeatMute() {
    const audio = window.SongForge.audio;
    audio.beatMuted = !audio.beatMuted;
    
    if (audio.beatAudio) {
        audio.beatAudio.volume = audio.beatMuted ? 0 : audio.beatVolume;
    }
    
    updateMuteButton('muteBeat', audio.beatMuted);
}

/**
 * Toggle vocal mute
 */
function toggleVocalMute() {
    const audio = window.SongForge.audio;
    audio.vocalMuted = !audio.vocalMuted;
    
    if (audio.vocalAudio) {
        audio.vocalAudio.volume = audio.vocalMuted ? 0 : audio.vocalVolume;
    }
    
    updateMuteButton('muteVocal', audio.vocalMuted);
}

/**
 * Toggle beat solo
 */
function toggleBeatSolo() {
    const audio = window.SongForge.audio;
    audio.beatSolo = !audio.beatSolo;
    
    // If beat solo is on, turn off vocal solo
    if (audio.beatSolo) {
        audio.vocalSolo = false;
        updateSoloButton('soloVocal', false);
    }
    
    updateSoloButton('soloBeat', audio.beatSolo);
    updateAudioMixing();
}

/**
 * Toggle vocal solo
 */
function toggleVocalSolo() {
    const audio = window.SongForge.audio;
    audio.vocalSolo = !audio.vocalSolo;
    
    // If vocal solo is on, turn off beat solo
    if (audio.vocalSolo) {
        audio.beatSolo = false;
        updateSoloButton('soloBeat', false);
    }
    
    updateSoloButton('soloVocal', audio.vocalSolo);
    updateAudioMixing();
}

/**
 * Update audio mixing based on solo/mute states
 */
function updateAudioMixing() {
    const audio = window.SongForge.audio;
    
    // Beat audio
    if (audio.beatAudio) {
        if (audio.beatMuted || (audio.vocalSolo && !audio.beatSolo)) {
            audio.beatAudio.volume = 0;
        } else {
            audio.beatAudio.volume = audio.beatVolume;
        }
    }
    
    // Vocal audio
    if (audio.vocalAudio) {
        if (audio.vocalMuted || (audio.beatSolo && !audio.vocalSolo)) {
            audio.vocalAudio.volume = 0;
        } else {
            audio.vocalAudio.volume = audio.vocalVolume;
        }
    }
}

/**
 * Update mute button appearance
 */
function updateMuteButton(buttonId, isMuted) {
    const button = document.getElementById(buttonId);
    if (button) {
        if (isMuted) {
            button.classList.add('bg-red-500', 'text-white');
            button.classList.remove('bg-gray-200', 'dark:bg-gray-600');
        } else {
            button.classList.remove('bg-red-500', 'text-white');
            button.classList.add('bg-gray-200', 'dark:bg-gray-600');
        }
    }
}

/**
 * Update solo button appearance
 */
function updateSoloButton(buttonId, isSolo) {
    const button = document.getElementById(buttonId);
    if (button) {
        if (isSolo) {
            button.classList.add('bg-yellow-500', 'text-white');
            button.classList.remove('bg-gray-200', 'dark:bg-gray-600');
        } else {
            button.classList.remove('bg-yellow-500', 'text-white');
            button.classList.add('bg-gray-200', 'dark:bg-gray-600');
        }
    }
}

// =========================================
// AUDIO VISUALIZATION
// =========================================

/**
 * Setup audio visualization
 */
function setupAudioVisualization(audio) {
    if (!window.SongForge.audioContext) return;
    
    try {
        const audioContext = window.SongForge.audioContext;
        const source = audioContext.createMediaElementSource(audio);
        const analyser = audioContext.createAnalyser();
        
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        window.SongForge.audio.analyser = analyser;
        window.SongForge.audio.dataArray = dataArray;
        
    } catch (error) {
        console.warn('Audio visualization setup failed:', error);
    }
}

/**
 * Create audio visualizer element
 */
function createAudioVisualizer(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const visualizer = document.createElement('div');
    visualizer.className = 'audio-visualizer';
    visualizer.innerHTML = Array(10).fill('<div class="audio-bar"></div>').join('');
    
    container.appendChild(visualizer);
    
    // Animate bars when audio is playing
    function animateBars() {
        if (window.SongForge.audio.isPlaying && window.SongForge.audio.analyser) {
            window.SongForge.audio.analyser.getByteFrequencyData(window.SongForge.audio.dataArray);
            
            const bars = visualizer.querySelectorAll('.audio-bar');
            bars.forEach((bar, i) => {
                const value = window.SongForge.audio.dataArray[i * 4] || 0;
                const height = Math.max(5, (value / 255) * 40);
                bar.style.height = `${height}px`;
            });
        }
        
        requestAnimationFrame(animateBars);
    }
    
    animateBars();
}

// =========================================
// DRAG AND DROP SETUP
// =========================================

/**
 * Setup drag and drop for beat files
 */
function setupDragAndDrop() {
    const beatDropZone = document.getElementById('beatDropZone');
    const beatInput = document.getElementById('beatInput');
    
    if (!beatDropZone || !beatInput) return;
    
    // Click to browse
    beatDropZone.addEventListener('click', () => {
        beatInput.click();
    });
    
    // File input change
    beatInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleBeatFile(file);
        }
    });
    
    // Drag and drop events
    beatDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        beatDropZone.classList.add('border-primary', 'bg-primary', 'bg-opacity-5');
    });
    
    beatDropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        beatDropZone.classList.remove('border-primary', 'bg-primary', 'bg-opacity-5');
    });
    
    beatDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        beatDropZone.classList.remove('border-primary', 'bg-primary', 'bg-opacity-5');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleBeatFile(files[0]);
        }
    });
}

// =========================================
// AUDIO CONTROLS SETUP
// =========================================

/**
 * Setup audio control event listeners
 */
function setupAudioControls() {
    // Playback controls
    const playBtn = document.getElementById('playBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const stopBtn = document.getElementById('stopBtn');
    
    if (playBtn) playBtn.addEventListener('click', playAudio);
    if (pauseBtn) pauseBtn.addEventListener('click', pauseAudio);
    if (stopBtn) stopBtn.addEventListener('click', stopAudio);
    
    // Mute/Solo controls
    const muteBeat = document.getElementById('muteBeat');
    const muteVocal = document.getElementById('muteVocal');
    const soloBeat = document.getElementById('soloBeat');
    const soloVocal = document.getElementById('soloVocal');
    
    if (muteBeat) muteBeat.addEventListener('click', toggleBeatMute);
    if (muteVocal) muteVocal.addEventListener('click', toggleVocalMute);
    if (soloBeat) soloBeat.addEventListener('click', toggleBeatSolo);
    if (soloVocal) soloVocal.addEventListener('click', toggleVocalSolo);
    
    // Remove beat
    const removeBeatBtn = document.getElementById('removeBeatBtn');
    if (removeBeatBtn) removeBeatBtn.addEventListener('click', removeBeatFile);
}

/**
 * Setup volume control event listeners
 */
function setupVolumeControls() {
    const beatVolume = document.getElementById('beatVolume');
    const vocalVolume = document.getElementById('vocalVolume');
    
    if (beatVolume) {
        beatVolume.addEventListener('input', (e) => {
            setBeatVolume(e.target.value);
        });
    }
    
    if (vocalVolume) {
        vocalVolume.addEventListener('input', (e) => {
            setVocalVolume(e.target.value);
        });
    }
}

/**
 * Setup recording control event listeners
 */
function setupRecordingControls() {
    const recordBtn = document.getElementById('recordBtn');
    if (recordBtn) {
        recordBtn.addEventListener('click', toggleRecording);
    }
}

// =========================================
// AUDIO EXPORT
// =========================================

/**
 * Export mixed audio (placeholder for future implementation)
 */
function exportMixedAudio() {
    showNotification('Audio export feature coming soon!', 'info');
    
    // Future implementation would use Web Audio API to mix tracks
    // and export as a single audio file
}

// =========================================
// CLEANUP
// =========================================

/**
 * Cleanup audio resources
 */
function cleanupAudio() {
    // Stop all audio
    stopAudio();
    
    // Stop recording if active
    if (window.SongForge.audio.isRecording) {
        stopRecording();
    }
    
    // Clean up object URLs
    window.SongForge.audio.recordings.forEach(recording => {
        if (recording.url) {
            URL.revokeObjectURL(recording.url);
        }
    });
    
    if (window.SongForge.currentProject.beatFile && window.SongForge.currentProject.beatFile.url) {
        URL.revokeObjectURL(window.SongForge.currentProject.beatFile.url);
    }
    
    // Reset audio state
    window.SongForge.audio = {
        beatAudio: null,
        vocalAudio: null,
        isRecording: false,
        isPaused: false,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        beatVolume: 0.7,
        vocalVolume: 0.8,
        beatMuted: false,
        vocalMuted: false,
        beatSolo: false,
        vocalSolo: false,
        recordings: [],
        activeRecording: null,
        analyser: null,
        dataArray: null
    };
}

// =========================================
// INITIALIZATION
// =========================================

// Initialize audio system when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAudio);
} else {
    initializeAudio();
}

// Cleanup on page unload
window.addEventListener('beforeunload', cleanupAudio);
