const { MessageEmbed } = require('discord.js');
const FuzzySet = require('fuzzyset');
const {
  regionRoutes,
  pokemonList,
  RouteGemTypes,
  PokemonType,
  pokemonTypeIcons,
  gameVersion,
  GameConstants,
} = require('../helpers.js');
const { website } = require('../config.js');

const fuzzyRoutes = FuzzySet(regionRoutes.map(r => r.routeName.toLowerCase()), false);

module.exports = {
  name        : 'route',
  aliases     : ['routes', 'routeinfo', 'r'],
  description : 'Get PokéClicker game info about a specific route',
  args        : [
    {
      name: 'name',
      type: 'STRING',
      description: 'Route number/name',
      required: true,
    },
    {
      name: 'region',
      type: 'INTEGER',
      description: 'Region name',
      required: false,
      choices: [
        // copy(GameHelper.enumStrings(GameConstants.Region).filter(r => r != 'none').map(r => `{
        //   name: '${r.replace(/\b\w/g, m => m.toUpperCase())}',
        //   value: ${GameConstants.Region[r]},
        // },`).join('\n'))
        {
          name: 'Kanto',
          value: 0,
        },
        {
          name: 'Johto',
          value: 1,
        },
        {
          name: 'Hoenn',
          value: 2,
        },
        {
          name: 'Sinnoh',
          value: 3,
        },
        {
          name: 'Unova',
          value: 4,
        },
        {
          name: 'Kalos',
          value: 5,
        },
        {
          name: 'Alola',
          value: 6,
        },
        {
          name: 'Galar',
          value: 7,
        },
      ],
    },
  ],
  guildOnly   : true,
  cooldown    : 3,
  botperms    : ['SEND_MESSAGES', 'EMBED_LINKS'],
  userperms   : [],
  channels    : ['bot-commands'],
  execute     : async (interaction) => {
    const [
      routeNumberName,
      regionID,
    ] = [
      interaction.options.get('name').value,
      interaction.options.get('region')?.value,
    ];

    const filteredRoutes = regionRoutes.filter(routeData => (regionID == undefined || routeData.region == regionID));
    let route = filteredRoutes.find(routeData => {
      if (routeData.routeName.endsWith(` ${routeNumberName}`))
        return routeData;
    });
    if (!route) {
      const newNames = fuzzyRoutes.get(routeNumberName);
      if (newNames) {
        route = filteredRoutes.find(routeData => {
          if (routeData.routeName.toLowerCase() == newNames[0][1])
            return routeData;
        });
      }
    }

    if (!route) return interaction.reply(`Route not found${regionID != undefined ? ` in ${GameConstants.Region[regionID]}` : ''}..`);

    let pokemon = Object.values(route.pokemon).flat();
    pokemon = pokemon[Math.floor(Math.random() * pokemon.length)];
    // Handle special encounters
    pokemon = pokemon.pokemon ?? pokemon;
    pokemon = pokemonList.find(p => p.name == pokemon);
    if (!pokemon) pokemon = pokemonList[0];

    const shiny = !Math.floor(Math.random() * 512);

    const embed = new MessageEmbed()
      .setTitle(`${GameConstants.Region[route.region].toUpperCase()} | ${route.routeName}`)
      .setThumbnail(`${website}assets/images/${shiny ? 'shiny' : ''}pokemon/${pokemon.id}.png`)
      .setColor('#3498db')
      .setFooter({ text: `Data is up to date as of v${gameVersion}` });

    //embed.addField('❯ Pokemon', '\u200b');
    Object.entries(route.pokemon).forEach(([type, pokemon]) => {
      if (!pokemon.length) return;
      const desc = [];
      desc.push('```prolog');
      if (type == 'special') {
        pokemon = [...new Set(pokemon.map(p => p.pokemon).flat())];
      }
      pokemon.sort().forEach(p => desc.push(p));
      desc.push('```');
      embed.addField(`❯ ${type.toUpperCase()}`, desc.join('\n'), true);
    });

    embed.addField('\u200b', '\u200b', false);

    // Gems:
    let gemsInfo;
    Object.entries(RouteGemTypes).forEach(([region, routes]) => {
      if (region == route.region && routes[route.number]) gemsInfo = routes[route.number];
    });
    if (gemsInfo) {
      const descIcon = [];
      Object.entries(gemsInfo).sort(([,a], [,b]) => b - a).forEach(([type, chance]) => {
        descIcon.push(`${pokemonTypeIcons[PokemonType[type]]} **\`${PokemonType[type].padEnd(10, ' ')} ${chance.toFixed(1).padStart(4, ' ')}%\`**`);
      });
      descIcon.push('_this excludes special encounters_');
      embed.addField('❯ GEMS', descIcon.join('\n'), true);
    }

    interaction.reply({ embeds: [embed] });
  },
};
