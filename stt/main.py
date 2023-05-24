#!/usr/bin/env python

from io import BytesIO
import os
import logging
import functools
import argparse

from aiohttp import web
from aiohttp_cors import setup, ResourceOptions

from faster_whisper import WhisperModel


logger = logging.getLogger(__name__)


async def index(request: web.Request) -> web.Response:
    import pathlib

    # show api documentation
    return web.FileResponse(pathlib.Path(__file__).parent.resolve().joinpath('index.html'))


async def transcribe_post(model: WhisperModel, request: web.Request) -> web.StreamResponse:
    if request.headers["Content-Type"] != "audio/wav":
        return web.Response(status=415, text="Unsupported Input Media Type")

    wav_data = await request.read()

    segments, info = model.transcribe(audio=BytesIO(wav_data), vad_filter=True)

    logger.debug(
        f"Detected language '{info.language}' with probability {info.language_probability}")

    segments_result = list()

    for segment in segments:
        segments_result.append({
            'text': segment.text,
            'start': segment.start,
            'end': segment.end,
        })

### OUTPUT can go anywhere besides back to sender...
### ->
    # return transcripted_text and correct_text as json
    return web.json_response({'transcribed_segments': segments_result,
                              'language': info.language, })


def setup_cors(app):
    cors = setup(app, defaults={
        "*": ResourceOptions(
            allow_credentials=True,
            expose_headers="*",
            allow_headers="*",
        )
    })

    # Configure CORS on all routes
    for route in list(app.router.routes()):
        cors.add(route)


async def start_server(model: str, compute_type: str = 'default', cache_dir: str = None, device: str = 'cpu') -> web.Application:
    model_path = f'{cache_dir}/{model}'

    logger.info(f'Loading AI model {model_path} to {device}...')

    if os.path.isdir(model_path):
        model = WhisperModel(model_path, device=device,
                             compute_type=compute_type, download_root=model_path)
    else:
        model = WhisperModel(model, device=device,
                             compute_type=compute_type, download_root=model_path)

    app = web.Application()

    # call handle_request with tts as first argument
    app.add_routes([
        web.get('/', handler=index),
        web.post('/transcribe', handler=functools.partial(transcribe_post, model))
    ])
    
    # Set up CORS
    setup_cors(app)
    
    return app


if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        description='An AI voice to text transcription server')

    parser.add_argument('-p', '--port', type=int,
                        default=3157, help='Port to listen on')
    parser.add_argument('-m', '--model',
                        help='Model name, see https://github.com/openai/whisper#available-models-and-languages',
                        default='medium')
    parser.add_argument('-t', '--compute-type', type=str,
                        help='default, float16, int8', default='default')
    parser.add_argument('-d', '--model-dir',
                        type=str,
                        help='Path to model directory',
                        default='models')
    parser.add_argument('-c', '--device', type=str, default='cpu', help='torch device to use')
    args = parser.parse_args()

    logger.info(f'Starting server at http://localhost:{args.port}/')

    web.run_app(start_server(args.model, args.compute_type,
                args.model_dir, args.device), port=args.port)
