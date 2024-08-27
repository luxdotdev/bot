import type {
  Scrim,
  Team,
  User,
  Map,
  PlayerStat,
  RoundEnd,
  MatchStart,
  ObjectiveCaptured,
} from "@prisma/client";
import { $Enums, PrismaClient } from "@prisma/client";
import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  ApplicationCommandType,
  ChatInputCommandInteraction,
  ButtonInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Events,
  AttachmentBuilder,
} from "discord.js";
import path from "path";
import {
  aggregatePlayerData,
  heroPriority,
  type PlayerData,
} from "./aggregateStats";
import { toTitleCase, round, toKebabCase } from "./lib/utils";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const prisma = new PrismaClient();

async function findUserByDiscordId(discordId: string): Promise<User | null> {
  const account = await prisma.account.findFirst({
    where: {
      provider: "discord",
      providerAccountId: discordId,
    },
    include: { User: true },
  });

  return account?.User || null;
}

const authenticatedUsers = new Map<string, string>();

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN!);

async function registerCommands() {
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), {
      body: [
        {
          name: "sign-in",
          description: "Sign in to access your dashboard and scrims",
          type: ApplicationCommandType.ChatInput,
        },
        {
          name: "dashboard",
          description: "View your profile and teams",
          type: ApplicationCommandType.ChatInput,
        },
      ],
    });

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
}

registerCommands();

async function createDashboardEmbed(user: User & { Team: Team[] }) {
  const embed = new EmbedBuilder()
    .setAuthor({
      name: "Parsertime",
      iconURL:
        "https://parsertime.app/_next/image?url=%2Fparsertime.png&w=48&q=75",
      url: "https://parsertime.app",
    })
    .setTitle("Profile")
    .setColor("Random")
    .setThumbnail(user.image || "https://avatar.vercel.sh/parsertime.png")
    .addFields(
      { name: "Name", value: user.name || "Not set", inline: true },
      { name: "Email", value: user.email || "Not set", inline: true },
      { name: "Plan", value: toTitleCase(user.billingPlan), inline: true }
    )
    .setFooter({
      text: "Parsertime by lux.dev",
      iconURL:
        "https://parsertime.app/_next/image?url=%2Fparsertime.png&w=48&q=75",
    });

  if (user.Team.length > 0) {
    embed.addFields({
      name: "\u200B",
      value: "**Your Teams:**",
      inline: false,
    });
    user.Team.forEach((team: Team) => {
      embed.addFields({ name: team.name, value: "\u200B", inline: true });
    });
  } else {
    embed.addFields({
      name: "Teams",
      value: "You are not a member of any teams.",
    });
  }

  return embed;
}

async function createScrimsEmbed(
  team: Team,
  scrims: (Scrim & { creator?: User })[]
) {
  const embed = new EmbedBuilder()
    .setAuthor({
      name: "Parsertime",
      iconURL:
        "https://parsertime.app/_next/image?url=%2Fparsertime.png&w=48&q=75",
      url: "https://parsertime.app",
    })
    .setTitle(`Recent Scrims for ${team.name}`)
    .setColor("Random")
    .setThumbnail(team.image || "https://avatar.vercel.sh/team.png")
    .setFooter({
      text: "Parsertime by lux.dev",
      iconURL:
        "https://parsertime.app/_next/image?url=%2Fparsertime.png&w=48&q=75",
    });

  if (scrims.length > 0) {
    for (const [index, scrim] of scrims.entries()) {
      let creatorName = "Unknown";
      if (!scrim.creator) {
        const creator = await prisma.user.findUnique({
          where: { id: scrim.creatorId },
          select: { name: true },
        });
        creatorName = creator?.name || "Unknown";
      } else {
        creatorName = scrim.creator.name || "Unknown";
      }

      embed.addFields({
        name: `Scrim #${index + 1}`,
        value: `Name: ${
          scrim.name
        }\n Date: ${scrim.date.toDateString()}\n Creator: ${creatorName}`,
        inline: false,
      });
    }
  } else {
    embed.setDescription("No recent scrims found for this team.");
  }

  return embed;
}

