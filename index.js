document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('search-form');
  const input = document.getElementById('search-input');
  const wordEl = document.getElementById('word');
  const pronunciationEl = document.getElementById('pronunciation');
  const definitionsEl = document.getElementById('definitions');
  const synonymsEl = document.getElementById('synonyms');
  const audioBtn = document.getElementById('play-audio');
  const errorEl = document.getElementById('error-message');

  let audio = null;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearResults();
    const searchWord = input.value.trim();
    if (!searchWord) {
      showError('Please enter a word.');
      return;
    }

    try {
      const data = await fetchWord(searchWord);
      displayWordData(data);
    } catch (err) {
      showError('Word not found or API error.');
      console.error(err);
    }
  });

  function clearResults() {
    wordEl.textContent = '';
    pronunciationEl.textContent = '';
    definitionsEl.innerHTML = '';
    synonymsEl.innerHTML = '';
    audioBtn.hidden = true;
    errorEl.textContent = '';
    errorEl.classList.add('hidden');
    audio = null;
  }

  function showError(message) {
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
  }

  async function fetchWord(word) {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    if (!response.ok) throw new Error('Word not found');
    const data = await response.json();
    return data[0]; // Use the first result
  }

  function displayWordData(data) {
    wordEl.textContent = data.word;

    // Display pronunciation
    if (data.phonetics && data.phonetics.length > 0) {
      const phonetic = data.phonetics.find(p => p.text) || data.phonetics[0];
      pronunciationEl.textContent = phonetic.text || '';
      if (phonetic.audio) {
        audio = new Audio(phonetic.audio);
        audioBtn.hidden = false;
      }
    }

    // Display definitions
    if (data.meanings && data.meanings.length > 0) {
      data.meanings.forEach(meaning => {
        const posEl = document.createElement('p');
        posEl.innerHTML = `<strong>${meaning.partOfSpeech}</strong>`;
        definitionsEl.appendChild(posEl);

        meaning.definitions.forEach(def => {
          const defEl = document.createElement('p');
          defEl.textContent = `- ${def.definition}`;
          definitionsEl.appendChild(defEl);

          if (def.synonyms && def.synonyms.length > 0) {
            const synEl = document.createElement('p');
            synEl.textContent = `Synonyms: ${def.synonyms.join(', ')}`;
            synonymsEl.appendChild(synEl);
          }
        });
      });
    }
  }

  audioBtn.addEventListener('click', () => {
    if (audio) audio.play();
  });
});