var fields = [
  { type: "row",
    style: "major",
    fields: [
      { name: "Name",      type: "string", placeholder: "Goblin", style: "floatLeft" },
      { name: "CR",        type: "string", placeholder: "1", style: "right", formatter: function(v){ s="CR " + v; var mr = $("#sbMR").val(); if(mr) s += "/MR " + mr; return s } },
      { name: "MR", type: "string", display: "Mythic Rank", style: "none" }
    ]
  },
  { name: "XP", label: "XP", type: "string", placeholder: "100" },
  { type: "row", fields: [
      { name: "Race", type: "string", placeholder: "Goblin" },
      { name: "Class", type: "string", placeholder: "warrior 1" }
    ]
  },
  { type: "row", fields: [
      { name: "Alignment", type: "select", options: [ "CE", "CN", "CG", "NE", "N", "NG", "LE", "LN", "LG" ] },
      { name: "Size",      type: "select", options: [ "Fine", "Diminutive", "Tiny", "Small", "Medium", "Large", "Huge", "Gargantuan", "Colossal" ] },
      { name: "Type",      type: "select", options: [ "aberration", "animal", "construct", "dragon", "fey", "humanoid", "magical beast", "monstrous humanoid", "ooze", "outsider", "plant", "undead", "vermin" ] },
      { name: "Subtype",   type: "multi",  options: [
          "adlet", "aeon", "agathion", "air", "angel", "aquatic", "archon",
          "asura", "augmented", "azata", "behemoth", "catfolk", "chaotic",
          "clockwork", "cold", "colossus", "daemon", "dark folk", "demodand",
          "demon", "devil", "div", "dwarf", "earth", "elemental", "elf",
          "evil", "extraplanar", "fire", "giant", "gnome", "goblinoid",
          "godspawn", "good", "great old one", "halfling", "herald", "human",
          "incorporeal", "inevitable", "kaiju", "kami", "kasatha", "kitsune",
          "kyton", "lawful", "leshy", "mythic", "native", "nightshade", "oni",
          "orc", "protean", "psychopomp", "qlippoth", "rakshasa", "ratfolk",
          "reptilian", "robot", "samsaran", "sasquatch", "shapechanger",
          "swarm", "troop", "udaeus", "unbreathing", "vanara", "vishkanya",
          "water"
        ],
        formatter: function(v){ if(v==""){return "";}{return "(" + v + ")";} }
      }
    ]
  },
  { type: "row", style: "optList", delimiter: ";", fields: [
      { name: "Init", label: "Init", type: "string", placeholder: "+1" },
      { name: "Senses", label: "Senses", type: "multi", options: [
          "all-around vision", "blindsense 20ft.", "blindsense 40ft.",
          "blindsight 30ft.", "blindsight 90ft.", "darkvision 60ft.",
          "detect chaos", "detect evil", "detect good", "detect law", "detect magic",
          "detect snares and pits", "low-light vision", "scent",
          "see in darkness", "see invisibility", "tremorsense 60ft.",
          "true seeing"
        ]
      },
      { name: "Perception", type: "string", style: "skill" }
    ]
  },
  { name: "Aura", type: "multi", label: "Aura", options: [
      { name: "electricity (5 ft., DC 12)", label: "Electricity Aura", type: "Su", description: "an emerald automaton reduced to half its hit points or fewer emits hazardous energy from its damaged magical battery. Any non-construct creature that ends its turn within 5 feet of a damaged emerald automaton takes 1d10 points of electricity damage (Reflex DC 12 negates). The save DC is Constitution-based." }
    ]
  },
  { name: "Defense", style: "separator" },
  { name: "AC", display: "Armor Class", style: "custom", type: "row", fields: [
      { name: "armor",      type: "string", placeholder: "+1", style: "hidden", touch: 0, flat: 1 },
      { name: "deflection", type: "string", placeholder: "+1", style: "hidden", touch: 1, flat: 1 },
      { name: "dex",    skip: 1, type: "hidden", retriever: function() { return parseInt($("#sbdexterity").val())/2 - 5; }, touch: 1, flat: 0 },
      { name: "dodge",  type: "string", placeholder: "+1", style: "hidden", touch: 1, flat: 0 }, // TODO: Replace 'flat' with function determining if the npc has a feat or class that adds dodge bonus while flat-footed
      { name: "natural", type: "string", placeholder: "+1", touch: 0, flat: 1 },
      { name: "shield", type: "string", placeholder: "+1", style: "hidden", touch: 0, flat: 1 },
      { name: "size", skip: 1, type: "hidden", retriever: function(){
          var sizeBonuses = {
            "Colossal": -8, "Gargantuan": -4, "Huge": -2, "Large": -1, "Medium": 0, "Small": 1,
            "Tiny": 2, "Diminutive": 4, "Fine": 8
          };
          return sizeBonuses[ $("#sbSize").val() ];
        }, touch: 1, flat: 1
      }
    ],
    formatter: function(row,field){
      var div = $("<div class='col-sm-12'>");
      var comps = $.map(row,function(el){
        var val = updateStatblockValue(el);
        if(val && parseInt(val)) { el.value = parseInt(val); }
        else { el.value = 0; }
        return el;
      });
      var sum = function(pv,cv){ return pv + cv.value; };
      var normal = 10 + comps.reduce(sum, 0);
      var touch = 10 + comps.filter(function(el){ return el.touch; }).reduce(sum,0);
      var flat = 10 + comps.filter(function(el){ return el.flat; }).reduce(sum,0);
      div
        .append( "<span class='sbLabel'>AC</span> " )
        .append( $("<span class='sbValue'>").text(
          normal + ", touch " + touch + ", flat-footed " + flat + " (" +
          $.map(comps,function(el){
            if(el.value<0) {
              return el.value + " " + el.name;
            } else if(el.value > 0) {
              return "+" + el.value + " " + el.name;
            }
          }).join(", ") + 
          ")"
        ));
      return div;
    }
  },
  { name: "hit points", type: "row", fields: [
      { name: "hp", label: "hp", display: "Hit Points", type: "string", placeholder: "6" },
      { name: "hd", display: "Hit Dice", type: "string", placeholder: "1d10+1", formatter: function(v){ return "("+v+")"; } }
    ]
  },
  { name: "saves", type: "row", display: "Saves", fields: [
      { name: "Fort", label: "Fort", display: "Fortitude", type: "string", placeholder: "0", formatter: 
        function(v){ if(v>=0) { return "+" + v + "," } else { return v + ","  } }
      },
      { name: "Ref", label: "Ref", display: "Reflex", type: "string", placeholder: "0", formatter:
        function(v){ if(v>=0) { return "+" + v + "," } else { return v + ","  } }
      },
      { name: "Will", label: "Will", type: "string", placeholder: "0", formatter:
        function(v){ if(v>=0) { return "+" + v } else { return v } }
      },
    ]
  },
  { type: "row", delimiter: ";", fields: [
      { name: "dr", label: "DR", display: "Damage Reduction", type: "string", placeholder: "5/cold iron" },
      { name: "immune", label: "Immune", display: "Immunities", type: "multi", options: [ 
          { name: "construct traits", label: "Construct Traits", type: "Ex", description: "Constructs are immune to death effects, disease, mind-affecting effects (charms, compulsions, phantasms, patterns, and morale effects), necromancy effects, paralysis, poison, sleep, stun, and any effect that requires a Fortitude save (unless the effect also works on objects, or is harmless). Constructs are not subject to nonlethal damage, ability damage, ability drain, fatigue, exhaustion, or energy drain. Constructs are not at risk of death from massive damage. Immediately destroyed when reduced to 0 hit points or less. Immunity to bleed, disease, death effects, necromancy effects, paralysis, poison, sleep effects, and stunning." },
          { name: "fire", label: "Fire", type: "Ex or Su", description: "A creature with immunities takes no damage from listed sources. Immunities can also apply to afflictions, conditions, spells (based on school, level, or save type), and other effects. A creature that is immune does not suffer from these effects, or any secondary effects that are triggered due to an immune effect." },
          { name: "mind-affecting", label: "Mind-Affecting", type: "Ex or Su", description: "A creature with immunities takes no damage from listed sources. Immunities can also apply to afflictions, conditions, spells (based on school, level, or save type), and other effects. A creature that is immune does not suffer from these effects, or any secondary effects that are triggered due to an immune effect." },
          { name: "paralysis", label: "Paralysis", type: "Ex or Su", description: "A creature with immunities takes no damage from listed sources. Immunities can also apply to afflictions, conditions, spells (based on school, level, or save type), and other effects. A creature that is immune does not suffer from these effects, or any secondary effects that are triggered due to an immune effect." },
          { name: "poison", label: "Poison", type: "Ex or Su", description: "A creature with immunities takes no damage from listed sources. Immunities can also apply to afflictions, conditions, spells (based on school, level, or save type), and other effects. A creature that is immune does not suffer from these effects, or any secondary effects that are triggered due to an immune effect." }
        ]
      },
      { name: "resist", label: "Resist", type: "string", placeholder: "acid 10, cold 10" },
      { name: "spellResistance", display: "Spell Resistance", label: "SR", type: "string", placeholder: "20" },
      { name: "Weaknesses", label: "Weaknesses", type: "multi", options: [ "magic dependent" ] }
    ]
  },
  { name: "Offense", style: "separator" },
  { name: "movement", type: "row", display: "Movement Speeds", style: "optList", fields: [
      { name: "speed",    display: "Base Speed", type: "string", placeholder: "30 ft.", label: "Speed" },
      { name: "climbspeed", display: "Climb Speed",  type: "string", placeholder: "30ft.", label: "climb" },
      { name: "flyspeed", display: "Fly Speed",  type: "string", placeholder: "80ft. (average)", label: "fly" },
      { name: "swimspeed", display: "Swim Speed",  type: "string", placeholder: "30ft.", label: "swim" }
    ],
    formatter: function(row,field,rowvalue) {
      
    }
  },
  { name: "melee", display: "Melee", type: "string", label: "Melee" },
  { name: "SLA", display: "Spell-like Abilities", type: "multiPrompt", parameters: [
    { name: "frequency", prompt: "FREQUENCY-- name (comment, DC dc)" },
    { name: "name",      prompt: "frequency-- NAME (comment, DC dc)" },
    { name: "comment",   prompt: "frequency-- name (COMMENT, DC dc)" },
    { name: "dc",        prompt: "frequency-- name (comment, DC DC)" },
    { name: "description", prompt: "Stat description (included at end of statblock)", key: "name" },
  ], group: "frequency" },
  { type: "row", delimiter: ";", fields: [
      { name: "space", display: "Space", label: "Space", type: "string", placeholder: "5 ft." },
      { name: "reach", display: "Reach", label: "Reach", type: "string", placeholder: "5 ft." }
    ]
  },
  { name: "Statistics", style: "separator" },
  { display: "Statistics", type: "row", delimiter: ",", fields: [
      { name: "strength",     display: "Strength",     label: "Str", type: "string", placeholder: "10" },
      { name: "dexterity",    display: "Dexterity",    label: "Dex", type: "string", placeholder: "10" },
      { name: "constitution", display: "Constitution", label: "Con", type: "string", placeholder: "10" },
      { name: "intelligence", display: "Intelligence", label: "Int", type: "string", placeholder: "10" },
      { name: "wisdom",       display: "Wisdom",       label: "Wis", type: "string", placeholder: "10" },
      { name: "charisma",     display: "Charisma",     label: "Cha", type: "string", placeholder: "10" }
    ]
  },
  { type: "row", delimiter: ";", fields: [
      { name: "baseAtk", display: "Base Attack", label: "Base Atk", type: "string", placeholder: "+0" },
      { name: "CMB", display: "Combat Maneuver Bonus", label: "CMB", type: "string", placeholder: "+0" },
      { name: "CMD", display: "Combat Maneuver Defense", label: "CMD", type: "string", placeholder: "10" }
    ]
  },
  { name: "Feats", type: "multi", label: "Feats", options: "sb_feats" },
  { name: "Skills", type: "string", label: "Skills", display: "Skills" },
  { name: "SQ", type: "multi", label: "SQ", display: "Special Qualities", options: "sb_superquals" },
  { name: "Special Abilities", style: "separator" },
  { name: "Poison", type: "string", label: "Poison", display: "Poison" },
  { name: "auras", skip: true, type: "descs", source: "fields", target: "Aura" },
  { name: "immunities", skip: true, type: "descs", source: "fields", target: "immune" },
  { name: "feats",      skip: true, type: "descs", target: "Feats" },
  { name: "superquals", skip: true, type: "descs", target: "SQ" }
];