async function createMapsEmbed(
  scrim: Scrim & {
    Map: Map[];
  },
  playerStats: PlayerStat[],
  roundEnds: RoundEnd[],
  matchStarts: MatchStart[],
  team1Captures: ObjectiveCaptured[],
  team2Captures: ObjectiveCaptured[],
  page: number = 1
) {
  const totalPages = scrim.Map.length;
  page = Math.max(1, Math.min(page, totalPages));

  const embed = new EmbedBuilder()
    .setAuthor({
      name: "Parsertime",
      iconURL:
        "https://parsertime.app/_next/image?url=%2Fparsertime.png&w=48&q=75",
      url: "https://parsertime.app",
    })
    .setTitle(scrim.name)
    .setColor("Random")
    .setDescription(`${scrim.date.toDateString()}\n`)
    .setFooter({
      text: "Parsertime by lux.dev",
      iconURL:
        "https://parsertime.app/_next/image?url=%2Fparsertime.png&w=48&q=75",
    });

  let attachment: AttachmentBuilder | null = null;

  if (scrim.Map.length > 0) {
    const map = scrim.Map[page - 1];
    const mapStats = playerStats.filter((stat) => stat.MapDataId === map.id);
    const roundEnd = roundEnds.find((round) => round.MapDataId === map.id);
    const matchStart = matchStarts.find((start) => start.MapDataId === map.id);
    const replayCode = map.replayCode ? "Replay Code" : "\u200B";

    embed.addFields(
      { name: map.name, value: `Map ${page} of ${totalPages}\n`, inline: true },
      {
        name: replayCode,
        value: map.replayCode || "\u200B",
        inline: true,
      }
    );

    if (mapStats.length > 0 && matchStart) {
      const mapStats = playerStats.filter((stat) => stat.MapDataId === map.id);
      const aggregatedStats = aggregatePlayerData(mapStats);

      const sortByRole = (a: PlayerData, b: PlayerData) => {
        return (
          heroPriority[a.role as keyof typeof heroPriority] -
          heroPriority[b.role as keyof typeof heroPriority]
        );
      };

      const team1Players = aggregatedStats
        .filter((stat) => stat.playerTeam === matchStart.team_1_name)
        .sort(sortByRole);
      const team2Players = aggregatedStats
        .filter((stat) => stat.playerTeam === matchStart.team_2_name)
        .sort(sortByRole);

      // Create stat strings for each team
      const createStatString = (players: PlayerData[]) => {
        return players
          .map(
            (stat) =>
              `${stat.playerName} (${stat.role}):\n Elims: ${stat.eliminations} | Final Blows: ${stat.kills} | Deaths: ${stat.deaths}\n ` +
              `Damage Dealt: ${round(
                stat.heroDmgDealt
              )} | Damage Received: ${round(
                stat.dmgReceived
              )}\n Healing Received: ${round(
                stat.healingReceived
              )} | Healing Dealt: ${round(stat.healingDealt)}\n`
          )
          .join("\n");
      };

      const team1Stats = createStatString(team1Players);
      const team2Stats = createStatString(team2Players);

      embed.addFields(
        {
          name: matchStart.team_1_name,
          value: team1Stats || "No data",
          inline: false,
        },
        {
          name: matchStart.team_2_name,
          value: team2Stats || "No data",
          inline: false,
        }
      );

      let scoreString = "N/A";
      let winnerString = "N/A";

      if (matchStart && roundEnd) {
        const mapType = matchStart.map_type;
        let winner = "";
        let score = "";

        switch (mapType) {
          case $Enums.MapType.Control:
            winner =
              roundEnd.team_1_score > roundEnd.team_2_score
                ? matchStart.team_1_name
                : matchStart.team_2_name;
            score = `${roundEnd?.team_1_score} - ${roundEnd?.team_2_score}`;
            break;

          case $Enums.MapType.Escort:
            if (team1Captures.length === 0) winner = matchStart.team_2_name;
            else if (team2Captures.length === 0)
              winner = matchStart.team_1_name;
            else if (team1Captures.length === team2Captures.length) {
              winner =
                team1Captures[team1Captures.length - 1]?.match_time_remaining >
                team2Captures[team2Captures.length - 1]?.match_time_remaining
                  ? matchStart.team_1_name
                  : matchStart.team_2_name;
            } else {
              winner =
                team1Captures.length > team2Captures.length
                  ? matchStart.team_1_name
                  : matchStart.team_2_name;
            }
            // account for game setting score to 3 to ensure map completion
            score = `${team1Captures.length} - ${team2Captures.length}`;
            break;

          case $Enums.MapType.Flashpoint:
            winner =
              roundEnd.team_1_score > roundEnd.team_2_score
                ? matchStart.team_1_name
                : matchStart.team_2_name;
            score = `${roundEnd?.team_1_score} - ${roundEnd?.team_2_score}`;
            break;

          case $Enums.MapType.Hybrid:
            if (!team1Captures.length) winner = matchStart.team_2_name;
            else if (!team2Captures.length) winner = matchStart.team_1_name;
            else if (team1Captures.length === team2Captures.length) {
              winner =
                team1Captures[team1Captures.length - 1]?.match_time_remaining >
                team2Captures[team2Captures.length - 1]?.match_time_remaining
                  ? matchStart.team_1_name
                  : matchStart.team_2_name;
            } else {
              winner =
                team1Captures.length > team2Captures.length
                  ? matchStart.team_1_name
                  : matchStart.team_2_name;
            }
            // account for game setting score to 3 to ensure map completion
            score = `${team1Captures.length} - ${team2Captures.length}`;
            break;

          case $Enums.MapType.Push:
            winner = "N/A";
            score = "N/A";
            break;

          default:
            winner = "N/A";
            score = "N/A";
        }

        scoreString = `${score}`;
        winnerString = `Winner: ${winner}`;
      }

      embed.addFields(
        { name: "Score", value: scoreString, inline: true },
        { name: winnerString, value: "\u200B", inline: false }
      );
    } else {
      embed.addFields({
        name: "Stats",
        value: "No data available for this map.",
      });
    }

    const imagePath = path.join(
      __dirname,
      "..",
      "public",
      "maps",
      `${toKebabCase(map.name)}.webp`
    );
    attachment = new AttachmentBuilder(imagePath);
    embed.setImage(`attachment://${toKebabCase(map.name)}.webp`);
  } else {
    embed.addFields({ name: "Maps", value: "No maps set for this scrim." });
  }

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`prevMap_${scrim.id}_${page - 1}`)
      .setLabel("Previous Map")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(page === 1),
    new ButtonBuilder()
      .setCustomId(`nextMap_${scrim.id}_${page + 1}`)
      .setLabel("Next Map")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(page === totalPages)
  );

  return { embed, attachment, components: [row] };
}

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand() && !interaction.isButton()) return;

  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "sign-in") {
      await handleSignInCommand(interaction);
    } else if (interaction.commandName === "dashboard") {
      await handleDashboardCommand(interaction);
    }
  } else if (interaction.isButton()) {
    if (interaction.customId === "sign_in_button") {
      await handleSignInButton(interaction);
    } else if (interaction.customId.startsWith("dashboard")) {
      const userId = interaction.customId.split("_")[1];
      await showDashboard(interaction, userId);
    } else if (interaction.customId.startsWith("team_")) {
      await handleTeamButton(interaction);
    } else if (interaction.customId.startsWith("scrim_")) {
      await handleScrimButton(interaction);
    } else if (
      interaction.customId.startsWith("prevMap_") ||
      interaction.customId.startsWith("nextMap_")
    ) {
      await interaction.deferUpdate();
      await handleScrimButton(interaction);
    }
  }
});

