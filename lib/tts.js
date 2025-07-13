const querystring = require('querystring');

function getAudioUrl(text, options = {}) {
  const { lang = 'fr', slow = false, host = 'https://translate.google.com' } = options;

  const query = querystring.stringify({
    ie: 'UTF-8',
    q: text,
    tl: lang,
    client: 'tw-ob',
    ttsspeed: slow ? 0.24 : 1,
  });

  return `${host}/translate_tts?${query}`;
}

module.exports = { getAudioUrl };
