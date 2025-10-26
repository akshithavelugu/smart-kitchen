import React from "react";
function VoiceSearch({ setQuery }) {
  function startVoice() {
    const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Speech) {
      alert("Voice search not supported in this browser.");
      return;
    }
    const r = new Speech();
    r.lang = "en-IN";
    r.onresult = (e) => {
      const t = e.results[0][0].transcript;
      setQuery(t);
    };
    r.onerror = () => {};
    r.start();
  }

  return <button onClick={startVoice} title="Voice search">🎤</button>;
}

export default VoiceSearch;

