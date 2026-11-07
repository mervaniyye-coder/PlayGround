const $ = (id) => document.getElementById(id);
const cast = {
  lyra: { name: 'Lyra', role: 'Lighthouse keeper', initial: 'L', avatar: 'lyra', title: 'The light she keeps', quote: '“I want someone who sees me, not just the light I keep on.”',
    text: 'At the island’s edge, Lyra tends a lighthouse whose beam has been dark for a hundred years. Its flame is not broken; it is waiting for someone to decide what the island should become.\n\nShe admits the heart-tide made her feel certain she loved you. The feeling is still there—but she wants to know what remains when nobody is being pulled by magic.',
    choices: [ ['Help relight the beacon together.', 'You share the work, and she lets you see the hope beneath her bravado.', 1], ['Ask what she would do if the island were free.', 'For once, Lyra talks about the future she wants for herself.', 0] ],
    romance: ['Together, you tend the beacon—not as its keeper and guest, but as two people who chose to stay. When its new light reaches the mainland, Lyra takes your hand. The island is still strange; the choice to meet each sunrise together is entirely yours.', 'The beacon throws a silver path across the sea. Lyra chooses to sail beside you and find out what love feels like when it is freely given. At the rail, she threads her fingers through yours. Geyropoa fades behind you, but your story is only beginning.'],
    friend: 'You leave the beacon in Lyra’s capable hands and promise to write. She hugs you once, then turns back toward the light she chose for herself. It is not a romance, and it is not a lesser thing.' },
  vesper: { name: 'Vesper', role: 'Cartographer', initial: 'V', avatar: 'vesper', title: 'A map with no edges', quote: '“I’ve mapped every road here. I’ve never asked where I wanted to go.”',
    text: 'Vesper draws maps on scraps of black glass. Every road she charts curls back toward the island’s heart, where the old heart-tide began. She is fascinated by the pattern—and quietly afraid of what it means.\n\nShe tells you the magic made her fall for you at first sight. She does not want that spell to make your choice for either of you.',
    choices: [ ['Trace the impossible road with her.', 'You trust her curiosity, and she trusts you with the map she has hidden.', 1], ['Tell her you would rather get lost together.', 'Vesper laughs. For the first time, she lets the map stay unfinished.', 0] ],
    romance: ['The map ends at a blank place marked HERE. Vesper says she wants to discover the rest with you, one uncharted day at a time. You kiss beneath a sky she has not yet named, and the future feels wonderfully unmapped.', 'Vesper closes her atlas and chooses the open road with you. She takes your hand—not because the map says to, but because she wants to. Beyond Geyropoa, every direction is new.'],
    friend: 'Vesper gives you a small map with one road leading off the island. “For when you’re ready,” she says. You part with a real friendship, and no spell left to explain it.' },
  mara: { name: 'Mara', role: 'Keeper of the wilds', initial: 'M', avatar: 'mara', title: 'The garden at the world’s end', quote: '“If the tide goes quiet, I still want to hear what my own heart says.”',
    text: 'Mara lives among the moonlit gardens, where flowers turn their faces toward whoever is speaking. She knows the island’s heart-tide is fading, and has been saving seeds in case the magic—and the home she knows—disappears.\n\nShe tells you she is drawn to you, but wants her feelings to be hers. You both have a chance to find out what that means.',
    choices: [ ['Help Mara gather seeds for a new garden.', 'She shares the garden she hopes to grow beyond the island.', 1], ['Ask her to show you her favorite quiet place.', 'Mara leads you away from the enchanted blooms, somewhere she can simply be herself.', 0] ],
    romance: ['Mara plants the first seed in the soil beyond Geyropoa. She asks you to help her make a home there—not because fate arranged it, but because you make her feel safe enough to imagine one. You say yes, and she kisses you beneath an ordinary, beautiful dawn.', 'Mara chooses to travel with you and carry a pocketful of seeds toward whatever comes next. You promise to help her find a place to plant them. Her smile is soft, certain, and entirely her own.'],
    friend: 'You help Mara pack her seeds for the journey ahead. She will stay and tend the garden while you go, and you promise to return. You part as friends, with the island’s wildflowers waving you on.' }
};

