(() => {
  // Artist profile content and booking links. No audio player is included.
  const artists = [
    {
      id: "manuel-moreno",
      booking: "https://forms.cloud.microsoft/e/2b4k9RSfFY",
      name: "Manuel Moreno",
      genres: "Atmospheric Techno",
      based: "Switzerland",
      instagram: "https://www.instagram.com/manuelmorenomusic/",
      music: "https://www.manuelmoreno.ch/",
      bio: "“The communication with the audience is especially important to me”, says Manuel. It doesn’t matter whether 30 or 5000 people are dancing. “When I get the feeling of being at one with the audience, I know it’s been a successful appearance.” For this feeling he travels the globe. His unmistakable, atmospheric style takes him to metropolises such as Bangkok, Moscow, Kiev, Lisbon, Ibiza, Prague and Cape Town, to mention just a few.",
    },
    {
      id: "caromelle",
      booking: "https://forms.cloud.microsoft/e/aSEjHenCPY",
      name: "Caromelle",
      genres: "Melodic House / Organic",
      based: "",
      instagram: "https://www.instagram.com/caromelle_/",
      music: "https://linktr.ee/caromelle_",
      bio: "“Getting lost in the music and finding yourself in the moment” is probably the best way to describe the feeling that has ignited Caromelle’s fascination for electronic music. Fresh, playful, cheeky, but at the same time profound and somewhat melancholic — this is how Caromelle would best describe her sets, which are a blend of organic and melodic house. Feeling and embracing the love for music and sharing it with people on the dance floor – that’s what makes Caromelle feel alive.",
    },
    {
      id: "caridino",
      booking: "https://forms.cloud.microsoft/e/fuXNx2FHsh",
      name: "Caridino",
      photo: "assets/caridino-2026.jpg",
      genres: "Tech House / Indie Tech",
      based: "St. Gallen",
      instagram: "https://www.instagram.com/caridino/",
      music: "https://soundcloud.com/caridino",
      bio: "Caridino is a Swiss DJ shaping high-energy dancefloors. Her sound blends groovy, vocal-driven tech house with melodic textures, moving between playful rhythms and powerful momentum. Guided by instinct, emotion and a deep connection to the crowd, her sets are fluid, dynamic and built to move people. She brings a strong, positive energy that is felt instantly, paired with a captivating presence that lights up the room — creating moments of movement and connection.",
    },
    {
      id: "aiia",
      booking: "https://forms.cloud.microsoft/e/dnp9kWGXuJ",
      name: "AIIA",
      genres: "Melodic House / Techno",
      based: "Zurich",
      instagram: "https://www.instagram.com/aiia.music_/",
      music: "",
      bio: "AIIA is an electronic DJ duo based in Zurich. Bringing together over a decade of experience behind the decks, the project combines technical depth with a fresh, evolving perspective. Their sound moves between melodic atmosphere and driving rhythms, guided by instinct, precision and a deep understanding of the dancefloor. AIIA builds sets that are focused, fluid and intentional — designed for dancefloors that value both depth and momentum.",
    },
  ];
  const artistDialog = document.querySelector("#artist-dialog");
  document.querySelectorAll("[data-artist]").forEach((button) =>
    button.addEventListener("click", () => {
      const artist = artists.find((a) => a.id === button.dataset.artist);
      artistDialog.querySelector(".profile-photo").src =
        artist.photo || "assets/" + artist.id + ".jpg";
      artistDialog.querySelector(".profile-photo").alt = artist.name;
      artistDialog.querySelector("#artist-name").textContent = artist.name;
      artistDialog.querySelector(".profile-genres").textContent = artist.genres;
      const location = artistDialog.querySelector(".profile-location");
      location.textContent = artist.based ? "Based in " + artist.based : "";
      location.hidden = !artist.based;
      artistDialog.querySelector(".profile-bio").textContent = artist.bio;
      artistDialog.querySelector(".profile-book").href =
        artist.booking;
      artistDialog.querySelector(".profile-instagram").href = artist.instagram;
      const music = artistDialog.querySelector(".profile-music");
      music.hidden = !artist.music;
      if (artist.music) music.href = artist.music;
      artistDialog.showModal();
      artistDialog.scrollTop = 0;
    }),
  );
})();
