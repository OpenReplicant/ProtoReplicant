## Hands-Free Instant Web STT Component Set

# Silero VAD browser library by [ricky0123](https://github.com/ricky0123/vad)
# STT web service endpoint by [ololoshka2871](https://github.com/ololoshka2871/Voice-2-txt-faster-whisper) 
# ... which is based on [guillaumekln/faster-whisper](https://github.com/guillaumekln/faster-whisper)

## How to run
1. Create python virtual environment: `python3 -m venv venv`
2. Activate virtual environment: `source venv/bin/activate`
3. Install requirements: `pip install -r requirements.txt`
4. Run server: `python main.py -m small -c cuda` (small model, using CUDA)

KNOWN ISSUE: models disappear/unusable after first run. workaround: delete the dir under models/