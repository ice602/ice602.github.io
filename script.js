async function loadDatabase() {
    const response = await fetch('songs.json');
    return await response.json();
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
            displayVideo(results[0]); // 첫 번째 결과만 표시
        } else {
            document.getElementById('videoResult').innerHTML = '<p>노래를 찾을 수 없습니다!</p>';
        }
    });
}

function displayVideo(song) {
    const videoId = song.videoUrl.split('v=')[1];
    const languageText = song.language
        .map(lang => ({
            jp: "일본어",
            en: "영어",
            kr: "한국어"
        }[lang] || lang))
        .join(", ");

    const videoResult = document.getElementById('videoResult');
    videoResult.innerHTML = `
        <iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
        <p class="language-info">지원 언어: ${languageText}</p>
    `;
}