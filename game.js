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
let audioContext = null;
let soundOn = false;

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
  $('saveStatus').textContent = state.screen === 'ending' ? 'Ending reached · Saved locally' : 'Progress saved locally';
}
function showTitle() {
  $('storyScreen').classList.add('hidden');
  $('welcomeScreen').classList.remove('hidden');
  const saved = readSave();
  $('continueButton').classList.toggle('hidden', !saved || saved.screen === 'title');
  $('saveStatus').textContent = saved && saved.screen !== 'title' ? 'A story is waiting for you' : 'A story about choosing';
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
  $('castList').innerHTML = Object.entries(cast).map(([key, person]) => `<div class="cast-person ${state.route === key ? 'active' : ''}"><div class="avatar ${person.avatar}">${person.initial}</div><div><span class="person-name">${person.name}</span><span class="person-role">${person.role}</span></div></div>`).join('');
}
function makeChoice(label, detail, action, glyph = '✦') {
  const button = document.createElement('button');
  button.className = 'choice-button';
  button.innerHTML = `<span class="choice-glyph" aria-hidden="true">${glyph}</span><span>${label}${detail ? `<small>${detail}</small>` : ''}</span>`;
  button.addEventListener('click', action);
  return button;
}
function displayScene({ eyebrow = 'GEYROPOA · NIGHT', title, text, quote = '', choices = [], ending = false }) {
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
  $('chapterKicker').textContent = ending ? 'THE END' : `CHAPTER 0${state.chapter}`;
  $('chapterSmall').textContent = ending ? 'YOUR STORY CONTINUES' : (state.node === 'arrival' ? 'THE STRANGE SHORE' : state.route ? `${cast[state.route].name.toUpperCase()}’S STORY` : 'THE HEART-TIDE');
  $('progressFill').style.width = ending ? '100%' : state.node === 'arrival' ? '16%' : state.node === 'truth' ? '66%' : state.node === 'commit' ? '78%' : '48%';
  $('footerHint').textContent = ending ? 'Thank you for visiting Geyropoa.' : 'Your choices shape the story.';
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
  const person = cast[route];
  displayScene({ eyebrow: `${person.name.toUpperCase()} · THE ${person.role.toUpperCase()}`, title: person.title, text: person.text, quote: person.quote,
    choices: person.choices.map(([label, detail, points]) => [label, detail, () => { state.bond = points; state.node = 'commit'; state.chapter = 3; render(); }]) });
}
function ending(type) {
  state.node = 'ending';
  state.endingType = type;
  state.screen = 'ending';
  state.chapter = 4;
  if (type === 'truth') {
    displayScene({ eyebrow: 'GEYROPOA · FIRST LIGHT', title: 'A heart, set free', text: 'You walk to the island’s heart and speak the truth aloud: nobody owes love to a spell. The heart-tide breaks like a wave of warm light.\n\nLyra is free to tend her beacon for herself. Vesper can draw a map that leads anywhere. Mara can choose where to plant her seeds. They thank you—not as someone who rescued them, but as the first person who let them choose.\n\nAlone on the shore, you watch the sunrise and wonder what you might choose next.', ending: true });
    return;
  }
  const person = cast[state.route];
  let title, text;
  if (type === 'romance') {
    title = state.bond ? `A future with ${person.name}` : `A beginning with ${person.name}`;
    text = person.romance[state.bond ? 0 : 1];
  } else if (type === 'friend') {
    title = `A friendship with ${person.name}`;
    text = person.friend;
  } else {
    title = 'The road you take alone';
    text = `You thank ${person.name} for trusting you with the truth. You do not promise a romance you cannot give. She looks a little sad, then smiles with relief.\n\nThe three islanders watch you leave together as friends, free to write their own next chapters. You sail toward the mainland beneath a sky full of unfamiliar stars. Choosing honestly is its own kind of kindness.`;
  }
  displayScene({ eyebrow: `${person.name.toUpperCase()} · YOUR CHOICE`, title, text, ending: true });
}
function render() {
  state.screen = state.screen === 'ending' || state.node === 'ending' ? 'ending' : 'story';
  if (state.node === 'arrival') {
    state.screen = 'story';
    displayScene({ eyebrow: 'GEYROPOA · NIGHT', title: 'A shore without footprints', text: 'Your boat drifts into a cove beneath a violet moon. You are the only arrival Geyropoa has seen in years. Three young demon women wait on the beach, each with a different kind of wonder in her eyes.\n\nThey introduce themselves as Lyra, Vesper, and Mara. All three are adults, eighteen or older. Each confesses that the island’s old heart-tide has filled her with a sudden, impossible love for you.\n\nBut they do not ask you to believe a spell. They ask you to stay long enough to meet the people they are when the magic grows quiet.', quote: '“You get to choose,” Lyra says. “And so do we.”', choices: [
      ['Meet Lyra at the lighthouse.', 'A keeper who wants to decide what her light is for.', () => enterRoute('lyra')],
      ['Follow Vesper to her map room.', 'A cartographer looking for a road beyond the island.', () => enterRoute('vesper')],
      ['Walk with Mara through the moon garden.', 'A gardener making plans for a life of her own.', () => enterRoute('mara')],
      ['Ask about the heart-tide.', 'Find out how to break the spell before choosing anyone.', () => { state.node = 'truth'; state.chapter = 2; render(); }]
    ] });
  } else if (state.node === 'route' && state.route) {
    const person = cast[state.route];
    displayScene({ eyebrow: `${person.name.toUpperCase()} · THE ${person.role.toUpperCase()}`, title: person.title, text: person.text, quote: person.quote, choices: person.choices.map(([label, detail, points]) => [label, detail, () => { state.bond = points; state.node = 'commit'; state.chapter = 3; render(); }]) });
  } else if (state.node === 'commit' && state.route) {
    const person = cast[state.route];
    displayScene({ eyebrow: 'GEYROPOA · BEFORE DAWN', title: 'What will you choose?', text: `${person.name} stands with you at the edge of the shore. The heart-tide is fading. Soon, the island’s pull will be gone, and every feeling left here will belong to the person who feels it.\n\n${person.name} meets your eyes. “I care for you,” she says. “But I want your answer to be yours. What do you want our story to be?”`, quote: person.quote, choices: [
      ['Choose a romance together.', 'Be honest about the feelings you want to explore.', () => ending('romance')],
      ['Choose a lasting friendship.', 'Care for each other without becoming a couple.', () => ending('friend')],
      ['Set out alone.', 'Decline romance and leave room for everyone to choose freely.', () => ending('solo')]
    ] });
  } else if (state.node === 'truth') {
    state.screen = 'story';
    displayScene({ eyebrow: 'GEYROPOA · THE ISLAND’S HEART', title: 'The spell beneath the tide', text: 'At the island’s center, you find a pool of black water ringed with old runes. Vesper’s map fits the stones. The heart-tide is not a curse exactly—it magnifies longing until it feels like destiny.\n\nThe three women can break it, but only if someone speaks the thing the spell cannot understand: love is a choice, not a debt. You could say the words and leave all three free to discover what they truly feel.', quote: 'The tide stills. The island waits.', choices: [['Break the heart-tide.', 'Give every heart back to its owner.', () => ending('truth')]] });
  } else if (state.node === 'ending') {
    state.screen = 'ending';
    ending(state.endingType || 'truth');
  }
}

