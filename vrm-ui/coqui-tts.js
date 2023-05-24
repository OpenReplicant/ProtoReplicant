function speak(textToSynthesize) {
  const encodedText = encodeURIComponent(textToSynthesize);
  const url = `http://localhost:5002/api/tts?text=${encodedText}&speaker_id=&style_wav=&language_id=`;
  //const url = `/tts/tts?text=${encodedText}&speaker_id=&style_wav=&language_id=en`; //Caddy proxy

  // BENCHMARK: Record the start time
  const startTime = performance.now();

  fetch(url)
    .then(response => response.blob())
    .then(blob => {
      const url = URL.createObjectURL(blob);
      audioElement.src = url;
      audioElement.play();

      const sourceNode = audioContext.createMediaElementSource(audioElement);
      sourceNode.connect(analyser);
      sourceNode.connect(audioContext.destination);

      // BENCHMARK: Record end time and calculate latency
      const endTime = performance.now();
      const latency = endTime - startTime;
      console.log(`TTS Delay: ${latency}`);

      //DOWNLOAD FOR DEBUG
      /*
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = 'audio.wav';
      downloadLink.style.display = 'none';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      */
    })
    .catch(error => {
      const TTSevent = new Event('TTS');
      //document.body.setAttribute('data-tts', error);
      document.body.dispatchEvent(TTSevent);
      console.error(error)
    });
}