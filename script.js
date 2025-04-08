async function loadDatabase() {
    const SHEET_ID = '1jCaOGoqhavuJnscDA_wSTNMqVCGT6WRuXkDZwjKcH3Q';
    const url = `https://spreadsheets.google.com/feeds/list/${SHEET_ID}/1/public/values?alt=json`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Sheet not loaded: ${response.status}`);
        const data = await response.json();

        const songs = data.feed.entry.map(entry => ({
            title: entry.gsx$title.$t,
            artist: entry.gsx$artist.$t,
            videoUrl: entry.gsx$videourl.$t,
            karaokeId: entry.gsx$karaokeid.$t,
            language: entry.gsx$language.$t.split(',')
        }));
        console.log('data:', songs);
        return songs;
    } catch (error) {
        console.error(error);
        document.getElementById('videoResult').innerHTML = '<p>데이터 로드중 에러 발생!</p>';
    }
}

function normalizeJapanese(text) {
    return text.replace(/[\u3040-\u309F]/g, ch =>
        String.fromCharCode(ch.charCodeAt(0) + 0x60)
    ).toLowerCase();
}

function searchSong() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const normalizedQuery = normalizeJapanese(query);

    loadDatabase().then(songs => {
        if (!songs) return;
        const results = songs.filter(song => {
            const title = song.title.toLowerCase();
            const artist = song.artist.toLowerCase();
            const normalizedTitle = normalizeJapanese(title);
            const normalizedArtist = normalizeJapanese(artist);

            return title.includes(query) || artist.includes(query) ||
                normalizedTitle.includes(normalizedQuery) ||
                normalizedArtist.includes(normalizedQuery);
        });

        if (results.length > 0) {
            displayVideo(results[0]);
        } else {
            document.getElementById('videoResult').innerHTML = '<p>노래를 찾을 수 없습니다!</p>';
        }
    });
}

function displayVideo(song) {
    const videoId = song.videoUrl.split('v=')[1];
    const languageText = song.language
        .map(lang => ({ jp: "일본어", en: "영어", kr: "한국어" }[lang.trim()] || lang.trim()))
        .join(", ");

    document.getElementById('videoResult').innerHTML = `
        <iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
        <p class="language-info">지원 언어: ${languageText}</p>
    `;
}

document.getElementById('searchInput').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        searchSong();
    }
});