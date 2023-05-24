async function koboldAI(message, state) {

  // POST header to the Horde/KoboldAI API
  const config = {
    headers: {
      apikey: '0000000000', // 10 Zeros = Anon for free low-priority calls.
      'Content-Type': 'application/json',
    }
  }


  // A lot more of this should be made into variables
  const maxOutput = 18 //Tokens to generate each call (we cut off extra text in chat)
  const logLimit = 21 //How many lines of recent chat history to include in prompt
  
  // Append message to chat log
  const logEntry = { author: state.user.name, message: message, timestamp: new Date() };
  const chatLog = JSON.parse(localStorage.getItem('chatLog')) || [];
  chatLog.push(logEntry);
  localStorage.setItem('chatLog', JSON.stringify(chatLog));

  // Read updated chat log and post to API
  let chatLogString = '';
  const logCount = 20 // Retrieve the last 20 entries
  const lastLogs = chatLog.slice(Math.max(chatLog.length - logCount, 0));
  
  for (const logEntry of lastLogs) {
    chatLogString += `${logEntry.author}: ${logEntry.message}\n`;
  }

  //PROOMPT BUILDER
  const proompt = `${state.bot.notes}\n[The following is an interesting conversation between ${state.bot.name} and ${state.user.name}.]\n${chatLogString}${state.bot.name}:`;

    console.log(`PROOMPT: ${proompt}`);

  // Kobold AI/Horde settings
  const apiPayload = {
    "prompt": proompt,
    "params": {
      "n": 1,
      "max_context_length": 1337,
      "max_length": maxOutput,
      "rep_pen": 1.1,
      "temperature": 0.69,
      "top_p": 0.5,
      "top_k": 0,
      "top_a": 0.75,
      "typical": 0.19,
      "tfs": 0.97,
      "rep_pen_range": 1024,
      "rep_pen_slope": 0.7,
      "sampler_order": [
        6,
        5,
        4,
        3,
        2,
        1,
        0
      ]
    },
    "models": [
      "PygmalionAI/pygmalion-6b"
    ],
    "workers": []
  };
  // POST to LLM API
  let response = await axios.post(
    'https://horde.koboldai.net/api/v2/generate/text/async',
    apiPayload,
    config);
  let jobId = response.data.id;
  //console.log(response); //DEBUG ===========

  // GET polling response API
  let generations;
  while (true) {
    const jobStatus = await axios.get(`https://horde.koboldai.net/api/v2/generate/text/status/${jobId}`);
    if (jobStatus.data.done) {
      generations = jobStatus.data.generations || []; //NEW
      //generations = jobStatus.data.generations;
      //console.log(generations); //DEBUG ===========
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 1111)); // 1111ms polling
  }

  // Extract bot response from returned payload
  //let output = generations[0].text;
  let output = 'LLM error'; //Return "error" if value not overwritten, avoid undefined error
  if (generations && generations.length > 0) {
    for (let i = 0; i < generations.length; i++) {
      output = `${generations[i].text}`;
      console.log("FULL REPLY>" + `${generations[i].text}`); //DEBUG ===========
    }
  }

  // Clean response, discarding extra dialog generated
  let cleanedString = output.replace(/^\s+/, ''); // remove line breaks before words

  //THIS IS PROBABLY WRONG... maybe we should look for first instance of ${user.name}:
  let index = cleanedString.indexOf('\n'); // find first line break
  if (index !== -1) {
    output = cleanedString.substring(0, index); // return everything up to first line break
  } else {
    output = cleanedString; // no line break found, return entire string
  }

  // Append message to chat log
  const botLogEntry = { author: state.bot.name, message: output, timestamp: new Date() };
  const newChatLog = JSON.parse(localStorage.getItem('chatLog')) || [];
  newChatLog.push(botLogEntry);
  localStorage.setItem('chatLog', JSON.stringify(newChatLog));



  //HACKY PUB/SUB EMITTER
  // Publish output to an event == emitter.emit('eventChannel', output);
  // Using the DOM (body) to pass events for zero imports/dependencies
  const LLMevent = new Event('LLM');
  document.body.setAttribute('data-llm', output);
  document.body.dispatchEvent(LLMevent);
  // Event listener triggers the TTS function which outputs to AudioContext


  return output; //in case of callback
};

//module.exports = { sendMessage };