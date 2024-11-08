import { AudioChannels, AudioFilterType, AudioSampleRate } from "@enums/Ffmpeg";

const FfmpegConfig: string[] = [
    '-y',  // החלפה של קבצי אודיו קיימים ללא בקשת אישור
    '-f', 'dshow',
    '-i', 'audio=Microphone (Realtek High Definition Audio)',  // שם המיקרופון, עדכן לפי הצורך
    '-ac', AudioChannels.Stereo.toString(),  // סטריאו
    '-ar', AudioSampleRate.Rate_44_1kHz.toString(),  // קצב דגימה של 44.1kHz
    '-af', `${ AudioFilterType.SilenceDetect }=noise=-50dB:d=2`,  // שימוש במסנן silencedetect: סף רעש של -50dB, שקט שנמשך לפחות 2 שניות
    process.env.OUTPUT_FFMPEG as string  // קובץ הפלט
]

export default FfmpegConfig