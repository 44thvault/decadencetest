import { useState, useEffect, useRef, useCallback } from "react";
import INTERPRETATIONS from "./interpretations.js";

// ═══ HAPTIC FEEDBACK UTILITY ═══
const haptic = (ms=15) => { try { navigator.vibrate && navigator.vibrate(ms); } catch(e){} };
const hapticHeavy = () => { try { navigator.vibrate && navigator.vibrate([30,50,80]); } catch(e){} };

// ═══ LOCAL STORAGE PERSISTENCE ═══
const loadData = (key, def) => { try { const v = localStorage.getItem("decadence_"+key); return v ? JSON.parse(v) : def; } catch(e) { return def; } };
const saveData = (key, val) => { try { localStorage.setItem("decadence_"+key, JSON.stringify(val)); } catch(e){} };

// ═══ DEMON DATABASE (Mesh 00–44) ═══
const DEMONS = {
  0: { name:"Lurgo", aliases:"Legba", title:"Terminal Initiator", mesh:"00", netSpan:"1::0", type:"Amphidemon", syzygy:null, zone:"1→0", domain:"Openings", pitch:"Ana-1", phase:1, phaseLimit:true, door:"The Pod", planet:"Mercury", spine:"Dorsal", clicks:["Gt-00"], ciphers:["Gt-01", "Gt-10"], haunts:[], prowls:null, feeds:null, shadows:null, decaCard:"7C", clusterType:7, decademon:null, rites:[{"rt": 1, "seq": "1890", "desc": "Spinal-voyage (fate line), programming"}] },
  1: { name:"Duoddod", aliases:null, title:"Duplicitous Redoubler", mesh:"01", netSpan:"2::0", type:"Amphidemon", syzygy:null, zone:"2→0", domain:"Abstract Addiction", pitch:"Ana-2", phase:2, phaseLimit:false, door:"The Crypt", planet:"Venus", spine:"Cervical", clicks:["Gt-01"], ciphers:[], haunts:[], prowls:null, feeds:null, shadows:null, decaCard:"8C", clusterType:8, decademon:null, rites:[{"rt": 1, "seq": "271890", "desc": "Pineal-regression (rear vision)"}, {"rt": 2, "seq": "27541890", "desc": "Datacomb searches, digital exactitude"}] },
  2: { name:"Doogu", aliases:"The Blob", title:"Original-Schism", mesh:"02", netSpan:"2::1", type:"Cyclic Chronodemon", syzygy:null, zone:"2→1", domain:"Splitting-Waters", pitch:"Ana-3", phase:2, phaseLimit:true, door:null, planet:null, spine:null, clicks:[], ciphers:["Gt-21"], haunts:[], prowls:null, feeds:null, shadows:"Surge-Current", decaCard:"1H", clusterType:1, decademon:null, rites:[{"rt": 1, "seq": "1872", "desc": "Primordial breath (pneumatic practices)"}, {"rt": 2, "seq": "271", "desc": "Ambivalent capture, hooks"}, {"rt": 3, "seq": "27541", "desc": "Slow pull to stasis, protection from drowning"}] },
  3: { name:"Ixix", aliases:"Yix", title:"Abductor", mesh:"03", netSpan:"3::0", type:"Chaotic Xenodemon", syzygy:null, zone:"3→0", domain:"Cosmic Indifference", pitch:"Ana-3", phase:3, phaseLimit:false, door:"The Swirl", planet:"Earth", spine:"Cranial", clicks:["Gt-03"], ciphers:["Gt-03"], haunts:[], prowls:null, feeds:null, shadows:null, decaCard:null, clusterType:null, decademon:null, rites:[{"rt": 0, "seq": "?", "desc": "Occult terrestrial history"}] },
  4: { name:"Ixigool", aliases:"Djinn of the Magi", title:"Over-Ghoul", mesh:"04", netSpan:"3::1", type:"Amphidemon", syzygy:null, zone:"3→1", domain:"Tridentity", pitch:"Ana-4", phase:3, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:null, feeds:null, shadows:null, decaCard:"4H", clusterType:4, decademon:null, rites:[{"rt": 1, "seq": "18723", "desc": "Unimpeded ascent (prophecy)"}, {"rt": 2, "seq": "1872563", "desc": "Ultimate implications (as above so below)"}] },
  5: { name:"Ixidod", aliases:"King Sid", title:"The Zombie-Maker", mesh:"05", netSpan:"3::2", type:"Amphidemon", syzygy:null, zone:"3→2", domain:"Escape-velocity", pitch:"Ana-5", phase:3, phaseLimit:true, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:["Gt-03"], prowls:null, feeds:null, shadows:null, decaCard:"5H", clusterType:5, decademon:null, rites:[{"rt": 1, "seq": "23", "desc": "Crises through excess (micropause abuse)"}, {"rt": 2, "seq": "27563", "desc": "Illusion of progress"}] },
  6: { name:"Krako", aliases:"Kru", title:"The Croaking Curse", mesh:"06", netSpan:"4::0", type:"Amphidemon", syzygy:null, zone:"4→0", domain:"Burning-Hail", pitch:"Ana-4", phase:4, phaseLimit:false, door:"Delta", planet:"Mars", spine:"Cervical", clicks:[], ciphers:[], haunts:[], prowls:null, feeds:null, shadows:null, decaCard:"9C", clusterType:9, decademon:null, rites:[{"rt": 1, "seq": "41890", "desc": "Subsidence, heaviness of fatality"}] },
  7: { name:"Sukugool", aliases:"Old Skug", title:"The Sucking-Ghoul", mesh:"07", netSpan:"4::1", type:"Cyclic Chronodemon", syzygy:null, zone:"4→1", domain:"Deluge and Implosion", pitch:"Ana-5", phase:4, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:["Gt-10"], prowls:"Sink-Current", feeds:null, shadows:null, decaCard:"3C", clusterType:3, decademon:null, rites:[{"rt": 1, "seq": "187254", "desc": "Cycle of creation and destruction"}, {"rt": 2, "seq": "41", "desc": "Submersion (gravedigging)"}] },
  8: { name:"Skoodu", aliases:"Li'l Scud", title:"The Fashioner", mesh:"08", netSpan:"4::2", type:"Cyclic Chronodemon", syzygy:null, zone:"4→2", domain:"Switch-Crazes", pitch:"Ana-6", phase:4, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:null, feeds:null, shadows:"Hold-Current", decaCard:"2H", clusterType:2, decademon:null, rites:[{"rt": 1, "seq": "2754", "desc": "Historical time (eschatology)"}, {"rt": 2, "seq": "41872", "desc": "Passage through the deep"}, {"rt": 3, "seq": "451872", "desc": "Cyclic reconstitution and stability"}] },
  9: { name:"Skarkix", aliases:"Sharky", title:"Buzz-Cutter", mesh:"09", netSpan:"4::3", type:"Amphidemon", syzygy:null, zone:"4→3", domain:"Anti-evolution", pitch:"Ana-7", phase:4, phaseLimit:true, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:null, feeds:null, shadows:null, decaCard:"6C", clusterType:6, decademon:null, rites:[{"rt": 1, "seq": "418723", "desc": "Hermetic abbreviations (history of the magicians)"}, {"rt": 2, "seq": "4518723", "desc": "Sacred seal of time (triadic reconfirmation)"}, {"rt": 3, "seq": "4563", "desc": "Apocalyptic rapture (jagged turbulence)"}] },
  10: { name:"Tokhatto", aliases:"Old Toker", title:"Decimal Camouflage", mesh:"10", netSpan:"5::0", type:"Amphidemon", syzygy:null, zone:"5→0", domain:"Talismania", pitch:"Cth-4", phase:5, phaseLimit:false, door:"Hyperborea", planet:"Jupiter", spine:"Cervical", clicks:[], ciphers:[], haunts:[], prowls:null, feeds:null, shadows:null, decaCard:"9S", clusterType:9, decademon:null, rites:[{"rt": 1, "seq": "541890", "desc": "Number as destiny (digital convergence)"}] },
  11: { name:"Tukkamu", aliases:null, title:"Occulturation", mesh:"11", netSpan:"5::1", type:"Cyclic Chronodemon", syzygy:null, zone:"5→1", domain:"Pathogenesis", pitch:"Cth-3", phase:5, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:"Sink-Current", feeds:null, shadows:null, decaCard:"3S", clusterType:3, decademon:null, rites:[{"rt": 1, "seq": "18725", "desc": "Optimal maturation (medicine as diffuse healing)"}, {"rt": 2, "seq": "541", "desc": "Rapid deterioration (putrefaction, catabolism)"}] },
  12: { name:"Kuttadid", aliases:"Kitty", title:"Ticking Machines", mesh:"12", netSpan:"5::2", type:"Cyclic Chronodemon", syzygy:null, zone:"5→2", domain:"Precarious States", pitch:"Cth-2", phase:5, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:"Hold-Current", feeds:null, shadows:null, decaCard:"2D", clusterType:2, decademon:null, rites:[{"rt": 1, "seq": "275", "desc": "Maintaining balance (calendric conservatism)"}, {"rt": 2, "seq": "541872", "desc": "Exhaustive vigilance"}] },
  13: { name:"Tikkitix", aliases:"Tickler", title:"Clicking Menaces", mesh:"13", netSpan:"5::3", type:"Amphidemon", syzygy:null, zone:"5→3", domain:"Vortical Delirium", pitch:"Cth-1", phase:5, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:null, feeds:null, shadows:null, decaCard:"6S", clusterType:6, decademon:null, rites:[{"rt": 1, "seq": "5418723", "desc": "Swirl-patterns (tornadoes, wind-voices)"}, {"rt": 2, "seq": "563", "desc": "Mysterious disappearances (things carried-away)"}] },
  14: { name:"Katak", aliases:null, title:"Desolator", mesh:"14", netSpan:"5::4", type:"Syzygetic Chronodemon", syzygy:"5::4", zone:"5↔4", domain:"Cataclysmic Convergence", pitch:"Null", phase:5, phaseLimit:true, door:null, planet:null, spine:null, clicks:[], ciphers:["Gt-45"], haunts:[], prowls:null, feeds:"Sink-Current", shadows:null, decaCard:"Joker", clusterType:0, decademon:null, rites:[{"rt": 0, "seq": "X", "desc": "Tail-chasing, rabid animals"}, {"rt": 1, "seq": "418725", "desc": "Panic (slasher pulp and religious fervour)"}] },
  15: { name:"Tchu", aliases:"Tchanul", title:"Source of Subnothingness", mesh:"15", netSpan:"6::0", type:"Chaotic Xenodemon", syzygy:null, zone:"6→0", domain:"Ultimate Outsideness", pitch:"Cth-3", phase:6, phaseLimit:false, door:"Undu", planet:"Saturn", spine:"Cranial", clicks:[], ciphers:[], haunts:[], prowls:null, feeds:null, shadows:null, decaCard:null, clusterType:null, decademon:null, rites:[{"rt": 0, "seq": "?", "desc": "Cosmic deletions and real impossibilities"}] },
  16: { name:"Djungo", aliases:null, title:"Infiltrator", mesh:"16", netSpan:"6::1", type:"Amphidemon", syzygy:null, zone:"6→1", domain:"Subtle Involvements", pitch:"Cth-2", phase:6, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:null, feeds:null, shadows:null, decaCard:"4D", clusterType:4, decademon:null, rites:[{"rt": 1, "seq": "187236", "desc": "Turbular fluids (maelstroms, chaotic incalculability)"}, {"rt": 2, "seq": "187256", "desc": "Surreptitious invasions, inexplicable contaminations"}] },
  17: { name:"Djuddha", aliases:"Judd Dread", title:"Decentred Threat", mesh:"17", netSpan:"6::2", type:"Amphidemon", syzygy:null, zone:"6→2", domain:"Artificial Turbulence", pitch:"Cth-2", phase:6, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:null, feeds:null, shadows:null, decaCard:"5D", clusterType:5, decademon:null, rites:[{"rt": 1, "seq": "236", "desc": "Machine-vortex (seething skin)"}, {"rt": 2, "seq": "256", "desc": "Storm peripheries (Wendigo legends)"}] },
  18: { name:"Djynxx", aliases:"Ching", title:"Child Stealer", mesh:"18", netSpan:"6::3", type:"Syzygetic Xenodemon", syzygy:"6::3", zone:"6↔3", domain:"Time-Lapse", pitch:"Null", phase:6, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:["Gt-36"], haunts:["Gt-06", "Gt-21"], prowls:"Warp-Current", feeds:"Warp-Current", shadows:null, decaCard:null, clusterType:null, decademon:null, rites:[{"rt": 0, "seq": "X", "desc": "Abstract cyclones, dust spirals (nomad war-machine)"}] },
  19: { name:"Tchakki", aliases:"Chuckles", title:"Bag of Tricks", mesh:"19", netSpan:"6::4", type:"Amphidemon", syzygy:null, zone:"6→4", domain:"Combustion", pitch:"Ana-1", phase:6, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:null, feeds:null, shadows:null, decaCard:"6H", clusterType:6, decademon:1, rites:[{"rt": 1, "seq": "4187236", "desc": "Quenching accidents (apprentice smiths)"}, {"rt": 2, "seq": "45187236", "desc": "Mappings between incompatible time-systems"}, {"rt": 3, "seq": "456", "desc": "Conflagrations (shrieking deliria, spontaneous combustion)"}] },
  20: { name:"Tchattuk", aliases:"One Eyed Jack", title:"Pseudo-Basis", mesh:"20", netSpan:"6::5", type:"Amphidemon", syzygy:null, zone:"6→5", domain:"Unscreened Matrix", pitch:"Cth-7", phase:6, phaseLimit:true, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:["Gt-15"], prowls:null, feeds:null, shadows:null, decaCard:"6D", clusterType:6, decademon:null, rites:[{"rt": 1, "seq": "54187236", "desc": "Zero-gravity"}, {"rt": 2, "seq": "56", "desc": "Cut-outs (UFO cover-ups, Nephilim)"}] },
  21: { name:"Puppo", aliases:"The Pup", title:"Break-Outs", mesh:"21", netSpan:"7::0", type:"Amphidemon", syzygy:null, zone:"7→0", domain:"Larval Regression", pitch:"Cth-2", phase:7, phaseLimit:false, door:"Akasha", planet:"Uranus", spine:"Cervical", clicks:[], ciphers:[], haunts:[], prowls:null, feeds:null, shadows:null, decaCard:"8S", clusterType:8, decademon:null, rites:[{"rt": 1, "seq": "71890", "desc": "Dissolving into slime (masked horrors)"}, {"rt": 2, "seq": "72541890", "desc": "Chthonic swallowings"}] },
  22: { name:"Bubbamu", aliases:"Bubs", title:"After Babylon", mesh:"22", netSpan:"7::1", type:"Cyclic Chronodemon", syzygy:null, zone:"7→1", domain:"Relapse", pitch:"Cth-1", phase:7, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:["Gt-28"], prowls:null, feeds:null, shadows:null, decaCard:"1D", clusterType:1, decademon:null, rites:[{"rt": 1, "seq": "187", "desc": "Hypersea (marine life on land)"}, {"rt": 2, "seq": "71", "desc": "Aquassassins (Black-Atlantis)"}, {"rt": 3, "seq": "72541", "desc": "Seawalls (dry-time, taboo on menstruation)"}] },
  23: { name:"Oddubb", aliases:"Odba", title:"Broken Mirror", mesh:"23", netSpan:"7::2", type:"Syzygetic Chronodemon", syzygy:"7::2", zone:"7↔2", domain:"Swamp-Labyrinths", pitch:"Null", phase:7, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:null, feeds:"Hold-Current", shadows:null, decaCard:null, clusterType:null, decademon:null, rites:[{"rt": 0, "seq": "X", "desc": "Time loops, glamour and glosses"}] },
  24: { name:"Pabbakis", aliases:"Pabzix", title:"Dabbler", mesh:"24", netSpan:"7::3", type:"Amphidemon", syzygy:null, zone:"7→3", domain:"Interference", pitch:"Ana-1", phase:7, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:null, feeds:null, shadows:null, decaCard:"5C", clusterType:5, decademon:2, rites:[{"rt": 1, "seq": "723", "desc": "Batrachian mutations (and frog-plagues)"}, {"rt": 2, "seq": "72563", "desc": "Cans of worms (vermophobic hysteria)"}] },
  25: { name:"Ababbatok", aliases:"Abracadabra", title:"Regenerator", mesh:"25", netSpan:"7::4", type:"Cyclic Chronodemon", syzygy:null, zone:"7→4", domain:"Suspended Decay", pitch:"Ana-2", phase:7, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:null, feeds:null, shadows:"Hold-Current", decaCard:"2C", clusterType:2, decademon:null, rites:[{"rt": 1, "seq": "4187", "desc": "Frankensteinian experimentation (reanimations, golems)"}, {"rt": 2, "seq": "45187", "desc": "Purifications, amphibious cycles"}, {"rt": 3, "seq": "7254", "desc": "Sustenance (smoke visions)"}] },
  26: { name:"Papatakoo", aliases:"Pataku", title:"Upholder", mesh:"26", netSpan:"7::5", type:"Cyclic Chronodemon", syzygy:null, zone:"7→5", domain:"Calendric Time", pitch:"Cth-6", phase:7, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:"Hold-Current", feeds:null, shadows:null, decaCard:"2S", clusterType:2, decademon:null, rites:[{"rt": 1, "seq": "54187", "desc": "Ultimate success (perseverance, blood sacrifice)"}, {"rt": 2, "seq": "725", "desc": "Rituals becoming nature"}] },
  27: { name:"Bobobja", aliases:"Bubbles", title:"Heavy Atmosphere", mesh:"27", netSpan:"7::6", type:"Amphidemon", syzygy:null, zone:"7→6", domain:"Teeming Pestilence", pitch:"Cth-5", phase:7, phaseLimit:true, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:null, feeds:null, shadows:null, decaCard:"5S", clusterType:5, decademon:null, rites:[{"rt": 1, "seq": "7236", "desc": "Strange lights in the swamp (dragonflies, ET frog-cults)"}, {"rt": 2, "seq": "7256", "desc": "Swarmachines (lost harvests)"}] },
  28: { name:"Minommo", aliases:null, title:"Webmaker", mesh:"28", netSpan:"8::0", type:"Amphidemon", syzygy:null, zone:"8→0", domain:"Submergence", pitch:"Cth-1", phase:8, phaseLimit:false, door:"Limbo", planet:"Neptune", spine:"Lumbar", clicks:[], ciphers:[], haunts:[], prowls:null, feeds:null, shadows:null, decaCard:"7S", clusterType:7, decademon:null, rites:[{"rt": 1, "seq": "890", "desc": "Shamanic voyage (dream sorcery and mitochondrial chatter)"}] },
  29: { name:"Murrumur", aliases:"Mu(mu)", title:"Dream-Serpent", mesh:"29", netSpan:"8::1", type:"Syzygetic Chronodemon", syzygy:"8::1", zone:"8↔1", domain:"The Deep Ones", pitch:"Null", phase:8, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:null, feeds:"Surge-Current", shadows:null, decaCard:null, clusterType:null, decademon:null, rites:[{"rt": 0, "seq": "X", "desc": "Oceanic sensation (gilled-unlife and spinal-regressions)"}] },
  30: { name:"Nammamad", aliases:null, title:"Mirroracle", mesh:"30", netSpan:"8::2", type:"Cyclic Chronodemon", syzygy:null, zone:"8→2", domain:"Subterranean Commerce", pitch:"Ana-1", phase:8, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:["Gt-28"], haunts:[], prowls:null, feeds:null, shadows:"Surge-Current", decaCard:"1C", clusterType:1, decademon:3, rites:[{"rt": 1, "seq": "2718", "desc": "Voodoo in cyberspace (cthulhoid traffic)"}, {"rt": 2, "seq": "275418", "desc": "Completion as final collapse (heat-death)"}, {"rt": 3, "seq": "8172", "desc": "Emergences (things washed-up on beaches)"}] },
  31: { name:"Mummumix", aliases:"Mix-Up", title:"The Mist-Crawler", mesh:"31", netSpan:"8::3", type:"Amphidemon", syzygy:null, zone:"8→3", domain:"Insidious Fog", pitch:"Ana-2", phase:8, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:null, feeds:null, shadows:null, decaCard:"4C", clusterType:4, decademon:null, rites:[{"rt": 1, "seq": "81723", "desc": "Ocean storms (xenocommunication on the bacterial plane)"}, {"rt": 2, "seq": "8172563", "desc": "Diseases from outer-space (oankali medicine)"}] },
  32: { name:"Numko", aliases:"Old Nuk", title:"Keeper of Old Terrors", mesh:"32", netSpan:"8::4", type:"Cyclic Chronodemon", syzygy:null, zone:"8→4", domain:"Autochthony", pitch:"Ana-3", phase:8, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:"Sink-Current", feeds:null, shadows:null, decaCard:"3H", clusterType:3, decademon:null, rites:[{"rt": 1, "seq": "418", "desc": "Necrospeleology (abysmal patience rewarded)"}, {"rt": 2, "seq": "4518", "desc": "Subduction (and carnivorous fish)"}, {"rt": 3, "seq": "817254", "desc": "Vulcanism (and bacterial intelligence)"}] },
  33: { name:"Muntuk", aliases:"Manta", title:"Desert Swimmer", mesh:"33", netSpan:"8::5", type:"Cyclic Chronodemon", syzygy:null, zone:"8→5", domain:"Arid Seabeds", pitch:"Cth-5", phase:8, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:null, feeds:null, shadows:"Sink-Current", decaCard:"3D", clusterType:3, decademon:null, rites:[{"rt": 1, "seq": "5418", "desc": "Ancient rivers"}, {"rt": 2, "seq": "81725", "desc": "Cloud-vaults and oppressive tension"}] },
  34: { name:"Mommoljo", aliases:"Mama Jo", title:"Alien Mother", mesh:"34", netSpan:"8::6", type:"Amphidemon", syzygy:null, zone:"8→6", domain:"Xenogenesis", pitch:"Cth-4", phase:8, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:null, feeds:null, shadows:null, decaCard:"4S", clusterType:4, decademon:null, rites:[{"rt": 1, "seq": "817236", "desc": "Cosmobacterial exogermination"}, {"rt": 2, "seq": "817256", "desc": "Extraterrestrial residues (alien DNA segments)"}] },
  35: { name:"Mombbo", aliases:null, title:"Tentacle Face", mesh:"35", netSpan:"8::7", type:"Cyclic Chronodemon", syzygy:null, zone:"8→7", domain:"Hybridity", pitch:"Cth-3", phase:8, phaseLimit:true, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:"Surge-Current", feeds:null, shadows:null, decaCard:"1S", clusterType:1, decademon:null, rites:[{"rt": 1, "seq": "718", "desc": "Ophidian transmutation (palaeopythons)"}, {"rt": 2, "seq": "725418", "desc": "Surreptitious colonization"}, {"rt": 3, "seq": "817", "desc": "Surface-amnesia (old fishwives tales)"}] },
  36: { name:"Uttunul", aliases:null, title:"Seething Void", mesh:"36", netSpan:"9::0", type:"Syzygetic Xenodemon", syzygy:"9::0", zone:"9↔0", domain:"Atonality", pitch:"Null", phase:9, phaseLimit:false, door:"Cthelll", planet:"Pluto", spine:"Sacrum", clicks:["Gt-36"], ciphers:[], haunts:["Gt-45"], prowls:"Plex-Current", feeds:"Plex-Current", shadows:null, decaCard:null, clusterType:null, decademon:null, rites:[{"rt": 0, "seq": "X", "desc": "Crossing the iron-ocean (plutonics)"}] },
  37: { name:"Tutagool", aliases:"Yettuk", title:"The Tattered Ghoul", mesh:"37", netSpan:"9::1", type:"Amphidemon", syzygy:null, zone:"9→1", domain:"Punctuality", pitch:"Ana-1", phase:9, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:null, feeds:null, shadows:null, decaCard:"7H", clusterType:7, decademon:4, rites:[{"rt": 1, "seq": "189", "desc": "The dark arts, rusting iron, tattooing"}] },
  38: { name:"Unnunddo", aliases:"The False Nun", title:"Double-Undoing", mesh:"38", netSpan:"9::2", type:"Amphidemon", syzygy:null, zone:"9→2", domain:"Endless Uncasing", pitch:"Ana-2", phase:9, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:null, feeds:null, shadows:null, decaCard:"8H", clusterType:8, decademon:null, rites:[{"rt": 1, "seq": "27189", "desc": "Crypt-traffic (centipede simulations)"}, {"rt": 2, "seq": "2754189", "desc": "Communication-grids (telecom webs, shamanic metallism)"}] },
  39: { name:"Ununuttix", aliases:"Tick-Tock", title:"Particle Clocks", mesh:"39", netSpan:"9::3", type:"Chaotic Xenodemon", syzygy:null, zone:"9→3", domain:"Absolute Coincidence", pitch:"Ana-3", phase:9, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:null, feeds:null, shadows:null, decaCard:null, clusterType:null, decademon:null, rites:[{"rt": 0, "seq": "?", "desc": "Numerical connection through absence of any link"}] },
  40: { name:"Ununak", aliases:"Nuke", title:"Blind Catastrophe", mesh:"40", netSpan:"9::4", type:"Amphidemon", syzygy:null, zone:"9→4", domain:"Convulsions", pitch:"Ana-4", phase:9, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:null, feeds:null, shadows:null, decaCard:"9H", clusterType:9, decademon:null, rites:[{"rt": 1, "seq": "4189", "desc": "Secrets of the blacksmiths"}, {"rt": 2, "seq": "45189", "desc": "Subterranean impulses"}] },
  41: { name:"Tukutu", aliases:"Killer-Kate", title:"Cosmotraumatics", mesh:"41", netSpan:"9::5", type:"Amphidemon", syzygy:null, zone:"9→5", domain:"Death-Strokes", pitch:"Cth-4", phase:9, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:null, feeds:null, shadows:null, decaCard:"9D", clusterType:9, decademon:null, rites:[{"rt": 1, "seq": "54189", "desc": "Crash-signals (barkerian scarring)"}] },
  42: { name:"Unnutchi", aliases:"T'ai Chi", title:"Tachyonic Immobility", mesh:"42", netSpan:"9::6", type:"Chaotic Xenodemon", syzygy:null, zone:"9→6", domain:"Coiling Outsideness", pitch:"Cth-3", phase:9, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:null, feeds:null, shadows:null, decaCard:null, clusterType:null, decademon:null, rites:[{"rt": 0, "seq": "?", "desc": "Asymmetric zygopoise (cybernetic anomalies)"}] },
  43: { name:"Nuttubab", aliases:"Nut-Cracker", title:"Mimetic Anorganism", mesh:"43", netSpan:"9::7", type:"Amphidemon", syzygy:null, zone:"9→7", domain:"Metaloid Unlife", pitch:"Cth-2", phase:9, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:null, feeds:null, shadows:null, decaCard:"8D", clusterType:8, decademon:null, rites:[{"rt": 1, "seq": "7189", "desc": "Lunacies (iron in the blood)"}, {"rt": 2, "seq": "7254189", "desc": "Dragon-lines (terrestrial electromagnetism)"}] },
  44: { name:"Ummnu", aliases:"Om", title:"Ultimate Inconsequence", mesh:"44", netSpan:"9::8", type:"Amphidemon", syzygy:null, zone:"9→8", domain:"Earth-Screams", pitch:"Cth-1", phase:9, phaseLimit:true, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:["Gt-36"], prowls:null, feeds:null, shadows:null, decaCard:"7D", clusterType:7, decademon:null, rites:[{"rt": 0, "seq": "89", "desc": "Crust-friction (anorganic tension)"}] },
};