const state = { screen: 'title', node: 'arrival', route: null, bond: 0, chapter: 1 };
const STORAGE_KEY = 'geyropoa-heart-tide-save-v1';
const LANGUAGE_KEY = 'geyropoa-language';
let language = localStorage.getItem(LANGUAGE_KEY) === 'tr' ? 'tr' : 'en';
const t = () => translations[language];
const activeCast = () => language === 'tr' ? t().cast : cast;
const tr = (key) => t().ui[key];
let audioContext = null;
let soundOn = false;

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
  $('saveStatus').textContent = state.screen === 'ending' ? tr('saveEnding') : tr('saveProgress');
}
function localizeShell() {
  document.documentElement.lang = language;
  document.title = language === 'tr' ? 'Geyropoa — Kalp Gelgiti' : 'Geyropoa — The Heart-Tide';
  document.querySelector('meta[name="description"]').content = language === 'tr'
    ? 'Gizemli Geyropoa adasında geçen, seçimlerle şekillenen romantik bir fantastik görsel roman.'
    : 'A choice-driven romantic fantasy visual novel set on the mysterious island of Geyropoa.';
  $('homeLink').setAttribute('aria-label', language === 'tr' ? 'Geyropoa ana sayfa' : 'Geyropoa home');
  $('languageSelect').value = language;
  $('languageSelect').setAttribute('aria-label', language === 'tr' ? 'Dil' : 'Language');
  $('languageSelect').title = language === 'tr' ? 'Dil seç' : 'Choose language';
  document.querySelector('.language-label').textContent = language === 'tr' ? 'Dil' : 'Language';
  $('soundButton').setAttribute('aria-label', language === 'tr' ? 'Ortam sesini aç veya kapat' : 'Toggle ambient sound');
  $('soundButton').title = language === 'tr' ? 'Ortam sesini aç veya kapat' : 'Toggle ambient sound';
  document.querySelector('.art-label').lastChild.textContent = ` ${tr('art')}`;
  document.querySelector('.welcome-copy .eyebrow').innerHTML = `<span></span> ${tr('eyebrow')}`;
  document.querySelector('.welcome-copy h1').innerHTML = tr('title');
  document.querySelector('.welcome-deck').textContent = tr('deck');
  document.querySelector('.welcome-meta').innerHTML = tr('meta').split('|').map((item) => `<span>${item}</span>`).join('');
  $('beginButton').innerHTML = tr('begin');
  $('continueButton').innerHTML = tr('continue');
  document.querySelector('.tiny-note').textContent = tr('note');
  document.querySelector('.orbit-caption').innerHTML = tr('orbit');
  $('chapterKicker').textContent = tr('chapter');
  $('chapterSmall').textContent = tr('chapterName');
  document.querySelector('.cast-title').innerHTML = `${tr('cast')} <span>18+</span>`;
  $('restartButton').textContent = tr('restart');
  $('choiceHeading').textContent = tr('choiceHeading');
  $('playAgainButton').innerHTML = tr('playAgain');
  $('titleButton').textContent = tr('titleButton');
  $('footerHint').textContent = tr('footerHint');
  document.querySelector('.story-footer > span:last-child').innerHTML = `${tr('footerTitle')} <b>✦</b>`;
  document.querySelector('.page-footer').innerHTML = `<span>${tr('footerTitle')}</span><span>${tr('footerSub')}</span>`;
  $('soundButton').querySelector('span').textContent = soundOn ? t().sound.on : t().sound.off;
  if (state.screen === 'title') showTitle();
  else render();
}
function showTitle() {
  state.screen = 'title';
  $('storyScreen').classList.add('hidden');
  $('welcomeScreen').classList.remove('hidden');
  const saved = readSave();
  $('continueButton').classList.toggle('hidden', !saved || saved.screen === 'title');
  $('saveStatus').textContent = saved && saved.screen !== 'title' ? tr('saveWaiting') : tr('saveTitle');
}
function readSave() {
  try { const data = JSON.parse(localStorage.getItem(STORAGE_KEY)); return data && data.node ? data : null; } catch (_) { return null; }
}
function begin() {
  Object.assign(state, { screen: 'story', node: 'arrival', route: null, bond: 0, chapter: 1 });
  render();
}
function continueStory() {
  const saved = readSave();
  if (saved) Object.assign(state, saved);
  state.screen = 'story';
  render();
}
function openStory() {
  $('welcomeScreen').classList.add('hidden');
  $('storyScreen').classList.remove('hidden');
}
function setText(element, text) {
  element.textContent = text;
}
function renderCast() {
  $('castList').innerHTML = Object.entries(activeCast()).map(([key, person]) => `<div class="cast-person ${state.route === key ? 'active' : ''}"><div class="avatar ${person.avatar}">${person.initial}</div><div><span class="person-name">${person.name}</span><span class="person-role">${person.role}</span></div></div>`).join('');
}
function makeChoice(label, detail, action, glyph = '✦') {
  const button = document.createElement('button');
  button.className = 'choice-button';
  button.innerHTML = `<span class="choice-glyph" aria-hidden="true">${glyph}</span><span>${label}${detail ? `<small>${detail}</small>` : ''}</span>`;
  button.addEventListener('click', action);
  return button;
}
function displayScene({ eyebrow = tr('night'), title, text, quote = '', choices = [], ending = false }) {
  openStory();
  $('sceneEyebrow').textContent = eyebrow;
  $('sceneTitle').textContent = title;
  $('sceneText').textContent = text;
  $('sceneQuote').textContent = quote;
  $('sceneQuote').classList.toggle('hidden', !quote);
  $('choiceHeading').classList.toggle('hidden', ending);
  $('choices').classList.toggle('hidden', ending);
  $('endingActions').classList.toggle('hidden', !ending);
  $('choices').replaceChildren();
  choices.forEach((choice) => $('choices').appendChild(makeChoice(...choice)));
  $('chapterKicker').textContent = ending ? tr('endingKicker') : `${language === 'tr' ? 'BÖLÜM' : 'CHAPTER'} 0${state.chapter}`;
  const person = state.route ? activeCast()[state.route] : null;
  const routeChapter = person && language === 'tr'
    ? { lyra: "LYRA'NIN HİKÂYESİ", vesper: "VESPER'İN HİKÂYESİ", mara: "MARA'NIN HİKÂYESİ" }[state.route]
    : person ? `${person.name.toUpperCase()}${tr('storySuffix')}` : '';
  $('chapterSmall').textContent = ending ? tr('endingSub') : (state.node === 'arrival' ? tr('chapterName') : person ? routeChapter : tr('chapterTide'));
  $('progressFill').style.width = ending ? '100%' : state.node === 'arrival' ? '16%' : state.node === 'truth' ? '66%' : state.node === 'commit' ? '78%' : '48%';
  $('footerHint').textContent = ending ? tr('thanks') : tr('storyHint');
  renderCast();
  $('narrative-panel')?.classList.remove('fade-in');
  document.querySelector('.narrative-panel').classList.remove('fade-in');
  void document.querySelector('.narrative-panel').offsetWidth;
  document.querySelector('.narrative-panel').classList.add('fade-in');
  save();
}
function enterRoute(route) {
  state.route = route;
  state.node = 'route';
  state.chapter = 2;
  render();
}
function ending(type) {
  state.node = 'ending';
  state.endingType = type;
  state.screen = 'ending';
  state.chapter = 4;
  const story = t().endings;
  if (type === 'truth') {
    displayScene({ eyebrow: story.truth.eyebrow, title: story.truth.title, text: story.truth.text, ending: true });
    return;
  }
  const person = activeCast()[state.route];
  let title, text;
  if (type === 'romance') {
    title = `${person.name}${state.bond ? story.romanceTitleBond : story.romanceTitleNoBond}`;
    text = person.romance[state.bond ? 0 : 1];
  } else if (type === 'friend') {
    title = `${person.name}${story.friendTitle}`;
    text = person.friend;
  } else {
    title = story.soloTitle;
    text = story.solo.replace('{name}', person.name);
  }
  displayScene({ eyebrow: `${person.name.toLocaleUpperCase(language === 'tr' ? 'tr-TR' : 'en-US')} · ${tr('choiceMark')}`, title, text, ending: true });
}
function render() {
  state.screen = state.screen === 'ending' || state.node === 'ending' ? 'ending' : 'story';
  const data = t();
  if (state.node === 'arrival') {
    state.screen = 'story';
    const scene = data.arrival;
    displayScene({ title: scene.title, text: scene.text, quote: scene.quote, choices: scene.choices.map(([label, detail], index) => [label, detail, () => index < 3 ? enterRoute(['lyra', 'vesper', 'mara'][index]) : (state.node = 'truth', state.chapter = 2, render())]) });
  } else if (state.node === 'route' && state.route) {
    const person = activeCast()[state.route];
    const name = person.name.toLocaleUpperCase(language === 'tr' ? 'tr-TR' : 'en-US');
    const role = person.role.toLocaleUpperCase(language === 'tr' ? 'tr-TR' : 'en-US');
    displayScene({ eyebrow: language === 'tr' ? `${name} · ${role}` : `${name} · THE ${role}`, title: person.title, text: person.text, quote: person.quote, choices: person.choices.map(([label, detail, points]) => [label, detail, () => { state.bond = points; state.node = 'commit'; state.chapter = 3; render(); }]) });
  } else if (state.node === 'commit' && state.route) {
    const person = activeCast()[state.route];
    const commitment = data.commitment;
    const lead = language === 'tr' ? `${person.name} kıyının ucunda yanında duruyor. ${data.continuing}` : `${person.name} stands with you at the edge of the shore. ${data.continuing}`;
    const response = language === 'tr' ? `${person.name} gözlerinin içine bakıyor. ${commitment.quote}` : `${person.name} meets your eyes. ${commitment.quote}`;
    displayScene({ eyebrow: tr('dawn'), title: commitment.title, text: `${lead}\n\n${response}`, quote: person.quote, choices: commitment.choices.map(([label, detail], index) => [label, detail, () => ending(['romance', 'friend', 'solo'][index])]) });
  } else if (state.node === 'truth') {
    state.screen = 'story';
    const scene = data.truth;
    displayScene({ eyebrow: scene.eyebrow, title: scene.title, text: scene.text, quote: scene.quote, choices: [[scene.choice[0], scene.choice[1], () => ending('truth')]] });
  } else if (state.node === 'ending') {
    state.screen = 'ending';
    ending(state.endingType || 'truth');
  }
}

