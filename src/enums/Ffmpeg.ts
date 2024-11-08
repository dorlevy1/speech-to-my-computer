export enum AudioChannels {
    Mono = 1,
    Stereo = 2,
    Quad = 4,
    Surround_5_1 = 6,
    Surround_7_1 = 8,
}

export enum AudioSampleRate {
    Rate_8kHz = 8000,
    Rate_16kHz = 16000,
    Rate_22_05kHz = 22050,
    Rate_32kHz = 32000,
    Rate_44_1kHz = 44100,
    Rate_48kHz = 48000,
    Rate_96kHz = 96000,
    Rate_192kHz = 192000,
}

export enum AudioFilterType {
    SilenceDetect = 'silencedetect',
    Volume = 'volume',
    Bass = 'bass',
    Treble = 'treble',
    Echo = 'aecho',
    Tempo = 'atempo',
    SetRate = 'asetrate',
}