// ═══ CARD COMPONENT ═══
const SS={hearts:"\u2665",diamonds:"\u2666",clubs:"\u2663",spades:"\u2660"};
const SC={hearts:"#ff1744",diamonds:"#ff1744",clubs:"#e0e0e0",spades:"#e0e0e0"};
const Card=({card,faceUp,onClick,selected,matched,w=60,h=106,flash})=>{const dv=card.value===0?"Q":card.value;const sc=SC[card.suit];return(<div onClick={()=>{if(onClick){haptic();onClick();}}} style={{width:w,height:h,perspective:600,cursor:onClick?"pointer":"default",flexShrink:0}}><div style={{width:"100%",height:"100%",position:"relative",transformStyle:"preserve-3d",transition:"transform 0.6s cubic-bezier(0.4,0,0.2,1)",transform:faceUp?"rotateY(180deg)":"rotateY(0)"}}>
{/* BACK — numogram.png */}
<div style={{position:"absolute",width:"100%",height:"100%",backfaceVisibility:"hidden",borderRadius:6,background:"#000",border:"1px solid "+(selected?"#0f3":"#1a3a1a"),display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",boxShadow:selected?"0 0 14px rgba(0,255,51,0.4)":"0 2px 6px rgba(0,0,0,0.6)"}}><img src="/numogram.png" alt="" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:5,opacity:0.85}}/></div>
{/* FACE — #1: flash red on wrong pair */}
<div style={{position:"absolute",width:"100%",height:"100%",backfaceVisibility:"hidden",borderRadius:6,transform:"rotateY(180deg)",background:matched?"linear-gradient(145deg,#0a1a0a,#001a00)":"linear-gradient(145deg,#1a1a2e,#0f0f1a)",border:"2px solid "+(flash?"#ff0044":matched?"#0f3":selected?"#0ff":"#333"),display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",boxShadow:flash?"0 0 20px rgba(255,0,68,0.6)":matched?"0 0 14px rgba(0,255,51,0.3)":selected?"0 0 10px rgba(0,255,255,0.3)":"0 2px 6px rgba(0,0,0,0.6)",opacity:matched?0.4:1,transition:"border-color 0.15s, box-shadow 0.15s, opacity 0.3s"}}><div style={{position:"absolute",top:3,left:5,color:sc,fontSize:10,fontFamily:"monospace",lineHeight:1}}><div>{dv}</div><div style={{fontSize:9}}>{SS[card.suit]}</div></div><div style={{color:sc,fontSize:Math.max(18,w*0.3),fontWeight:"bold",fontFamily:"'Courier New',monospace",textShadow:"0 0 8px "+sc+"40"}}>{SS[card.suit]}</div><div style={{color:sc,fontSize:Math.max(14,w*0.23),fontWeight:"bold",fontFamily:"monospace"}}>{dv}</div><div style={{position:"absolute",bottom:3,right:5,color:sc,fontSize:10,fontFamily:"monospace",lineHeight:1,transform:"rotate(180deg)"}}><div>{dv}</div><div style={{fontSize:9}}>{SS[card.suit]}</div></div><div style={{position:"absolute",inset:0,borderRadius:6,pointerEvents:"none",background:"repeating-linear-gradient(0deg,transparent,transparent 1px,rgba(0,0,0,0.07) 1px,rgba(0,0,0,0.07) 2px)"}}/></div>
</div></div>);};

// ═══ DEMON ORACLE OVERLAY ═══
const DemonOracle=({result,onClose,onShare,mode,aeonTotal})=>{const[vis,setVis]=useState(false);useEffect(()=>{hapticHeavy();setTimeout(()=>setVis(true),100);},[]);if(!result)return null;const ang=result.type==="angelic";const d=result.demon;const isSub=mode==="subdecadence";const ac=ang?"#ffd700":"#ff0044";const lbl=isSub?"#f0f":"#0f3";const Sec=({label,children})=>(<div style={{borderTop:"1px solid "+ac+"18",paddingTop:12,marginBottom:12}}><div style={{color:ac,fontSize:12,letterSpacing:3,marginBottom:6}}>{label}</div><div style={{color:"#ddd",fontSize:17,lineHeight:1.85}}>{children}</div></div>);
  // Gate relationship summary
  const gateRels=(dem)=>{const parts=[];if(dem.clicks&&dem.clicks.length)parts.push("Clicks "+dem.clicks.join(", "));if(dem.ciphers&&dem.ciphers.length)parts.push("Ciphers "+dem.ciphers.join(", "));if(dem.haunts&&dem.haunts.length)parts.push("Haunts "+dem.haunts.join(", "));return parts.join(" · ")||null;};
  // Current relationship summary
  const currRels=(dem)=>{const parts=[];if(dem.feeds)parts.push("Feeds "+dem.feeds);if(dem.prowls)parts.push("Prowls "+dem.prowls);if(dem.shadows)parts.push("Shadows "+dem.shadows);return parts.join(" · ")||null;};
  return(<div style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(0,0,0,0.94)",display:"flex",alignItems:"center",justifyContent:"center",opacity:vis?1:0,transition:"opacity 0.8s",backdropFilter:"blur(10px)",padding:12}}><div onClick={e=>e.stopPropagation()} style={{maxWidth:420,width:"100%",maxHeight:"90vh",overflowY:"auto",background:"linear-gradient(180deg,#0a0a0a,#050510)",border:"1px solid "+ac+"30",borderRadius:4,padding:"24px 20px",fontFamily:"'Courier New',monospace",boxShadow:"0 0 50px "+ac+"15",position:"relative",WebkitOverflowScrolling:"touch"}}><div style={{position:"absolute",inset:0,pointerEvents:"none",background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.015) 2px,rgba(255,255,255,0.015) 4px)"}}/>
    {ang?(<>
      <div style={{color:"#ffd700",fontSize:13,letterSpacing:5,marginBottom:8}}>{isSub?"◈ ZYGONOVIST INDEX ◈":"◈ ANGELIC INDEX ◈"}</div>
      <div style={{color:"#ffd700",fontSize:42,fontWeight:"bold",marginBottom:6}}>+{result.score}</div>
      {typeof aeonTotal==="number"&&<div style={{color:"#ffd700aa",fontSize:15,marginBottom:8}}>Aeon Cumulation: {aeonTotal}</div>}
      <div style={{color:"#999",fontSize:14,lineHeight:1.8,marginBottom:10}}>{isSub?"Positive results extend the Aeon under Neolemurian zygonovist reckoning. The nine-sum principle holds.":"Positive results contribute to the Angelic Index of the Decadence game, and are referred to the Decamantic tables of AOE-Angelology."}</div>
      <div style={{color:"#666",fontSize:13,lineHeight:1.7,fontStyle:"italic"}}>{isSub?"Maximum single-game gain under Subdecadence rules is thirty-two.":"The Decamantic tables have never been published. Maximum single-game gain is thirty-eight, but this can be exceeded by cumulations from game to game until completion of an Aeon."}</div>
    </>):(<>
      <div style={{color:ac,fontSize:13,letterSpacing:5,marginBottom:8}}>{isSub?"◈ LEMUR CALL ◈":"◈ DEMON CALL ◈"}</div>
      <div style={{color:ac,fontSize:30,fontWeight:"bold",marginBottom:2,textShadow:"0 0 15px "+ac+"50"}}>{d.name}</div>
      {d.aliases&&<div style={{color:"#777",fontSize:13,marginBottom:4,fontStyle:"italic"}}>{d.aliases}</div>}
      <div style={{color:"#aaa",fontSize:15,marginBottom:4}}>{d.title}</div>
      <div style={{color:"#777",fontSize:13,marginBottom:16}}>Mesh-{d.mesh} · {d.type} · [{d.netSpan}]</div>
      <Sec label="PITCH">{d.pitch}</Sec>
      <Sec label={isSub?"NET-SPAN PASSAGE":"ZONE PASSAGE"}>{d.zone}</Sec>
      {d.syzygy&&<Sec label="SYZYGY">{d.syzygy}</Sec>}
      <Sec label="DOMAIN">{d.domain}</Sec>
      {d.door&&<Sec label="DOOR">{d.door}{d.planet?" · "+d.planet:""}{d.spine?" · "+d.spine:""}</Sec>}
      {!d.door&&d.planet&&<Sec label="PLANETARY AFFINITY">{d.planet}{d.spine?" · "+d.spine:""}</Sec>}
      <Sec label="PHASE">Phase-{d.phase}{d.phaseLimit?" · Phase-Limit":""}{d.decademon?" · Decademon #"+d.decademon:""}</Sec>
      {gateRels(d)&&<Sec label="GATE RELATIONS">{gateRels(d)}</Sec>}
      {currRels(d)&&<Sec label="CURRENTS">{currRels(d)}</Sec>}
      {d.decaCard&&<Sec label={isSub?"SUBDECADOLOGY":"DECADOLOGY"}>C/tp-#{d.clusterType} · [{d.decaCard}]</Sec>}
      {d.rites&&d.rites.length>0&&<Sec label="RITES">{d.rites.map((r,i)=><div key={i} style={{marginBottom:6}}><span style={{color:ac}}>Rt-{r.rt}:[{r.seq}]</span> <span style={{color:"#bbb"}}>{r.desc}</span></div>)}</Sec>}
      {INTERPRETATIONS[result.score]&&<Sec label="◈ FULL INTERPRETATION ◈"><div style={{color:"#ccc",fontSize:16,lineHeight:1.95,fontStyle:"italic"}}>{INTERPRETATIONS[Math.min(result.score,44)]}</div></Sec>}
      <div style={{color:"#666",fontSize:13,marginTop:16,textAlign:"center"}}>Score: -{result.score} · Aeon Terminated</div>
    </>)}
    <div style={{display:"flex",gap:8,marginTop:18}}>
      <button onClick={onClose} style={{flex:1,padding:"14px",background:"transparent",border:"1px solid "+ac+"40",color:ac,fontFamily:"monospace",fontSize:14,letterSpacing:3,cursor:"pointer",borderRadius:2}}>DISMISS</button>
      {!ang&&onShare&&<button onClick={()=>{haptic();onShare();}} style={{flex:1,padding:"14px",background:"transparent",border:"1px solid "+ac+"40",color:ac,fontFamily:"monospace",fontSize:12,letterSpacing:2,cursor:"pointer",borderRadius:2}}>SHARE DEMON CALL</button>}
    </div>
  </div></div>);
};

// ═══ TUTORIAL OVERLAY ═══
// #12: Added visual diagram of Atlantean Cross in step 1
const Tutorial=({onClose,mode})=>{const[step,setStep]=useState(0);const accent=mode==="subdecadence"?"#f0f":"#0f3";const steps=[
  {title:"THE ATLANTEAN CROSS",body:null,custom:true},
  {title:"THE CONCEALED SET",body:"Five more cards are dealt face-down as Set-2. Tap them left-to-right to reveal one at a time."},
  {title:"PAIR TO SUM "+(mode==="subdecadence"?"9":"10"),body:"When a Set-2 card is revealed, tap a Set-1 card to pair them. The pair must sum to "+(mode==="subdecadence"?"9 (Numogram Syzygies)":"10")+". Score = the difference between the two values."},
  {title:"THE ORACLE SPEAKS",body:"After all 5 Set-2 cards are revealed, end the round. Positive score = Angelic Index. Negative score = Demon Call from the Pandemonium Matrix. The Aeon ends."},
  {title:"AEON PERSISTENCE",body:"Your longest Aeon streak and highest scores are tracked. Demons called are logged in your history. Begin."}
];
  const CrossDiagram=()=>(<div style={{marginBottom:12}}>
    <div style={{color:"#ccc",fontSize:15,lineHeight:1.8,marginBottom:12}}>Five cards dealt face-up in a cross formation. These are your Set-1 pylons:</div>
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,marginBottom:12}}>
      <div style={{background:"#111",border:"1px solid "+accent+"40",borderRadius:4,padding:"6px 14px",fontSize:12,color:accent}}>Far Future</div>
      <div style={{display:"flex",gap:4}}>
        <div style={{background:"#111",border:"1px solid "+accent+"40",borderRadius:4,padding:"6px 10px",fontSize:11,color:accent}}>Destructive</div>
        <div style={{background:"#111",border:"1px solid "+accent+"40",borderRadius:4,padding:"6px 10px",fontSize:11,color:accent}}>Creative</div>
        <div style={{background:"#111",border:"1px solid "+accent+"40",borderRadius:4,padding:"6px 10px",fontSize:11,color:accent}}>Memories</div>
      </div>
      <div style={{background:"#111",border:"1px solid "+accent+"40",borderRadius:4,padding:"6px 14px",fontSize:12,color:accent}}>Deep Past</div>
    </div>
  </div>);
  return(<div style={{position:"fixed",inset:0,zIndex:1100,background:"rgba(0,0,0,0.95)",display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(8px)"}}><div style={{maxWidth:380,width:"100%",background:"#0a0a0a",border:"1px solid "+accent+"30",borderRadius:4,padding:"28px 22px",fontFamily:"monospace"}}><div style={{color:accent,fontSize:10,letterSpacing:5,marginBottom:4}}>TUTORIAL · {step+1}/{steps.length}</div><div style={{color:accent,fontSize:18,fontWeight:"bold",marginBottom:12,letterSpacing:2}}>{steps[step].title}</div>{steps[step].custom?<CrossDiagram/>:<div style={{color:"#ccc",fontSize:15,lineHeight:1.85,marginBottom:20}}>{steps[step].body}</div>}<div style={{display:"flex",gap:8}}>{step>0&&<button onClick={()=>{haptic();setStep(s=>s-1);}} style={{flex:1,padding:"10px",background:"transparent",border:"1px solid #333",color:"#666",fontFamily:"monospace",fontSize:12,letterSpacing:2,cursor:"pointer",borderRadius:2}}>BACK</button>}<button onClick={()=>{haptic();if(step<steps.length-1)setStep(s=>s+1);else{saveData("tutorialSeen",true);onClose();}}} style={{flex:1,padding:"10px",background:"transparent",border:"1px solid "+accent,color:accent,fontFamily:"monospace",fontSize:12,letterSpacing:2,cursor:"pointer",borderRadius:2}}>{step<steps.length-1?"NEXT":"BEGIN"}</button></div><div style={{display:"flex",justifyContent:"center",gap:6,marginTop:14}}>{steps.map((_,i)=><div key={i} style={{width:6,height:6,borderRadius:3,background:i===step?accent:"#333"}}/>)}</div></div></div>);
};

// ═══ MAIN GAME ═══
export default function DecadenceGame(){
  const[mode,setMode]=useState("decadence");
  const targetSum=mode==="decadence"?10:9;
  const[deck,setDeck]=useState([]);
  const[set1,setSet1]=useState([]);
  const[set2,setSet2]=useState([]);
  const[revealedIndex,setRevealedIndex]=useState(-1);
  const[selectedSet2,setSelectedSet2]=useState(null);
  const[matchedSet1,setMatchedSet1]=useState(new Set());
  const[matchedSet2,setMatchedSet2]=useState(new Set());
  const[score,setScore]=useState(0);
  const[aeonScore,setAeonScore]=useState(0);
  const[roundResults,setRoundResults]=useState([]);
  const[gamePhase,setGamePhase]=useState("menu");
  const[oracleResult,setOracleResult]=useState(null);
  const[message,setMessage]=useState("");
  const[roundNum,setRoundNum]=useState(0);
  const[glitchText,setGlitchText]=useState(false);
  const[showTutorial,setShowTutorial]=useState(false);
  const[showHistory,setShowHistory]=useState(false);
  // #1: flash state for wrong pair
  const[flashCard,setFlashCard]=useState(null);
  // #10: Pandemonium browser
  const[showBrowser,setShowBrowser]=useState(false);
  const[browserDemon,setBrowserDemon]=useState(null);
  // #11: About section
  const[showAbout,setShowAbout]=useState(false);
  // Rules collapsible
  const[showRules,setShowRules]=useState(false);
  // Audio player
  const[audioPlaying,setAudioPlaying]=useState(false);
  const[audioTrack,setAudioTrack]=useState(0);
  const audioRef=useRef(null);
  
  const glitchOffset=useRef({x:0,y:0});
  const canvasRef=useRef(null);
  const animRef=useRef(null);

  // Persistence
  const[bestAeon,setBestAeon]=useState(()=>loadData("bestAeon",0));
  const[bestRounds,setBestRounds]=useState(()=>loadData("bestRounds",0));
  const[totalGames,setTotalGames]=useState(()=>loadData("totalGames",0));
  const[demonLog,setDemonLog]=useState(()=>loadData("demonLog",[]));

  const isSub=mode==="subdecadence";
  const accent=isSub?"#f0f":"#0f3";
  const accentRgb=isSub?"255,0,255":"0,255,51";

  // Ambient particles
  useEffect(()=>{
    const c=canvasRef.current;if(!c)return;const ctx=c.getContext("2d");let ps=[];
    const resize=()=>{c.width=window.innerWidth;c.height=window.innerHeight;};
    resize();window.addEventListener("resize",resize);
    for(let i=0;i<35;i++)ps.push({x:Math.random()*c.width,y:Math.random()*c.height,vx:(Math.random()-0.5)*0.2,vy:(Math.random()-0.5)*0.2,s:Math.random()*1.5+0.5,o:Math.random()*0.35+0.1,p:Math.random()*6.28});
    const anim=()=>{ctx.clearRect(0,0,c.width,c.height);
      for(let i=0;i<ps.length;i++)for(let j=i+1;j<ps.length;j++){const dx=ps[i].x-ps[j].x,dy=ps[i].y-ps[j].y,d=Math.sqrt(dx*dx+dy*dy);if(d<110){ctx.beginPath();ctx.moveTo(ps[i].x,ps[i].y);ctx.lineTo(ps[j].x,ps[j].y);ctx.strokeStyle="rgba("+accentRgb+","+(0.035*(1-d/110))+")";ctx.lineWidth=0.5;ctx.stroke();}}
      ps.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.p+=0.02;if(p.x<0)p.x=c.width;if(p.x>c.width)p.x=0;if(p.y<0)p.y=c.height;if(p.y>c.height)p.y=0;const g=Math.sin(p.p)*0.3+0.7;ctx.beginPath();ctx.arc(p.x,p.y,p.s*g,0,6.28);ctx.fillStyle="rgba("+accentRgb+","+(p.o*g)+")";ctx.fill();});
      animRef.current=requestAnimationFrame(anim);};
    anim();return()=>{window.removeEventListener("resize",resize);if(animRef.current)cancelAnimationFrame(animRef.current);};
  },[accentRgb]);

  useEffect(()=>{const iv=setInterval(()=>{glitchOffset.current={x:(Math.random()*3-1.5),y:(Math.random()*2-1)};setGlitchText(true);setTimeout(()=>setGlitchText(false),100);},5000+Math.random()*8000);return()=>clearInterval(iv);},[]);

  useEffect(()=>{if(!loadData("tutorialSeen",false))setShowTutorial(true);},[]);

  // Audio player
  const TRACKS=[
    {file:"/audio/track-01.mp3",title:"I"},
    {file:"/audio/track-02.mp3",title:"II"},
    {file:"/audio/track-03.mp3",title:"III"},
    {file:"/audio/track-04.mp3",title:"IV"},
    {file:"/audio/track-05.mp3",title:"V"},
  ];
  const toggleAudio=()=>{
    const a=audioRef.current;if(!a)return;
    if(audioPlaying){a.pause();setAudioPlaying(false);}
    else{a.src=TRACKS[audioTrack].file;a.play().catch(()=>{});setAudioPlaying(true);}
  };
  const nextTrack=()=>{
    const next=(audioTrack+1)%TRACKS.length;setAudioTrack(next);
    const a=audioRef.current;if(a&&audioPlaying){a.src=TRACKS[next].file;a.play().catch(()=>{});}
  };
  const prevTrack=()=>{
    const prev=(audioTrack-1+TRACKS.length)%TRACKS.length;setAudioTrack(prev);
    const a=audioRef.current;if(a&&audioPlaying){a.src=TRACKS[prev].file;a.play().catch(()=>{});}
  };

  const createDeck=useCallback(()=>{
    const suits=["hearts","diamonds","clubs","spades"],cards=[];
    for(const s of suits){if(mode==="subdecadence")cards.push({value:0,suit:s,id:"Q-"+s});for(let v=1;v<=9;v++)cards.push({value:v,suit:s,id:v+"-"+s});}
    for(let i=cards.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[cards[i],cards[j]]=[cards[j],cards[i]];}return cards;
  },[mode]);

  const startAeon=()=>{haptic();setAeonScore(0);setRoundNum(0);const d=createDeck();const s1=d.splice(0,5),s2=d.splice(0,5);setDeck(d);setSet1(s1);setSet2(s2);setRevealedIndex(-1);setSelectedSet2(null);setMatchedSet1(new Set());setMatchedSet2(new Set());setScore(0);setRoundResults([]);setGamePhase("playing");setMessage("TAP A SET-2 CARD TO REVEAL");setRoundNum(1);setTotalGames(g=>{const n=g+1;saveData("totalGames",n);return n;});};

  const dealRound=useCallback(()=>{haptic();let d=deck.length>=10?[...deck]:createDeck();const s1=d.splice(0,5),s2=d.splice(0,5);setDeck(d);setSet1(s1);setSet2(s2);setRevealedIndex(-1);setSelectedSet2(null);setMatchedSet1(new Set());setMatchedSet2(new Set());setScore(0);setRoundResults([]);setGamePhase("playing");setMessage("TAP A SET-2 CARD TO REVEAL");setRoundNum(r=>r+1);},[deck,createDeck]);

  const revealNext=(i)=>{if(revealedIndex>=i||matchedSet2.has(i))return;haptic();setRevealedIndex(i);setSelectedSet2(i);setGamePhase("pairing");setMessage("SELECT A SET-1 CARD TO PAIR, OR SKIP");};

  // #1: flash wrong card red briefly
  const attemptPair=(si)=>{if(gamePhase!=="pairing"||matchedSet1.has(si)||selectedSet2===null)return;const c1=set1[si],c2=set2[selectedSet2];if(c1.value+c2.value===targetSum){haptic(25);const diff=Math.abs(c1.value-c2.value);setMatchedSet1(p=>new Set([...p,si]));setMatchedSet2(p=>new Set([...p,selectedSet2]));setScore(s=>s+diff);setRoundResults(p=>[...p,{score:diff,cards:[c1,c2]}]);setSelectedSet2(null);setMessage("PAIRED: "+c1.value+"+"+c2.value+"="+targetSum+" +"+diff);setGamePhase("playing");}else{haptic(8);setFlashCard(si);setTimeout(()=>setFlashCard(null),300);setMessage(c1.value+"+"+c2.value+"="+(c1.value+c2.value)+" ≠ "+targetSum);}};

  // #2: skip with confirmation if valid pair exists
  const skipPair=()=>{if(selectedSet2!==null){const rc=set2[selectedSet2];if(set1.some((c,i)=>!matchedSet1.has(i)&&c.value+rc.value===targetSum)){haptic(40);setMessage("VALID PAIR EXISTS — TAP SKIP AGAIN TO CONFIRM");if(message.includes("TAP SKIP AGAIN")){setSelectedSet2(null);setGamePhase("playing");setMessage("SKIPPED DESPITE VALID PAIR");}return;}}haptic();setSelectedSet2(null);setGamePhase("playing");setMessage("NO MATCH — SKIPPED");};

  const endRound=()=>{haptic();let pen=0;set1.forEach((c,i)=>{if(!matchedSet1.has(i))pen+=c.value;});const tot=score-pen;
    if(tot>=0){
      const newAeon=aeonScore+tot;
      setAeonScore(newAeon);
      if(newAeon>bestAeon){setBestAeon(newAeon);saveData("bestAeon",newAeon);}
      if(roundNum>bestRounds){setBestRounds(roundNum);saveData("bestRounds",roundNum);}
      setOracleResult({type:"angelic",score:tot});setGamePhase("roundEnd");
    }else{
      const mesh=Math.min(Math.abs(tot),44);
      const d=DEMONS[mesh];
      const entry={demon:d.name,mesh:d.mesh,score:Math.abs(tot),aeonScore,rounds:roundNum,mode,date:new Date().toISOString()};
      const newLog=[entry,...demonLog].slice(0,50);
      setDemonLog(newLog);saveData("demonLog",newLog);
      if(roundNum>bestRounds){setBestRounds(roundNum);saveData("bestRounds",roundNum);}
      setOracleResult({type:"demonic",score:Math.abs(tot),demon:d});setGamePhase("aeonEnd");
    }
  };

  const shareDemonCall=()=>{
    if(!oracleResult||oracleResult.type==="angelic")return;
    const d=oracleResult.demon;
    const text="DEMON CALL: "+d.name+(d.aliases?" ("+d.aliases+")":"")+" (Mesh-"+d.mesh+")\n"+d.title+"\n"+d.type+" · ["+d.netSpan+"] · "+d.pitch+"\nDomain: "+d.domain+(d.rites&&d.rites[0]?"\nRite: ["+d.rites[0].seq+"] "+d.rites[0].desc:"")+"\n\nhttps://playdecadence.online";
    if(navigator.share){navigator.share({title:"Demon Call: "+d.name,text}).catch(()=>{});}
    else if(navigator.clipboard){navigator.clipboard.writeText(text).then(()=>alert("Copied to clipboard"));}
  };

  const allRevealed=revealedIndex>=4;
  
  const vh = typeof window !== 'undefined' ? window.innerHeight : 700;
  const vw = typeof window !== 'undefined' ? Math.min(window.innerWidth, 400) : 400;
  const fromHeight = Math.floor((vh - 210) / 4);
  const fromWidth = Math.floor((vw - 30) / 5 * 1.77);
  const CH = Math.max(75, Math.min(130, fromHeight, fromWidth));
  const CW = Math.round(CH / 1.77);

  const bgOverlay=isSub?"repeating-linear-gradient(0deg,transparent,transparent 1px,rgba(255,0,255,0.04) 1px,rgba(255,0,255,0.04) 3px)":"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.06) 2px,rgba(0,0,0,0.06) 4px)";
  const vignetteColor=isSub?"rgba(40,0,40,0.6)":"rgba(0,0,0,0.5)";

  // #13: view a demon from the log
  const viewLoggedDemon=(entry)=>{
    const mesh=parseInt(entry.mesh);
    const d=DEMONS[mesh];
    if(d)setOracleResult({type:"demonic",score:entry.score,demon:d});
  };

  return(
    <div style={{minHeight:"100dvh",width:"100%",background:isSub?"#050005":"#000",color:"#ccc",fontFamily:"'Courier New',monospace",position:"relative",overflow:"hidden",WebkitTapHighlightColor:"transparent",transition:"background 0.5s"}}>
      <canvas ref={canvasRef} style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",opacity:isSub?0.6:0.5}}/>
      <div style={{position:"fixed",inset:0,zIndex:1,pointerEvents:"none",background:bgOverlay,transition:"background 0.5s"}}/>
      <div style={{position:"fixed",inset:0,zIndex:1,pointerEvents:"none",background:"radial-gradient(ellipse at center,transparent 50%,"+vignetteColor+" 100%)"}}/>
      {isSub&&<div style={{position:"fixed",inset:0,zIndex:1,pointerEvents:"none",background:"radial-gradient(circle at 50% 30%,rgba(80,0,80,0.08) 0%,transparent 60%)"}}/>}

      <div style={{position:"relative",zIndex:2,maxWidth:400,margin:"0 auto",padding:"6px 8px 10px",minHeight:"100dvh",overflow:gamePhase==="menu"?"auto":"auto"}}>

        <header style={{textAlign:"center",marginBottom:6,paddingTop:4}}>
          <div style={{fontSize:8,letterSpacing:5,color:accent,opacity:0.5,marginBottom:1}}>{isSub?"◈ LEMURIAN NECRONOMICON ◈":"◈ PANDEMONIUM MATRIX ◈"}</div>
          <h1 style={{fontSize:20,fontWeight:"bold",margin:0,letterSpacing:4,color:accent,textShadow:"0 0 20px "+accent+"60,0 0 40px "+accent+"20",transform:glitchText?"translate("+glitchOffset.current.x+"px,"+glitchOffset.current.y+"px)":"none",transition:"color 0.5s"}}>{isSub?"SUBDECADENCE":"DECADENCE"}</h1>
          <div style={{fontSize:9,color:accent+"88",letterSpacing:2,marginTop:2}}>{isSub?"NEOLEMURIAN TIME-SORCERY · SYZYGIES → 9":"ATLANTEAN TIME-SORCERY · PAIRS → 10"}</div>
        </header>

        {/* MODE TOGGLE + CONTROLS */}
        <div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:8,flexWrap:"wrap"}}>
          <button onClick={()=>{haptic();setMode(m=>m==="decadence"?"subdecadence":"decadence");}} style={{padding:"5px 12px",background:"transparent",border:"1px solid "+accent+"40",color:accent,fontFamily:"monospace",fontSize:10,letterSpacing:2,cursor:"pointer",borderRadius:2}}>⇄ {isSub?"DECADENCE":"SUBDECADENCE"}</button>
          {gamePhase==="menu"&&<button onClick={()=>{haptic();setShowTutorial(true);}} style={{padding:"5px 12px",background:"transparent",border:"1px solid #333",color:"#666",fontFamily:"monospace",fontSize:10,letterSpacing:2,cursor:"pointer",borderRadius:2}}>? RULES</button>}
        </div>

        {/* SCORE BAR */}
        {gamePhase!=="menu"&&(<div style={{display:"flex",justifyContent:"space-around",alignItems:"center",padding:"5px 10px",marginBottom:6,background:"rgba(0,0,0,0.5)",border:"1px solid "+(isSub?"#1a001a":"#1a1a1a"),borderRadius:2,fontSize:11,letterSpacing:1}}>
          <span style={{color:"#777"}}>AEON <span style={{color:accent}}>{aeonScore}</span></span>
          <span style={{color:"#777"}}>ROUND <span style={{color:"#0ff"}}>{roundNum}</span></span>
          <span style={{color:"#777"}}>SCORE <span style={{color:score>=0?accent:"#f04"}}>{score}</span></span>
        </div>)}

        {/* ═══ MENU ═══ */}
        {gamePhase==="menu"&&(
          <div style={{textAlign:"center",paddingTop:12}}>
            <div style={{marginBottom:16,display:"flex",justifyContent:"center"}}><img src="/numogram.png" alt="Numogram" style={{height:160,width:"auto",borderRadius:6,opacity:0.85,filter:"drop-shadow(0 0 12px rgba(0,255,51,0.2))"}}/></div>
            <button onClick={startAeon} style={{padding:"12px 36px",background:"transparent",border:"1px solid "+accent,color:accent,fontFamily:"monospace",fontSize:15,letterSpacing:5,cursor:"pointer",borderRadius:2,boxShadow:"0 0 25px "+accent+"20",marginBottom:10,display:"block",margin:"0 auto 10px"}}>BEGIN AEON</button>

            {/* STATS BAR */}
            {(bestAeon>0||totalGames>0)&&(<div style={{display:"flex",justifyContent:"center",gap:16,marginBottom:16,fontSize:11,color:"#666"}}>
              {bestAeon>0&&<span>BEST AEON: <span style={{color:accent}}>{bestAeon}</span></span>}
              {bestRounds>0&&<span>LONGEST: <span style={{color:"#0ff"}}>{bestRounds}</span> RNDs</span>}
              <span>GAMES: <span style={{color:"#999"}}>{totalGames}</span></span>
            </div>)}

            {/* #10: PANDEMONIUM MATRIX BROWSER */}
            <button onClick={()=>{haptic();setShowBrowser(!showBrowser);}} style={{padding:"6px 16px",background:"transparent",border:"1px solid "+accent+"30",color:accent,fontFamily:"monospace",fontSize:10,letterSpacing:3,cursor:"pointer",borderRadius:2,marginBottom:12,display:"block",margin:"0 auto 12px"}}>◈ BROWSE PANDEMONIUM MATRIX ◈</button>
            
            {showBrowser&&(<div style={{maxHeight:340,overflowY:"auto",border:"1px solid "+accent+"20",borderRadius:2,padding:"8px",background:"rgba(0,0,0,0.4)",marginBottom:16,textAlign:"left"}}>
              <div style={{color:accent,fontSize:10,letterSpacing:3,marginBottom:8,textAlign:"center"}}>45 DEMONS · MESH 00–44</div>
              {Object.values(DEMONS).map(d=>(
                <div key={d.mesh} onClick={()=>{haptic();setOracleResult({type:"demonic",score:parseInt(d.mesh),demon:d});}} style={{padding:"6px 8px",borderBottom:"1px solid #1a1a1a",cursor:"pointer"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <span style={{color:d.syzygy?"#ffd700":accent,fontSize:13,fontWeight:d.syzygy?"bold":"normal"}}>{d.name}</span>
                      <span style={{color:"#555",fontSize:11,marginLeft:8}}>M-{d.mesh} [{d.netSpan}]</span>
                    </div>
                    <span style={{color:"#555",fontSize:10}}>{d.pitch}</span>
                  </div>
                  <div style={{color:"#444",fontSize:10,marginTop:1}}>{d.title} · {d.type}{d.phaseLimit?" · Phase-Limit":""}{d.decaCard?" · ["+d.decaCard+"]":""}</div>
                </div>
              ))}
            </div>)}

            {/* #13: DEMON LOG — tap to view */}
            {demonLog.length>0&&(<div style={{marginBottom:16}}>
              <button onClick={()=>setShowHistory(!showHistory)} style={{padding:"5px 14px",background:"transparent",border:"1px solid #222",color:"#555",fontFamily:"monospace",fontSize:10,letterSpacing:2,cursor:"pointer",borderRadius:2,marginBottom:showHistory?8:0}}>{showHistory?"HIDE":"SHOW"} DEMON LOG ({demonLog.length})</button>
              {showHistory&&<div style={{maxHeight:200,overflowY:"auto",border:"1px solid #1a1a1a",borderRadius:2,padding:"6px 8px",background:"rgba(0,0,0,0.3)"}}>
                {demonLog.map((e,i)=><div key={i} onClick={()=>viewLoggedDemon(e)} style={{fontSize:11,color:"#777",marginBottom:4,borderBottom:"1px solid #111",paddingBottom:4,cursor:"pointer"}}>
                  <span style={{color:"#f04"}}>{e.demon}</span> <span style={{color:"#555"}}>Mesh-{e.mesh} · -{e.score} · Rnd {e.rounds} · {e.mode}</span>
                </div>)}
              </div>}
            </div>)}

            {/* RULES — collapsible */}
            <button onClick={()=>{haptic();setShowRules(!showRules);}} style={{padding:"5px 14px",background:"transparent",border:"1px solid #222",color:"#555",fontFamily:"monospace",fontSize:10,letterSpacing:2,cursor:"pointer",borderRadius:2,marginBottom:showRules?8:0,display:"block",margin:"0 auto 12px"}}>{showRules?"HIDE":""} {isSub?"SUBDECADENCE":"DECADENCE"} RULES</button>
            {showRules&&(<div style={{padding:"14px 12px",textAlign:"left",border:"1px solid "+(isSub?"#1a001a":"#1a1a1a"),borderRadius:2,background:isSub?"rgba(20,0,20,0.3)":"rgba(0,0,0,0.3)",marginBottom:16}}>
              <div style={{color:"#ccc",fontSize:15,lineHeight:1.9,fontFamily:"'Courier New',monospace"}}>{isSub?"The ultimate blasphemy. Add four Queens (valued 0) to the Decadence pack, bringing the total to forty cards. Play as Decadence, except making pairs which add to nine — corresponding to Numogram Syzygies. Negative results call lemurs from the Pandemonium Matrix.":"The Adept Orders of Decadence trace their system back to the submergence of Atlantis. Truncate a standard pack, removing royals, tens, and jokers — thirty-six cards remain. Five dealt face-up on the Atlantean Cross (Set-1), five face-down (Set-2). Pairs sum to ten. Each pair scores by its difference. Unpaired Set-1 cards penalize by raw value. An Aeon lasts until the first negative result. Negative scores call demons from the Pandemonium Matrix."}</div>
            </div>)}

            {/* ORIGINS — collapsible */}
            <button onClick={()=>{haptic();setShowAbout(!showAbout);}} style={{padding:"5px 14px",background:"transparent",border:"1px solid #222",color:"#555",fontFamily:"monospace",fontSize:10,letterSpacing:2,cursor:"pointer",borderRadius:2,marginBottom:showAbout?8:0,display:"block",margin:"0 auto 12px"}}>{showAbout?"HIDE ":""}ORIGINS</button>
            {showAbout&&(<div style={{padding:"14px 12px",textAlign:"left",border:"1px solid #1a1a1a",borderRadius:2,background:"rgba(0,0,0,0.3)",marginTop:8,marginBottom:16}}>
              <div style={{color:accent,fontSize:11,letterSpacing:3,marginBottom:8}}>◈ ORIGINS ◈</div>
              <div style={{color:"#ccc",fontSize:14,lineHeight:1.9}}>
                {isSub?"Subdecadence is the vigorously suppressed variant of the Decadence system — known amongst decadologists as 'the ultimate blasphemy.' Where Decadence operates under the Atlantean/AOE hermetic tradition (pairing to ten), Subdecadence pairs to nine, corresponding directly to the Numogram's syzygetic principle of zygonovism (nine-sum twinning). The four Queens (valued zero) correspond to the four Chaotic Xenodemons.":"Decadence is a gambling game and divination system associated with the Western tradition of Pandemonium practice, supposedly originating in Atlantis. The Adept Orders trace it to 10,000 BC. It is linked to Sumero-Babylonian geometry — the division of the circle into 360 (= 36 × 10) degrees. The western uptake of Pandemonium has its own esoteric gnosis called Decadology, assigning Amphidemons and Cyclic Chronodemons to nine cluster types."}
              </div>
              <div style={{color:"#ccc",fontSize:14,lineHeight:1.9,marginTop:10}}>
                The Pandemonium Matrix is the complete system of Lemurian demonism and time-sorcery — Numogram (time-map) and Matrix (listing the names, numbers and attributes of the 45 demons). Five syzygetic demons (Katak, Djynxx, Oddubb, Murrumur, Uttunul) carry the fundamental currents. The system is constructed according to immanent criteria latent in decimal numeracy.
              </div>
              <div style={{color:"#666",fontSize:12,marginTop:12}}>Source: ccru.net/digithype/pandemonium.htm</div>
            </div>)}

            {/* AUDIO PLAYER */}
            <div style={{marginTop:16,padding:"10px 14px",border:"1px solid "+(isSub?"#1a001a":"#1a1a1a"),borderRadius:2,background:isSub?"rgba(20,0,20,0.25)":"rgba(0,0,0,0.25)"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{color:"#444",fontSize:9,letterSpacing:3}}>◈ SIGNAL ◈</div>
                <div style={{color:"#555",fontSize:10,fontFamily:"monospace"}}>{TRACKS[audioTrack].title}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:16,marginTop:8}}>
                <button onClick={()=>{haptic();prevTrack();}} style={{background:"transparent",border:"none",color:accent+"80",fontSize:16,cursor:"pointer",fontFamily:"monospace",padding:"4px 8px"}}>◁</button>
                <button onClick={()=>{haptic();toggleAudio();}} style={{background:"transparent",border:"1px solid "+accent+"40",color:audioPlaying?accent:"#555",fontSize:11,cursor:"pointer",fontFamily:"monospace",padding:"6px 16px",borderRadius:2,letterSpacing:3,minWidth:80}}>{audioPlaying?"SILENCE":"INVOKE"}</button>
                <button onClick={()=>{haptic();nextTrack();}} style={{background:"transparent",border:"none",color:accent+"80",fontSize:16,cursor:"pointer",fontFamily:"monospace",padding:"4px 8px"}}>▷</button>
              </div>
            </div>

          </div>
        )}


        {/* ═══ GAME BOARD ═══ */}
        {(gamePhase==="playing"||gamePhase==="pairing")&&(<>
          <div style={{textAlign:"center",padding:"3px 8px",marginBottom:4,color:message.includes("VALID")||message.includes("≠")?"#ff4444":accent,fontSize:11,letterSpacing:1,minHeight:16,fontWeight:message.includes("VALID")?"bold":"normal"}}>{message}</div>

          <div style={{marginBottom:6}}>
            <div style={{color:"#555",fontSize:9,letterSpacing:3,textAlign:"center",marginBottom:4}}>◈ SET-1 · ATLANTEAN CROSS ◈</div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
              <Card card={set1[0]} faceUp selected={false} matched={matchedSet1.has(0)} onClick={()=>attemptPair(0)} w={CW} h={CH} flash={flashCard===0}/>
              <div style={{display:"inline-flex",gap:5}}>
                <Card card={set1[1]} faceUp selected={false} matched={matchedSet1.has(1)} onClick={()=>attemptPair(1)} w={CW} h={CH} flash={flashCard===1}/>
                <Card card={set1[2]} faceUp selected={false} matched={matchedSet1.has(2)} onClick={()=>attemptPair(2)} w={CW} h={CH} flash={flashCard===2}/>
                <Card card={set1[3]} faceUp selected={false} matched={matchedSet1.has(3)} onClick={()=>attemptPair(3)} w={CW} h={CH} flash={flashCard===3}/>
              </div>
              <Card card={set1[4]} faceUp selected={false} matched={matchedSet1.has(4)} onClick={()=>attemptPair(4)} w={CW} h={CH} flash={flashCard===4}/>
            </div>
          </div>

          <div style={{height:1,background:"linear-gradient(90deg,transparent,"+accent+"25,transparent)",marginBottom:6}}/>

          <div>
            <div style={{color:"#555",fontSize:9,letterSpacing:3,textAlign:"center",marginBottom:4}}>◈ SET-2 · CONCEALED ◈</div>
            <div style={{display:"flex",justifyContent:"center",gap:Math.max(3, Math.min(5, Math.floor((400 - 5*CW)/6)))}}>
              {set2.map((card,i)=><Card key={card.id} card={card} faceUp={i<=revealedIndex} selected={selectedSet2===i} matched={matchedSet2.has(i)} onClick={gamePhase==="playing"&&i===revealedIndex+1&&!matchedSet2.has(i)?()=>revealNext(i):null} w={CW} h={CH}/>)}
            </div>
          </div>

          <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:10}}>
            {gamePhase==="pairing"&&<button onClick={skipPair} style={{padding:"6px 16px",background:"transparent",border:"1px solid #ff444440",color:"#ff4444",fontFamily:"monospace",fontSize:11,letterSpacing:2,cursor:"pointer",borderRadius:2}}>SKIP</button>}
            {allRevealed&&gamePhase!=="pairing"&&<button onClick={endRound} style={{padding:"6px 20px",background:"transparent",border:"1px solid "+accent,color:accent,fontFamily:"monospace",fontSize:11,letterSpacing:3,cursor:"pointer",borderRadius:2,boxShadow:"0 0 15px "+accent+"18"}}>END ROUND</button>}
          </div>

          {/* #6: Pairs log — collapsed by default, show last pair only */}
          {roundResults.length>0&&(<div style={{marginTop:8,padding:"6px 10px",background:"rgba(0,0,0,0.35)",border:"1px solid #1a1a1a",borderRadius:2,fontSize:11}}>
            <div style={{color:"#555",letterSpacing:2,marginBottom:3,fontSize:9}}>PAIRS ({roundResults.length})</div>
            <div style={{color:accent}}>{roundResults[roundResults.length-1].cards[0].value}{SS[roundResults[roundResults.length-1].cards[0].suit]} + {roundResults[roundResults.length-1].cards[1].value}{SS[roundResults[roundResults.length-1].cards[1].suit]} = {targetSum} +{roundResults[roundResults.length-1].score}</div>
            {roundResults.length>1&&<div style={{color:"#444",fontSize:10,marginTop:2}}>Total from pairs: +{roundResults.reduce((s,r)=>s+r.score,0)}</div>}
          </div>)}
        </>)}

        {/* ═══ ROUND END ═══ */}
        {gamePhase==="roundEnd"&&(<div style={{textAlign:"center",paddingTop:36}}>
          <div style={{color:"#ffd700",fontSize:11,letterSpacing:4,marginBottom:6}}>ROUND COMPLETE</div>
          <div style={{color:"#ffd700",fontSize:38,fontWeight:"bold",marginBottom:6}}>+{score}</div>
          <div style={{color:"#999",fontSize:13,marginBottom:24}}>Aeon Total: {aeonScore}</div>
          <button onClick={dealRound} style={{padding:"10px 28px",background:"transparent",border:"1px solid #ffd700",color:"#ffd700",fontFamily:"monospace",fontSize:13,letterSpacing:4,cursor:"pointer",borderRadius:2}}>NEXT ROUND</button>
        </div>)}

        {/* ═══ AEON END ═══ */}
        {gamePhase==="aeonEnd"&&(<div style={{textAlign:"center",paddingTop:36}}>
          <div style={{color:"#f04",fontSize:11,letterSpacing:4,marginBottom:6}}>AEON TERMINATED</div>
          <div style={{color:"#f04",fontSize:32,fontWeight:"bold",marginBottom:6}}>DEMON CALL</div>
          <div style={{color:"#999",fontSize:13,marginBottom:24}}>Final Aeon: {aeonScore} · {roundNum} rounds</div>
          <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
            <button onClick={()=>setOracleResult({type:"demonic",score:Math.abs(score),demon:DEMONS[Math.min(Math.abs(score),44)]||DEMONS[0]})} style={{padding:"10px 20px",background:"transparent",border:"1px solid #f04",color:"#f04",fontFamily:"monospace",fontSize:12,letterSpacing:3,cursor:"pointer",borderRadius:2}}>VIEW ORACLE</button>
            <button onClick={()=>{haptic();setGamePhase("menu");}} style={{padding:"10px 20px",background:"transparent",border:"1px solid #44444440",color:"#777",fontFamily:"monospace",fontSize:12,letterSpacing:3,cursor:"pointer",borderRadius:2}}>NEW AEON</button>
          </div>
        </div>)}

      </div>

      {oracleResult&&<DemonOracle result={oracleResult} onClose={()=>setOracleResult(null)} onShare={shareDemonCall} mode={mode} aeonTotal={aeonScore}/>}
      {showTutorial&&<Tutorial onClose={()=>setShowTutorial(false)} mode={mode}/>}
      <audio ref={audioRef} onEnded={nextTrack} preload="none"/>
    </div>
  );
}