async function handleDashboardCommand(
  interaction: ChatInputCommandInteraction
) {
  const discordId = interaction.user.id;
  const userId = authenticatedUsers.get(discordId);

  if (userId) {
    await showDashboard(interaction, userId);
  } else {
    await interaction.reply({
      content: "Please sign in first using /sign-in",
      ephemeral: true,
    });
  }
}

async function handleSignInCommand(interaction: ChatInputCommandInteraction) {
  const discordId = interaction.user.id;
  const userId = authenticatedUsers.get(discordId);

  if (userId) {
    const embed = new EmbedBuilder()
      .setAuthor({
        name: "Parsertime",
        url: "https://parsertime.app",
      })
      .setTitle("Already Signed In")
      .setColor("#00FF00")
      .setDescription(
        "You are already signed in. Click the button below to view your dashboard."
      )
      .setThumbnail(
        "https://parsertime.app/_next/image?url=%2Fparsertime.png&w=48&q=75"
      )
      .setFooter({
        text: "Parsertime by lux.dev",
        iconURL:
          "https://parsertime.app/_next/image?url=%2Fparsertime.png&w=48&q=75",
      });

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`dashboard_${userId}`)
        .setLabel("Dashboard")
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true,
    });
  } else {
    const embed = new EmbedBuilder()
      .setAuthor({
        name: "Parsertime",
        url: "https://parsertime.app",
      })
      .setTitle("Sign In")
      .setColor("Random")
      .setDescription("Click the button below to sign in to your account.")
      .setThumbnail(
        "https://parsertime.app/_next/image?url=%2Fparsertime.png&w=48&q=75"
      )
      .setFooter({
        text: "Parsertime by lux.dev",
        iconURL:
          "https://parsertime.app/_next/image?url=%2Fparsertime.png&w=48&q=75",
      });

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("sign_in_button")
        .setLabel("Sign In")
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true,
    });
  }
}