$('beginButton').addEventListener('click', begin);
$('continueButton').addEventListener('click', continueStory);
$('restartButton').addEventListener('click', () => { if (confirm('Start a new story? Your current saved progress will be replaced.')) begin(); });
$('playAgainButton').addEventListener('click', begin);
$('titleButton').addEventListener('click', showTitle);
$('homeLink').addEventListener('click', (event) => { event.preventDefault(); showTitle(); });
$('soundButton').addEventListener('click', async () => {
  const label = $('soundButton').querySelector('span');
  try {
    if (!soundOn) {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return;
      audioContext = audioContext || new Audio();
      await audioContext.resume();
      const master = audioContext.createGain(); master.gain.value = 0.018; master.connect(audioContext.destination);
      [55, 82.4].forEach((frequency, index) => { const oscillator = audioContext.createOscillator(); const gain = audioContext.createGain(); oscillator.type = 'sine'; oscillator.frequency.value = frequency; gain.gain.value = index ? 0.35 : 0.6; oscillator.connect(gain); gain.connect(master); oscillator.start(); });
      soundOn = true; label.textContent = 'Sound on';
    } else { await audioContext.suspend(); soundOn = false; label.textContent = 'Sound off'; }
  } catch (_) { label.textContent = 'Sound unavailable'; }
});

showTitle();
