## Alli - OpenReplicant Alpha v0.1

THIS IS AN EARLY POC/PROTOTYPE - FIGURE IT OUT ON YOUR OWN, OR DON'T.

The immediate goal is to provide a practical framework for multi-model AI agents.
Using a web browser as the execution environment more than simply a thin client.
Microservices are called for heavy-lifting, some models & functions run in-browser.

Initial code is a simple pipeline to animate a 3D character with voice.
VAD -> STT -> LLM -> TTS -> VRM

LLM prompt template for character & chatlogs stored as persistent object.
This should be into an interface for import/export of the user/bot object.

Internal architecture and components, as well as embodiments will be expanded on.

### RUN:
python stt/main.py -m tiny -c cuda

python tts/server.py --port 5002 --model_name tts_models/en/ljspeech/glow-tts --vocoder_name vocoder_models/en/ljspeech/univnet --use_cuda True

http-server vrm-ui/   (that's on NPM, or use any HTTP server)