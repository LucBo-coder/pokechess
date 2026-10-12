"""Original procedural eight-second loop; replaces the absent tavern.mp3 dependency."""
import math, struct, wave
from pathlib import Path
root=Path(__file__).resolve().parents[1]
rate=22050
notes=[60,64,67,71,62,65,69,72,57,60,64,67,55,59,62,67]
samples=[]
for index,note in enumerate(notes):
    frequency=440*2**((note-69)/12)
    bass=440*2**(([48,50,45,43][index//4]-69)/12)
    for frame in range(rate//2):
        t=frame/rate
        envelope=min(1,t/.015)*min(1,(.5-t)/.08)*math.exp(-t*2)
        tone=math.sin(2*math.pi*frequency*t)+.22*math.sin(4*math.pi*frequency*t)
        value=(tone*.11+math.sin(2*math.pi*bass*t)*.065)*envelope
        samples.append(struct.pack('<h',int(max(-1,min(1,value))*32767)))
target=root/'assets/audio/tavern.wav';target.parent.mkdir(parents=True,exist_ok=True)
with wave.open(str(target),'wb') as audio:
    audio.setnchannels(1);audio.setsampwidth(2);audio.setframerate(rate);audio.writeframes(b''.join(samples))
print(str(target))
