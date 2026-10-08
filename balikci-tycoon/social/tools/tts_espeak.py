"""eSpeak NG ile Türkçe seslendirme (ctypes). Çıktı 22050 Hz mono WAV.
   python3 social/tools/tts_espeak.py "metin" cikti.wav [hız=165] [ton=42] [ses=tr+m3]
   Not: eSpeak biçimlendirici (formant) sentezdir; sinir ağı sesleri kadar doğal değildir."""
import sys, ctypes, wave, array
import espeakng_loader as L

lib = ctypes.CDLL(L.get_library_path())
SYNTH_CB = ctypes.CFUNCTYPE(ctypes.c_int, ctypes.POINTER(ctypes.c_short), ctypes.c_int, ctypes.c_void_p)
buf = array.array('h')

@SYNTH_CB
def cb(wav, n, events):
    if wav and n > 0: buf.extend(wav[i] for i in range(n))
    return 0

def synth(text, out, rate=165, pitch=42, voice='tr+m3'):
    sr = lib.espeak_Initialize(2, 0, L.get_data_path().encode(), 0)   # AUDIO_OUTPUT_SYNCHRONOUS
    lib.espeak_SetSynthCallback(cb)
    lib.espeak_SetVoiceByName(voice.encode())
    lib.espeak_SetParameter(1, rate, 0)    # espeakRATE
    lib.espeak_SetParameter(3, pitch, 0)   # espeakPITCH
    lib.espeak_SetParameter(4, 40, 0)      # espeakRANGE (tonlama genişliği)
    b = text.encode('utf-8')
    lib.espeak_Synth(b, len(b) + 1, 0, 0, 0, 0x01, None, None)   # espeakCHARS_UTF8
    lib.espeak_Synchronize()
    with wave.open(out, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(buf.tobytes())
    return len(buf) / sr

if __name__ == '__main__':
    a = sys.argv
    d = synth(a[1], a[2], int(a[3]) if len(a) > 3 else 165, int(a[4]) if len(a) > 4 else 42, a[5] if len(a) > 5 else 'tr+m3')
    print('%.2f sn' % d)
