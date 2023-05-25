## Alli - OpenReplicant Alpha v0.1

THIS IS AN EARLY POC/PROTOTYPE - FIGURE IT OUT ON YOUR OWN, OR DON'T.

The immediate goal is to provide a practical framework for multi-model AI agents.
Using a web browser as the execution environment more than simply a thin client.
Microservices are called for heavy-lifting, some models & functions run in-browser.
To change avatars just drag and drop a VRM file onto the page. Ready for broadcast!

Initial code is a simple pipeline to animate a 3D character with voice.
VAD -> STT -> LLM -> TTS -> VRM

LLM prompt template for character & chatlogs stored as persistent object.
This should be into an interface for import/export of the user/bot object.

Internal architecture and components, as well as embodiments will be expanded on.

### RUN:
python stt/main.py -m tiny -c cuda

python tts/server.py --port 5002 --model_name tts_models/en/ljspeech/glow-tts --vocoder_name vocoder_models/en/ljspeech/univnet --use_cuda True

http-server vrm-ui/   (that's on NPM, or use any HTTP server)


#### Based on projects: (thank you devs!)
 - [VU-VRM mic-based vtuber avatar](https://github.com/Automattic/VU-VRM)
 - [KoboldAI LLM interface for self-hosted models](https://github.com/0cc4m/KoboldAI)
 - [AI Horde - Distributed compute network for AI](https://github.com/Haidra-Org/AI-Horde)
 - [Coqui Text-to-Speech - previously DeepSpeech](https://github.com/coqui-ai/TTS)
 - [Faster-Whisper implementation of OpenAI Whisper](https://github.com/guillaumekln/faster-whisper)
 - [STT web service based on guillaumekln/faster-whisper](https://github.com/ololoshka2871/Voice-2-txt-faster-whisper)
 - [Voice Activity Detection for Javascript](https://github.com/ricky0123/vad)