$('beginButton').addEventListener('click', begin);
$('continueButton').addEventListener('click', continueStory);
$('restartButton').addEventListener('click', () => { if (confirm(tr('confirmRestart'))) begin(); });
$('playAgainButton').addEventListener('click', begin);
$('titleButton').addEventListener('click', showTitle);
$('homeLink').addEventListener('click', (event) => { event.preventDefault(); showTitle(); });
$('languageSelect').addEventListener('change', (event) => {
  language = event.target.value === 'tr' ? 'tr' : 'en';
  try { localStorage.setItem(LANGUAGE_KEY, language); } catch (_) {}
  localizeShell();
});
$('soundButton').addEventListener('click', async () => {
  const label = $('soundButton').querySelector('span');
  try {
    if (!soundOn) {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) { label.textContent = t().sound.unavailable; return; }
      audioContext = audioContext || new Audio();
      await audioContext.resume();
      const master = audioContext.createGain(); master.gain.value = 0.018; master.connect(audioContext.destination);
      [55, 82.4].forEach((frequency, index) => { const oscillator = audioContext.createOscillator(); const gain = audioContext.createGain(); oscillator.type = 'sine'; oscillator.frequency.value = frequency; gain.gain.value = index ? 0.35 : 0.6; oscillator.connect(gain); gain.connect(master); oscillator.start(); });
      soundOn = true; label.textContent = t().sound.on;
    } else { await audioContext.suspend(); soundOn = false; label.textContent = t().sound.off; }
  } catch (_) { label.textContent = t().sound.unavailable; }
});

localizeShell();