async function handleSignInButton(interaction: ButtonInteraction) {
  const discordId = interaction.user.id;
  const user = await findUserByDiscordId(discordId);

  if (user) {
    authenticatedUsers.set(discordId, user.id);
    await interaction.update({
      content: "You have successfully signed in!",
      components: [],
    });
    await showDashboard(interaction, user.id);
  } else {
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({
        content:
          "No account found linked with your Discord ID. Please make sure you've connected your Discord account: https://parsertime.app/sign-in",
      });
    } else {
      await interaction.reply({
        content:
          "No account found linked with your Discord ID. Please make sure you've connected your Discord account: https://parsertime.app/sign-in",
        ephemeral: true,
      });
    }
  }
}

async function handleTeamButton(interaction: ButtonInteraction) {
  const teamId = interaction.customId.split("_")[1];
  const team = await prisma.team.findUnique({
    where: { id: parseInt(teamId) },
  });

  if (!team) {
    await interaction.reply({
      content: "Team not found.",
      ephemeral: true,
    });
    return;
  }

  const scrims = await prisma.scrim.findMany({
    where: { teamId: team.id },
    orderBy: { date: "desc" },
    take: 5,
  });

  const embed = await createScrimsEmbed(team, scrims);

  const rows = scrims.map((scrim) =>
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`scrim_${scrim.id}`)
        .setLabel(`View ${scrim.name}`)
        .setStyle(ButtonStyle.Secondary)
    )
  );

  await interaction.reply({
    embeds: [embed],
    components: rows,
    ephemeral: true,
  });
}

async function handleScrimButton(interaction: ButtonInteraction) {
  const [action, scrimId, page] = interaction.customId.split("_");
  const pageNumber = parseInt(page) || 1;

  const scrim = await prisma.scrim.findUnique({
    where: { id: parseInt(scrimId) },
    include: { Map: true },
  });

  if (!scrim) {
    await interaction.reply({
      content: "Scrim not found.",
      ephemeral: true,
    });
    return;
  }

  const playerStats = await prisma.playerStat.findMany({
    where: { scrimId: parseInt(scrimId) },
  });

  const roundEnds = await prisma.roundEnd.findMany({
    where: { scrimId: parseInt(scrimId) },
  });

  const matchStarts = await prisma.matchStart.findMany({
    where: { scrimId: parseInt(scrimId) },
  });

  const team1Captures = await prisma.objectiveCaptured.findMany({
    where: { scrimId: parseInt(scrimId), capturing_team: "team_1" },
  });

  const team2Captures = await prisma.objectiveCaptured.findMany({
    where: { scrimId: parseInt(scrimId), capturing_team: "team_2" },
  });

  const { embed, attachment, components } = await createMapsEmbed(
    scrim,
    playerStats,
    roundEnds,
    matchStarts,
    team1Captures,
    team2Captures,
    pageNumber
  );

  if (interaction.deferred) {
    await interaction.editReply({
      embeds: [embed],
      files: attachment ? [attachment] : undefined,
      components: components,
    });
  } else {
    await interaction.reply({
      embeds: [embed],
      files: attachment ? [attachment] : undefined,
      components: components,
      ephemeral: true,
    });
  }
}

async function showDashboard(
  interaction: ChatInputCommandInteraction | ButtonInteraction,
  userId: string
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { Team: true },
    });

    if (user) {
      const embed = await createDashboardEmbed(user);
      const subscriptionButton = new ButtonBuilder()
        .setLabel("Manage Your Subscription")
        .setURL("https://parsertime.app/pricing")
        .setStyle(ButtonStyle.Link);

      const teamButtons = user.Team.map((team) =>
        new ButtonBuilder()
          .setCustomId(`team_${team.id}`)
          .setLabel(`${team.name} Scrims`)
          .setStyle(ButtonStyle.Secondary)
      );

      const rows = [
        new ActionRowBuilder<ButtonBuilder>().addComponents(subscriptionButton),
      ];

      // Add team buttons in groups of 5
      for (let i = 0; i < teamButtons.length; i += 5) {
        rows.push(
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            teamButtons.slice(i, i + 5)
          )
        );
      }

      const replyOptions = {
        embeds: [embed],
        components: rows,
        ephemeral: true,
      };

      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(replyOptions);
      } else {
        await interaction.reply(replyOptions);
      }
    } else {
      const errorMessage =
        "Unable to fetch your information. Please try again later.";
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ content: errorMessage });
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true });
      }
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    const errorMessage = "An error occurred while fetching your information.";
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ content: errorMessage });
    } else {
      await interaction.reply({ content: errorMessage, ephemeral: true });
    }
  }
}

client.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
