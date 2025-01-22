const { prisma } = require("./common");
const { faker } = require("@faker-js/faker");

const seed = async () => {
  try {
    const numUsers = 5;
    const numTracks = 20;
    const numPlaylists = 10;

    // Create tracks
    const tracks = [];
    for (let k = 0; k < numTracks; k++) {
      tracks.push({
        title: faker.music.songName(),
        artist: faker.person.fullName(),
      });
    }

    // Insert tracks into the database
    const createdTracks = await prisma.track.createMany({
      data: tracks,
    });

    console.log(`${tracks.length} tracks created.`);

    // Create users
    const users = [];
    for (let i = 0; i < numUsers; i++) {
      users.push({
        username: faker.internet.userName(),
        email: faker.internet.email(),
      });
    }

    // Insert users into the database
    const createdUsers = await Promise.all(
      users.map((user) => prisma.user.create({ data: user }))
    );

    console.log(`${users.length} users created.`);

    // Create playlists
    const playlists = [];
    for (let j = 0; j < numPlaylists; j++) {
      const randomOwner =
        createdUsers[Math.floor(Math.random() * createdUsers.length)];
      const randomTracks = tracks
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.ceil(Math.random() * 5));

      playlists.push({
        name: faker.music.album(),
        description: faker.lorem.sentence(),
        ownerId: randomOwner.id,
        tracks: randomTracks.map((track) => ({ id: track.id })),
      });
    }

    // Insert playlists into the database
    for (const playlist of playlists) {
      await prisma.playlist.create({
        data: {
          name: playlist.name,
          description: playlist.description,
          owner: { connect: { id: playlist.ownerId } },
          tracks: { connect: playlist.tracks },
        },
      });
    }

    console.log(`${playlists.length} playlists created.`);

    console.log("Database seeding complete.");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await prisma.$disconnect();
  }
};

seed();
