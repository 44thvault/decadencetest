import { useState, useEffect, useRef, useCallback } from "react";
import INTERPRETATIONS from "./interpretations.js";
import PATHS from "./paths.js";
import ZONES from "./zones.js";

// ═══ QUASIPHONIC PARTICLES ═══
const PHONEMES = {0:"eiaoung",1:"gl",2:"dt",3:"zx",4:"skr",5:"tk",6:"dj",7:"pb",8:"mn",9:"utt"};
const demonPhoneme=(ns)=>{const[a,b]=ns.split("::").map(Number);return PHONEMES[a]+"'"+PHONEMES[b];};

// ═══ HAPTIC FEEDBACK UTILITY ═══
const haptic = (ms=15) => { try { navigator.vibrate && navigator.vibrate(ms); } catch(e){} };
const hapticHeavy = () => { try { navigator.vibrate && navigator.vibrate([30,50,80]); } catch(e){} };

// ═══ LOCAL STORAGE PERSISTENCE ═══
const loadData = (key, def) => { try { const v = localStorage.getItem("decadence_"+key); return v ? JSON.parse(v) : def; } catch(e) { return def; } };
const saveData = (key, val) => { try { localStorage.setItem("decadence_"+key, JSON.stringify(val)); } catch(e){} };

// ═══ DEMON DATABASE (Mesh 00–44) ═══
const DEMONS = {
  0: { name:"Lurgo", aliases:"Legba", title:"Terminal Initiator", mesh:"00", netSpan:"1::0", type:"Amphidemon", syzygy:null, zone:"1→0", domain:"Openings", pitch:"Ana-1", phase:1, phaseLimit:true, door:"The Pod", planet:"Mercury", spine:"Dorsal", clicks:["Gt-00"], ciphers:["Gt-01", "Gt-10"], haunts:[], prowls:null, feeds:null, shadows:null, decaCard:"7C", clusterType:7, decademon:null, rites:[{"rt": 1, "seq": "1890", "desc": "Spinal-voyage (fate line), programming", "path": 1, "pathName": "Original Subtraction"}] },
  1: { name:"Duoddod", aliases:null, title:"Duplicitous Redoubler", mesh:"01", netSpan:"2::0", type:"Amphidemon", syzygy:null, zone:"2→0", domain:"Abstract Addiction", pitch:"Ana-2", phase:2, phaseLimit:false, door:"The Crypt", planet:"Venus", spine:"Cervical", clicks:["Gt-01"], ciphers:[], haunts:[], prowls:null, feeds:null, shadows:null, decaCard:"8C", clusterType:8, decademon:null, rites:[{"rt": 1, "seq": "271890", "desc": "Pineal-regression (rear vision)", "path": 2, "pathName": "Extreme Regression"}, {"rt": 2, "seq": "27541890", "desc": "Datacomb searches, digital exactitude", "path": 3, "pathName": "Abysmal Comprehension"}] },
  2: { name:"Doogu", aliases:"The Blob", title:"Original-Schism", mesh:"02", netSpan:"2::1", type:"Cyclic Chronodemon", syzygy:null, zone:"2→1", domain:"Splitting-Waters", pitch:"Ana-3", phase:2, phaseLimit:true, door:null, planet:null, spine:null, clicks:[], ciphers:["Gt-21"], haunts:[], prowls:null, feeds:null, shadows:"Surge-Current", decaCard:"1H", clusterType:1, decademon:null, rites:[{"rt": 1, "seq": "1872", "desc": "Primordial breath (pneumatic practices)", "path": 4, "pathName": "Primordial Breath"}, {"rt": 2, "seq": "271", "desc": "Ambivalent capture, hooks", "path": 5, "pathName": "Slipping Backwards"}, {"rt": 3, "seq": "27541", "desc": "Slow pull to stasis, protection from drowning", "path": 6, "pathName": "Attaining Balance"}] },
  3: { name:"Ixix", aliases:"Yix", title:"Abductor", mesh:"03", netSpan:"3::0", type:"Chaotic Xenodemon", syzygy:null, zone:"3→0", domain:"Cosmic Indifference", pitch:"Ana-3", phase:3, phaseLimit:false, door:"The Swirl", planet:"Earth", spine:"Cranial", clicks:["Gt-03"], ciphers:["Gt-03"], haunts:[], prowls:null, feeds:null, shadows:null, decaCard:null, clusterType:null, decademon:null, rites:[{"rt": 0, "seq": "?", "desc": "Occult terrestrial history", "path": null, "pathName": null}] },
  4: { name:"Ixigool", aliases:"Djinn of the Magi", title:"Over-Ghoul", mesh:"04", netSpan:"3::1", type:"Amphidemon", syzygy:null, zone:"3→1", domain:"Tridentity", pitch:"Ana-4", phase:3, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:null, feeds:null, shadows:null, decaCard:"4H", clusterType:4, decademon:null, rites:[{"rt": 1, "seq": "18723", "desc": "Unimpeded ascent (prophecy)", "path": 7, "pathName": "Progressive Levitation"}, {"rt": 2, "seq": "1872563", "desc": "Ultimate implications (as above so below)", "path": 8, "pathName": "Eternal Digression"}] },
  5: { name:"Ixidod", aliases:"King Sid", title:"The Zombie-Maker", mesh:"05", netSpan:"3::2", type:"Amphidemon", syzygy:null, zone:"3→2", domain:"Escape-velocity", pitch:"Ana-5", phase:3, phaseLimit:true, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:["Gt-03"], prowls:null, feeds:null, shadows:null, decaCard:"5H", clusterType:5, decademon:null, rites:[{"rt": 1, "seq": "23", "desc": "Crises through excess (micropause abuse)", "path": 9, "pathName": "Sudden Flight"}, {"rt": 2, "seq": "27563", "desc": "Illusion of progress", "path": 10, "pathName": "Jagged Flight"}] },
  6: { name:"Krako", aliases:"Kru", title:"The Croaking Curse", mesh:"06", netSpan:"4::0", type:"Amphidemon", syzygy:null, zone:"4→0", domain:"Burning-Hail", pitch:"Ana-4", phase:4, phaseLimit:false, door:"Delta", planet:"Mars", spine:"Cervical", clicks:[], ciphers:[], haunts:[], prowls:null, feeds:null, shadows:null, decaCard:"9C", clusterType:9, decademon:null, rites:[{"rt": 1, "seq": "41890", "desc": "Subsidence, heaviness of fatality", "path": 11, "pathName": "Abysmal Subsidence"}, {"rt": 2, "seq": "451890", "desc": "Slow cataclysm", "path": 12, "pathName": "Slow Cataclysm"}] },
  7: { name:"Sukugool", aliases:"Old Skug", title:"The Sucking-Ghoul", mesh:"07", netSpan:"4::1", type:"Cyclic Chronodemon", syzygy:null, zone:"4→1", domain:"Deluge and Implosion", pitch:"Ana-5", phase:4, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:["Gt-10"], prowls:"Sink-Current", feeds:null, shadows:null, decaCard:"3C", clusterType:3, decademon:null, rites:[{"rt": 1, "seq": "187254", "desc": "Cycle of creation and destruction", "path": 13, "pathName": "Cyclic Perfection"}, {"rt": 2, "seq": "41", "desc": "Submersion (gravedigging)", "path": 14, "pathName": "Tranquil Drowning"}, {"rt": 3, "seq": "451", "desc": "Suspended decline", "path": 15, "pathName": "Suspended Decline"}] },
  8: { name:"Skoodu", aliases:"Li'l Scud", title:"The Fashioner", mesh:"08", netSpan:"4::2", type:"Cyclic Chronodemon", syzygy:null, zone:"4→2", domain:"Switch-Crazes", pitch:"Ana-6", phase:4, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:null, feeds:null, shadows:"Hold-Current", decaCard:"2H", clusterType:2, decademon:null, rites:[{"rt": 1, "seq": "2754", "desc": "Historical time (eschatology)", "path": 16, "pathName": "Supreme Balance"}, {"rt": 2, "seq": "41872", "desc": "Passage through the deep", "path": 17, "pathName": "Profound Renewal"}, {"rt": 3, "seq": "451872", "desc": "Cyclic reconstitution and stability", "path": 18, "pathName": "Cyclic Elevation"}] },
  9: { name:"Skarkix", aliases:"Sharky", title:"Buzz-Cutter", mesh:"09", netSpan:"4::3", type:"Amphidemon", syzygy:null, zone:"4→3", domain:"Anti-evolution", pitch:"Ana-7", phase:4, phaseLimit:true, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:null, feeds:null, shadows:null, decaCard:"6C", clusterType:6, decademon:null, rites:[{"rt": 1, "seq": "418723", "desc": "Hermetic abbreviations", "path": 19, "pathName": "Transcendent Resurgence"}, {"rt": 2, "seq": "41872563", "desc": "Alien intervention", "path": 20, "pathName": "Alien Intervention"}, {"rt": 3, "seq": "4518723", "desc": "Sacred seal of time", "path": 21, "pathName": "Supreme Comprehension"}, {"rt": 4, "seq": "4563", "desc": "Apocalyptic rapture (jagged turbulence)", "path": 22, "pathName": "Reverse Flight"}] },
  10: { name:"Tokhatto", aliases:"Old Toker", title:"Decimal Camouflage", mesh:"10", netSpan:"5::0", type:"Amphidemon", syzygy:null, zone:"5→0", domain:"Talismania", pitch:"Cth-4", phase:5, phaseLimit:false, door:"Hyperborea", planet:"Jupiter", spine:"Cervical", clicks:[], ciphers:[], haunts:[], prowls:null, feeds:null, shadows:null, decaCard:"9S", clusterType:9, decademon:null, rites:[{"rt": 1, "seq": "541890", "desc": "Number as destiny (digital convergence)", "path": 23, "pathName": "Deepest Destiny"}] },
  11: { name:"Tukkamu", aliases:null, title:"Occulturation", mesh:"11", netSpan:"5::1", type:"Cyclic Chronodemon", syzygy:null, zone:"5→1", domain:"Pathogenesis", pitch:"Cth-3", phase:5, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:"Sink-Current", feeds:null, shadows:null, decaCard:"3S", clusterType:3, decademon:null, rites:[{"rt": 1, "seq": "18725", "desc": "Optimal maturation (medicine as diffuse healing)", "path": 24, "pathName": "Optimal Maturation"}, {"rt": 2, "seq": "541", "desc": "Rapid deterioration (putrefaction, catabolism)", "path": 25, "pathName": "Certain Slide"}] },
  12: { name:"Kuttadid", aliases:"Kitty", title:"Ticking Machines", mesh:"12", netSpan:"5::2", type:"Cyclic Chronodemon", syzygy:null, zone:"5→2", domain:"Precarious States", pitch:"Cth-2", phase:5, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:"Hold-Current", feeds:null, shadows:null, decaCard:"2D", clusterType:2, decademon:null, rites:[{"rt": 1, "seq": "275", "desc": "Maintaining balance (calendric conservatism)", "path": 26, "pathName": "Preserving Stability"}, {"rt": 2, "seq": "541872", "desc": "Exhaustive vigilance", "path": 27, "pathName": "Cyclic Regeneration"}] },
  13: { name:"Tikkitix", aliases:"Tickler", title:"Clicking Menaces", mesh:"13", netSpan:"5::3", type:"Amphidemon", syzygy:null, zone:"5→3", domain:"Vortical Delirium", pitch:"Cth-1", phase:5, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:null, feeds:null, shadows:null, decaCard:"6S", clusterType:6, decademon:null, rites:[{"rt": 1, "seq": "5418723", "desc": "Swirl-patterns (tornadoes, wind-voices)", "path": 28, "pathName": "Transcendent Comprehension"}, {"rt": 2, "seq": "563", "desc": "Mysterious disappearances", "path": 29, "pathName": "Celestial Abduction"}] },
  14: { name:"Katak", aliases:null, title:"Desolator", mesh:"14", netSpan:"5::4", type:"Syzygetic Chronodemon", syzygy:"5::4", zone:"5↔4", domain:"Cataclysmic Convergence", pitch:"Null", phase:5, phaseLimit:true, door:null, planet:null, spine:null, clicks:[], ciphers:["Gt-45"], haunts:[], prowls:null, feeds:"Sink-Current", shadows:null, decaCard:"Joker", clusterType:0, decademon:null, rites:[{"rt": 0, "seq": "X", "desc": "Tail-chasing, rabid animals", "path": 30, "pathName": "Coiled Fervour"}, {"rt": 1, "seq": "418725", "desc": "Panic (slasher pulp and religious fervour)", "path": 31, "pathName": "Eternal Revolution"}] },
  15: { name:"Tchu", aliases:"Tchanul", title:"Source of Subnothingness", mesh:"15", netSpan:"6::0", type:"Chaotic Xenodemon", syzygy:null, zone:"6→0", domain:"Ultimate Outsideness", pitch:"Cth-3", phase:6, phaseLimit:false, door:"Undu", planet:"Saturn", spine:"Cranial", clicks:[], ciphers:[], haunts:[], prowls:null, feeds:null, shadows:null, decaCard:null, clusterType:null, decademon:null, rites:[{"rt": 0, "seq": "?", "desc": "Cosmic deletions and real impossibilities", "path": null, "pathName": null}] },
  16: { name:"Djungo", aliases:null, title:"Infiltrator", mesh:"16", netSpan:"6::1", type:"Amphidemon", syzygy:null, zone:"6→1", domain:"Subtle Involvements", pitch:"Cth-2", phase:6, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:null, feeds:null, shadows:null, decaCard:"4D", clusterType:4, decademon:null, rites:[{"rt": 1, "seq": "187236", "desc": "Turbular fluids (maelstroms)", "path": 32, "pathName": "Vortical Escalation"}, {"rt": 2, "seq": "187256", "desc": "Surreptitious invasions", "path": 33, "pathName": "Jagged Escalation"}] },
  17: { name:"Djuddha", aliases:"Judd Dread", title:"Decentred Threat", mesh:"17", netSpan:"6::2", type:"Amphidemon", syzygy:null, zone:"6→2", domain:"Artificial Turbulence", pitch:"Cth-2", phase:6, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:null, feeds:null, shadows:null, decaCard:"5D", clusterType:5, decademon:null, rites:[{"rt": 1, "seq": "236", "desc": "Machine-vortex (seething skin)", "path": 34, "pathName": "Celestial Capture"}, {"rt": 2, "seq": "2756", "desc": "Storm peripheries (Wendigo legends)", "path": 35, "pathName": "Erratic Flight"}] },
  18: { name:"Djynxx", aliases:"Ching", title:"Child Stealer", mesh:"18", netSpan:"6::3", type:"Syzygetic Xenodemon", syzygy:"6::3", zone:"6↔3", domain:"Time-Lapse", pitch:"Null", phase:6, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:["Gt-36"], haunts:["Gt-06", "Gt-21"], prowls:"Warp-Current", feeds:"Warp-Current", shadows:null, decaCard:null, clusterType:null, decademon:null, rites:[{"rt": 0, "seq": "X", "desc": "Abstract cyclones, dust spirals (nomad war-machine)", "path": 36, "pathName": "Vortical Coincidence"}] },
  19: { name:"Tchakki", aliases:"Chuckles", title:"Bag of Tricks", mesh:"19", netSpan:"6::4", type:"Amphidemon", syzygy:null, zone:"6→4", domain:"Combustion", pitch:"Ana-1", phase:6, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:null, feeds:null, shadows:null, decaCard:"6H", clusterType:6, decademon:1, rites:[{"rt": 1, "seq": "4187236", "desc": "Quenching accidents (apprentice smiths)", "path": 37, "pathName": "Indirect Escape"}, {"rt": 2, "seq": "4187256", "desc": "Split comprehension", "path": 38, "pathName": "Split Comprehension"}, {"rt": 3, "seq": "45187236", "desc": "Mappings between incompatible time-systems", "path": 39, "pathName": "Eventual Comprehension"}, {"rt": 4, "seq": "456", "desc": "Conflagrations (spontaneous combustion)", "path": 40, "pathName": "Climbing Reversal"}] },
  20: { name:"Tchattuk", aliases:"One Eyed Jack", title:"Pseudo-Basis", mesh:"20", netSpan:"6::5", type:"Amphidemon", syzygy:null, zone:"6→5", domain:"Unscreened Matrix", pitch:"Cth-7", phase:6, phaseLimit:true, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:["Gt-15"], prowls:null, feeds:null, shadows:null, decaCard:"6D", clusterType:6, decademon:null, rites:[{"rt": 1, "seq": "54187236", "desc": "Zero-gravity", "path": 41, "pathName": "Final Comprehension"}, {"rt": 2, "seq": "56", "desc": "Cut-outs (UFO cover-ups, Nephilim)", "path": 42, "pathName": "Abrupt Elevation"}] },
  21: { name:"Puppo", aliases:"The Pup", title:"Break-Outs", mesh:"21", netSpan:"7::0", type:"Amphidemon", syzygy:null, zone:"7→0", domain:"Larval Regression", pitch:"Cth-2", phase:7, phaseLimit:false, door:"Akasha", planet:"Uranus", spine:"Cervical", clicks:[], ciphers:[], haunts:[], prowls:null, feeds:null, shadows:null, decaCard:"8S", clusterType:8, decademon:null, rites:[{"rt": 1, "seq": "71890", "desc": "Dissolving into slime (masked horrors)", "path": 43, "pathName": "Deep Regression"}, {"rt": 2, "seq": "72541890", "desc": "Chthonic swallowings", "path": 44, "pathName": "Profound Comprehension"}] },
  22: { name:"Bubbamu", aliases:"Bubs", title:"After Babylon", mesh:"22", netSpan:"7::1", type:"Cyclic Chronodemon", syzygy:null, zone:"7→1", domain:"Relapse", pitch:"Cth-1", phase:7, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:["Gt-28"], prowls:null, feeds:null, shadows:null, decaCard:"1D", clusterType:1, decademon:null, rites:[{"rt": 1, "seq": "187", "desc": "Hypersea (marine life on land)", "path": 45, "pathName": "Primal Awakening"}, {"rt": 2, "seq": "71", "desc": "Aquassassins (Black-Atlantis)", "path": 46, "pathName": "Basic Reversion"}, {"rt": 3, "seq": "72541", "desc": "Seawalls (dry-time)", "path": 47, "pathName": "Attaining Imbalance"}] },
  23: { name:"Oddubb", aliases:"Odba", title:"Broken Mirror", mesh:"23", netSpan:"7::2", type:"Syzygetic Chronodemon", syzygy:"7::2", zone:"7↔2", domain:"Swamp-Labyrinths", pitch:"Null", phase:7, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:null, feeds:"Hold-Current", shadows:null, decaCard:null, clusterType:null, decademon:null, rites:[{"rt": 0, "seq": "X", "desc": "Time loops, glamour and glosses", "path": 48, "pathName": "Perpetual Bubbling"}] },
  24: { name:"Pabbakis", aliases:"Pabzix", title:"Dabbler", mesh:"24", netSpan:"7::3", type:"Amphidemon", syzygy:null, zone:"7→3", domain:"Interference", pitch:"Ana-1", phase:7, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:null, feeds:null, shadows:null, decaCard:"5C", clusterType:5, decademon:2, rites:[{"rt": 1, "seq": "723", "desc": "Batrachian mutations (frog-plagues)", "path": 49, "pathName": "Escape Velocity"}, {"rt": 2, "seq": "72563", "desc": "Cans of worms (vermophobic hysteria)", "path": 50, "pathName": "Erratic Interference"}] },
  25: { name:"Ababbatok", aliases:"Abracadabra", title:"Regenerator", mesh:"25", netSpan:"7::4", type:"Cyclic Chronodemon", syzygy:null, zone:"7→4", domain:"Suspended Decay", pitch:"Ana-2", phase:7, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:null, feeds:null, shadows:"Hold-Current", decaCard:"2C", clusterType:2, decademon:null, rites:[{"rt": 1, "seq": "4187", "desc": "Frankensteinian experimentation (reanimations, golems)", "path": 51, "pathName": "Swift Revival"}, {"rt": 2, "seq": "45187", "desc": "Purifications, amphibious cycles", "path": 52, "pathName": "Slow Revival"}, {"rt": 3, "seq": "7254", "desc": "Sustenance (smoke visions)", "path": 53, "pathName": "Suspended Animation"}] },
  26: { name:"Papatakoo", aliases:"Pataku", title:"Upholder", mesh:"26", netSpan:"7::5", type:"Cyclic Chronodemon", syzygy:null, zone:"7→5", domain:"Calendric Time", pitch:"Cth-6", phase:7, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:"Hold-Current", feeds:null, shadows:null, decaCard:"2S", clusterType:2, decademon:null, rites:[{"rt": 1, "seq": "54187", "desc": "Ultimate success (perseverance, blood sacrifice)", "path": 54, "pathName": "Eventual Resurgence"}, {"rt": 2, "seq": "725", "desc": "Rituals becoming nature", "path": 55, "pathName": "Upholding Stability"}] },
  27: { name:"Bobobja", aliases:"Bubbles", title:"Heavy Atmosphere", mesh:"27", netSpan:"7::6", type:"Amphidemon", syzygy:null, zone:"7→6", domain:"Teeming Pestilence", pitch:"Cth-5", phase:7, phaseLimit:true, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:null, feeds:null, shadows:null, decaCard:"5S", clusterType:5, decademon:null, rites:[{"rt": 1, "seq": "7236", "desc": "Strange lights in the swamp", "path": 56, "pathName": "Bubbling Anomalies"}, {"rt": 2, "seq": "7256", "desc": "Swarmachines (lost harvests)", "path": 57, "pathName": "Jagged Abduction"}] },
  28: { name:"Minommo", aliases:null, title:"Webmaker", mesh:"28", netSpan:"8::0", type:"Amphidemon", syzygy:null, zone:"8→0", domain:"Submergence", pitch:"Cth-1", phase:8, phaseLimit:false, door:"Limbo", planet:"Neptune", spine:"Lumbar", clicks:[], ciphers:[], haunts:[], prowls:null, feeds:null, shadows:null, decaCard:"7S", clusterType:7, decademon:null, rites:[{"rt": 1, "seq": "890", "desc": "Shamanic voyage (dream sorcery)", "path": 58, "pathName": "Terminal Undertow"}] },
  29: { name:"Murrumur", aliases:"Mur Mur", title:"Dream-Serpent", mesh:"29", netSpan:"8::1", type:"Syzygetic Chronodemon", syzygy:"8::1", zone:"8↔1", domain:"The Deep Ones", pitch:"Null", phase:8, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:null, feeds:"Surge-Current", shadows:null, decaCard:null, clusterType:null, decademon:null, rites:[{"rt": 0, "seq": "X", "desc": "Oceanic sensation (gilled-unlife and spinal-regressions)", "path": 59, "pathName": "Self-Swallowing Somnolence"}] },
  30: { name:"Nammamad", aliases:null, title:"Mirroracle", mesh:"30", netSpan:"8::2", type:"Cyclic Chronodemon", syzygy:null, zone:"8→2", domain:"Subterranean Commerce", pitch:"Ana-1", phase:8, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:["Gt-28"], haunts:[], prowls:null, feeds:null, shadows:"Surge-Current", decaCard:"1C", clusterType:1, decademon:3, rites:[{"rt": 1, "seq": "2718", "desc": "Voodoo in cyberspace (cthulhoid traffic)", "path": 60, "pathName": "Submergent Mirroring"}, {"rt": 2, "seq": "275418", "desc": "Completion as final collapse", "path": 61, "pathName": "Cyclic Dreaming"}, {"rt": 3, "seq": "8172", "desc": "Emergences (things washed-up on beaches)", "path": 62, "pathName": "Emergent Mirroring"}] },
  31: { name:"Mummumix", aliases:"Mix-Up", title:"The Mist-Crawler", mesh:"31", netSpan:"8::3", type:"Amphidemon", syzygy:null, zone:"8→3", domain:"Insidious Fog", pitch:"Ana-2", phase:8, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:null, feeds:null, shadows:null, decaCard:"4C", clusterType:4, decademon:null, rites:[{"rt": 1, "seq": "81723", "desc": "Ocean storms (xenocommunication)", "path": 63, "pathName": "Tidal Evacuation"}, {"rt": 2, "seq": "8172563", "desc": "Diseases from outer-space", "path": 64, "pathName": "Tidal Vortex"}] },
  32: { name:"Numko", aliases:"Old Nuk", title:"Keeper of Old Terrors", mesh:"32", netSpan:"8::4", type:"Cyclic Chronodemon", syzygy:null, zone:"8→4", domain:"Autochthony", pitch:"Ana-3", phase:8, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:"Sink-Current", feeds:null, shadows:null, decaCard:"3H", clusterType:3, decademon:null, rites:[{"rt": 1, "seq": "418", "desc": "Necrospeleology (abysmal patience rewarded)", "path": 65, "pathName": "Rapid Submergence"}, {"rt": 2, "seq": "4518", "desc": "Subduction (carnivorous fish)", "path": 66, "pathName": "Suspended Subduction"}, {"rt": 3, "seq": "817254", "desc": "Vulcanism (bacterial intelligence)", "path": 67, "pathName": "Cyclic Succession"}] },
  33: { name:"Muntuk", aliases:"Manta", title:"Desert Swimmer", mesh:"33", netSpan:"8::5", type:"Cyclic Chronodemon", syzygy:null, zone:"8→5", domain:"Arid Seabeds", pitch:"Cth-5", phase:8, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:null, feeds:null, shadows:"Sink-Current", decaCard:"3D", clusterType:3, decademon:null, rites:[{"rt": 1, "seq": "5418", "desc": "Ancient rivers", "path": 68, "pathName": "Sliding Subduction"}, {"rt": 2, "seq": "81725", "desc": "Cloud-vaults and oppressive tension", "path": 69, "pathName": "Prolonged Emergence"}] },
  34: { name:"Mommoljo", aliases:"Mama Jo", title:"Alien Mother", mesh:"34", netSpan:"8::6", type:"Amphidemon", syzygy:null, zone:"8→6", domain:"Xenogenesis", pitch:"Cth-4", phase:8, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:null, feeds:null, shadows:null, decaCard:"4S", clusterType:4, decademon:null, rites:[{"rt": 1, "seq": "817236", "desc": "Cosmobacterial exogermination", "path": 70, "pathName": "Absolute Escalation"}, {"rt": 2, "seq": "817256", "desc": "Extraterrestrial residues (alien DNA)", "path": 71, "pathName": "Erratic Escalation"}] },
  35: { name:"Mommbo", aliases:null, title:"Tentacle Face", mesh:"35", netSpan:"8::7", type:"Cyclic Chronodemon", syzygy:null, zone:"8→7", domain:"Hybridity", pitch:"Cth-3", phase:8, phaseLimit:true, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:"Surge-Current", feeds:null, shadows:null, decaCard:"1S", clusterType:1, decademon:null, rites:[{"rt": 1, "seq": "817", "desc": "Larval awakening", "path": 72, "pathName": "Larval Awakening"}, {"rt": 2, "seq": "718", "desc": "Ophidian transmutation (palaeopythons)", "path": 73, "pathName": "Larval Reversion"}, {"rt": 3, "seq": "725418", "desc": "Surreptitious colonization", "path": 74, "pathName": "Cyclic Submergence"}] },
  36: { name:"Uttunul", aliases:null, title:"Seething Void", mesh:"36", netSpan:"9::0", type:"Syzygetic Xenodemon", syzygy:"9::0", zone:"9↔0", domain:"Atonality", pitch:"Null", phase:9, phaseLimit:false, door:"Cthelll", planet:"Pluto", spine:"Sacrum", clicks:["Gt-36"], ciphers:[], haunts:["Gt-45"], prowls:"Plex-Current", feeds:"Plex-Current", shadows:null, decaCard:null, clusterType:null, decademon:null, rites:[{"rt": 0, "seq": "X", "desc": "Crossing the iron-ocean (plutonics)", "path": 75, "pathName": "Seething Nullity"}] },
  37: { name:"Tutagool", aliases:"Yettuk", title:"The Tattered Ghoul", mesh:"37", netSpan:"9::1", type:"Amphidemon", syzygy:null, zone:"9→1", domain:"Punctuality", pitch:"Ana-1", phase:9, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:null, feeds:null, shadows:null, decaCard:"7H", clusterType:7, decademon:4, rites:[{"rt": 1, "seq": "189", "desc": "The dark arts, rusting iron, tattooing", "path": 76, "pathName": "Continual Sinking"}] },
  38: { name:"Unnunddo", aliases:"The False Nun", title:"Double-Undoing", mesh:"38", netSpan:"9::2", type:"Amphidemon", syzygy:null, zone:"9→2", domain:"Endless Uncasing", pitch:"Ana-2", phase:9, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:null, feeds:null, shadows:null, decaCard:"8H", clusterType:8, decademon:null, rites:[{"rt": 1, "seq": "27189", "desc": "Crypt-traffic (centipede simulations)", "path": 77, "pathName": "Chthonic Regression"}, {"rt": 2, "seq": "2754189", "desc": "Communication-grids (telecom webs)", "path": 78, "pathName": "Deep Comprehension"}] },
  39: { name:"Ununuttix", aliases:"Tick-Tock", title:"Particle Clocks", mesh:"39", netSpan:"9::3", type:"Chaotic Xenodemon", syzygy:null, zone:"9→3", domain:"Absolute Coincidence", pitch:"Ana-3", phase:9, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:null, feeds:null, shadows:null, decaCard:null, clusterType:null, decademon:null, rites:[{"rt": 0, "seq": "?", "desc": "Numerical connection through absence of any link", "path": null, "pathName": null}] },
  40: { name:"Ununak", aliases:"Nuke", title:"Blind Catastrophe", mesh:"40", netSpan:"9::4", type:"Amphidemon", syzygy:null, zone:"9→4", domain:"Convulsions", pitch:"Ana-4", phase:9, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:null, feeds:null, shadows:null, decaCard:"9H", clusterType:9, decademon:null, rites:[{"rt": 1, "seq": "4189", "desc": "Secrets of the blacksmiths", "path": 79, "pathName": "Subterranean Slippage"}, {"rt": 2, "seq": "45189", "desc": "Subterranean impulses", "path": 80, "pathName": "Subterranean Impulsion"}] },
  41: { name:"Tukutu", aliases:"Killer-Kate", title:"Cosmotraumatics", mesh:"41", netSpan:"9::5", type:"Amphidemon", syzygy:null, zone:"9→5", domain:"Death-Strokes", pitch:"Cth-4", phase:9, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:null, feeds:null, shadows:null, decaCard:"9D", clusterType:9, decademon:null, rites:[{"rt": 1, "seq": "54189", "desc": "Crash-signals (barkerian scarring)", "path": 81, "pathName": "Buried Instinct"}] },
  42: { name:"Unnutchi", aliases:"T'ai Chi", title:"Tachyonic Immobility", mesh:"42", netSpan:"9::6", type:"Chaotic Xenodemon", syzygy:null, zone:"9→6", domain:"Coiling Outsideness", pitch:"Cth-3", phase:9, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:null, feeds:null, shadows:null, decaCard:null, clusterType:null, decademon:null, rites:[{"rt": 0, "seq": "?", "desc": "Asymmetric zygopoise (cybernetic anomalies)", "path": null, "pathName": null}] },
  43: { name:"Nuttubab", aliases:"Nut-Cracker", title:"Mimetic Anorganism", mesh:"43", netSpan:"9::7", type:"Amphidemon", syzygy:null, zone:"9→7", domain:"Metaloid Unlife", pitch:"Cth-2", phase:9, phaseLimit:false, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:[], prowls:null, feeds:null, shadows:null, decaCard:"8D", clusterType:8, decademon:null, rites:[{"rt": 1, "seq": "7189", "desc": "Lunacies (iron in the blood)", "path": 82, "pathName": "Plunging Backwards"}, {"rt": 2, "seq": "7254189", "desc": "Dragon-lines (terrestrial electromagnetism)", "path": 83, "pathName": "Unending Comprehension"}] },
  44: { name:"Ummnu", aliases:"Om", title:"Ultimate Inconsequence", mesh:"44", netSpan:"9::8", type:"Amphidemon", syzygy:null, zone:"9→8", domain:"Earth-Screams", pitch:"Cth-1", phase:9, phaseLimit:true, door:null, planet:null, spine:null, clicks:[], ciphers:[], haunts:["Gt-36"], prowls:null, feeds:null, shadows:null, decaCard:"7D", clusterType:7, decademon:null, rites:[{"rt": 1, "seq": "89", "desc": "Crust-friction (anorganic tension)", "path": 84, "pathName": "Compressed Termination"}] },
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
const DemonOracle=({result,onClose,onShare,mode,aeonTotal,lightMode})=>{const[vis,setVis]=useState(false);useEffect(()=>{hapticHeavy();setTimeout(()=>setVis(true),100);},[]);if(!result)return null;const ang=result.type==="angelic";const d=result.demon;const isSub=mode==="subdecadence";const ac=lightMode?"#000":(ang?"#ffd700":"#ff0044");const lm=lightMode;const tx=lm?"#000":"#ddd";const mt=lm?"#333":"#777";const ft=lm?"#555":"#444";const Sec=({label,children})=>(<div style={{borderTop:"1px solid "+(lm?"#ddd":ac+"18"),paddingTop:12,marginBottom:12}}><div style={{color:lm?"#000":ac,fontSize:14,letterSpacing:3,marginBottom:6}}>{label}</div><div style={{color:tx,fontSize:18,lineHeight:1.85}}>{children}</div></div>);
  const gateRels=(dem)=>{const parts=[];if(dem.clicks&&dem.clicks.length)parts.push("Clicks "+dem.clicks.join(", "));if(dem.ciphers&&dem.ciphers.length)parts.push("Ciphers "+dem.ciphers.join(", "));if(dem.haunts&&dem.haunts.length)parts.push("Haunts "+dem.haunts.join(", "));return parts.join(" · ")||null;};
  const currRels=(dem)=>{const parts=[];if(dem.feeds)parts.push("Feeds "+dem.feeds);if(dem.prowls)parts.push("Prowls "+dem.prowls);if(dem.shadows)parts.push("Shadows "+dem.shadows);return parts.join(" · ")||null;};
  return(<div style={{position:"fixed",inset:0,zIndex:1000,background:lm?"rgba(255,255,255,0.96)":"rgba(0,0,0,0.94)",display:"flex",alignItems:"center",justifyContent:"center",opacity:vis?1:0,transition:"opacity 0.8s",backdropFilter:"blur(10px)",padding:12}}><div onClick={e=>e.stopPropagation()} style={{maxWidth:420,width:"100%",maxHeight:"90vh",overflowY:"auto",background:lm?"#fff":"linear-gradient(180deg,#0a0a0a,#050510)",border:"1px solid "+(lm?"#ccc":ac+"30"),borderRadius:4,padding:"24px 20px",fontFamily:"'Courier New',monospace",boxShadow:lm?"0 4px 20px rgba(0,0,0,0.12)":"0 0 50px "+ac+"15",position:"relative",WebkitOverflowScrolling:"touch",color:lm?"#000":"#ccc"}}>{!lm&&<div style={{position:"absolute",inset:0,pointerEvents:"none",background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.015) 2px,rgba(255,255,255,0.015) 4px)"}}/>}
    {ang?(<>
      <div style={{color:lm?"#000":"#ffd700",fontSize:15,letterSpacing:5,marginBottom:8}}>{isSub?"◈ ZYGONOVIST INDEX ◈":"◈ ANGELIC INDEX ◈"}</div>
      <div style={{color:lm?"#000":"#ffd700",fontSize:42,fontWeight:"bold",marginBottom:6}}>+{result.score}</div>
      {typeof aeonTotal==="number"&&<div style={{color:lm?"#333":"#ffd700aa",fontSize:16,marginBottom:8}}>Aeon Cumulation: {aeonTotal}</div>}
      <div style={{color:lm?"#333":"#999",fontSize:16,lineHeight:1.8,marginBottom:10}}>{isSub?"Positive results extend the Aeon under Neolemurian zygonovist reckoning. The nine-sum principle holds.":"Positive results contribute to the Angelic Index of the Decadence game, and are referred to the Decamantic tables of AOE-Angelology."}</div>
      <div style={{color:lm?"#555":"#666",fontSize:15,lineHeight:1.7,fontStyle:"italic"}}>{isSub?"Maximum single-game gain under Subdecadence rules is thirty-two.":"The Decamantic tables have never been published. Maximum single-game gain is thirty-eight, but this can be exceeded by cumulations from game to game until completion of an Aeon."}</div>
    </>):(<>
      <div style={{color:lm?"#000":ac,fontSize:15,letterSpacing:5,marginBottom:8}}>{isSub?"◈ LEMUR CALL ◈":"◈ DEMON CALL ◈"}</div>
      <div style={{color:lm?"#000":ac,fontSize:32,fontWeight:"bold",marginBottom:2,textShadow:lm?"none":"0 0 15px "+ac+"50"}}>{d.name}</div>
      {d.aliases&&<div style={{color:mt,fontSize:15,marginBottom:4,fontStyle:"italic"}}>{d.aliases}</div>}
      <div style={{color:lm?"#333":"#aaa",fontSize:17,marginBottom:4}}>{d.title}</div>
      <div style={{color:mt,fontSize:15,marginBottom:16}}>Mesh-{d.mesh} · {d.type} · [{d.netSpan}] · <span style={{fontStyle:"italic"}}>{demonPhoneme(d.netSpan)}</span></div>
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
      {d.rites&&d.rites.length>0&&<Sec label="RITES">{d.rites.map((r,i)=>{const zc=lm?"#000":(z=>{const n=parseInt(z);if(n===0||n===9)return"#9966ff";if(n===3||n===6)return ac;return"#0f0";});return(<div key={i} style={{marginBottom:8}}><div><span style={{color:lm?"#000":ac}}>Rt-{r.rt}:[{r.seq==="X"||r.seq==="?"?r.seq:r.seq.split("").map((z,j)=><span key={j} style={{color:lm?"#000":zc(z)}}>{z}</span>)}]</span>{r.pathName&&<span style={{color:mt,marginLeft:8}}>→ Pth-{r.path}: {r.pathName}</span>}</div><div style={{color:mt,fontSize:16,marginTop:2}}>{r.desc}</div></div>);})}</Sec>}
      {d.rites&&d.rites.some(r=>r.path&&PATHS[r.path])&&<Sec label="◈ BOOK OF PATHS ◈">{d.rites.filter(r=>r.path&&PATHS[r.path]).map((r,i)=><div key={i} style={{padding:"10px 12px",marginBottom:10,background:lm?"rgba(0,0,0,0.03)":"rgba(255,255,255,0.02)",border:"1px solid "+(lm?"#ddd":ac+"15"),borderRadius:2}}><div style={{color:lm?"#000":ac,fontSize:14,letterSpacing:2,marginBottom:8}}>Pth-{r.path}: {PATHS[r.path].name}</div>{PATHS[r.path].lines.map((line,j)=><div key={j} style={{color:lm?"#333":"#bba",fontSize:16,lineHeight:1.8,fontStyle:"italic"}}>{line}</div>)}</div>)}</Sec>}
      {d.rites&&d.rites[0]&&d.rites[0].seq==="?"&&<Sec label="◈ BOOK OF PATHS ◈"><div style={{color:lm?"#555":"#665",fontSize:16,lineHeight:1.8,fontStyle:"italic"}}>The routes of the Chaotic Xenodemons are unknowable. They operate outside the path system entirely.</div></Sec>}
      {INTERPRETATIONS[result.score]&&<Sec label="◈ FULL INTERPRETATION ◈"><div style={{color:lm?"#000":"#ccc",fontSize:18,lineHeight:1.95,fontStyle:"italic"}}>{INTERPRETATIONS[Math.min(result.score,44)]}</div></Sec>}
      <div style={{color:mt,fontSize:15,marginTop:16,textAlign:"center"}}>Score: -{result.score} · Aeon Terminated</div>
    </>)}
    <div style={{display:"flex",gap:8,marginTop:18}}>
      <button onClick={()=>{haptic();onClose();}} style={{flex:1,padding:"14px",background:"transparent",border:"1px solid "+(lm?"#000":ac+"40"),color:lm?"#000":ac,fontFamily:"monospace",fontSize:15,letterSpacing:3,cursor:"pointer",borderRadius:2}}>DISMISS</button>
      {!ang&&onShare&&<button onClick={()=>{haptic();onShare();}} style={{flex:1,padding:"14px",background:"transparent",border:"1px solid "+(lm?"#000":ac+"40"),color:lm?"#000":ac,fontFamily:"monospace",fontSize:13,letterSpacing:2,cursor:"pointer",borderRadius:2}}>SHARE READING</button>}
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
  
  const glitchOffset=useRef({x:0,y:0});
  // Book of Paths collapsible
  const[showPaths,setShowPaths]=useState(false);
  // Zones browser
  const[showZones,setShowZones]=useState(false);
  // Light mode
  const[lightMode,setLightMode]=useState(()=>loadData("lightMode",false));

  // Persistence
  const[bestAeon,setBestAeon]=useState(()=>loadData("bestAeon",0));
  const[bestRounds,setBestRounds]=useState(()=>loadData("bestRounds",0));
  const[totalGames,setTotalGames]=useState(()=>loadData("totalGames",0));
  const[demonLog,setDemonLog]=useState(()=>loadData("demonLog",[]));

  const isSub=mode==="subdecadence";
  const accent=lightMode?"#000":(isSub?"#f0f":"#0f3");
  // Theme
  const T=lightMode?{bg:"#fff",text:"#000",muted:"#333",faint:"#666",border:"#ccc",borderFaint:"#ddd",cardBg:"#f5f5f5",cardText:"#000",overlayBg:"rgba(255,255,255,0.97)",panelBg:"rgba(245,245,245,0.95)",accent:"#000",accentFaint:"#00000020",riteTC:"#000",ritePlex:"#000",riteWarp:"#000",pathText:"#000",interpText:"#000",pylonLabel:"#999",scanline:"transparent"}:{bg:"#000",text:"#ccc",muted:"#777",faint:"#444",border:"#1a1a1a",borderFaint:"#111",cardBg:"#111",cardText:"#ccc",overlayBg:"rgba(0,0,0,0.94)",panelBg:"rgba(0,0,0,0.3)",accent:accent,accentFaint:accent+"30",riteTC:"#0f0",ritePlex:"#9966ff",riteWarp:accent,pathText:"#bba",interpText:"#ccc",pylonLabel:"#333",scanline:"rgba(255,255,255,0.015)"};

  useEffect(()=>{const iv=setInterval(()=>{glitchOffset.current={x:(Math.random()*3-1.5),y:(Math.random()*2-1)};setGlitchText(true);setTimeout(()=>setGlitchText(false),100);},5000+Math.random()*8000);return()=>clearInterval(iv);},[]);

  useEffect(()=>{if(!loadData("tutorialSeen",false))setShowTutorial(true);},[]);

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
      const newLog=[entry,...demonLog].slice(0,9);
      setDemonLog(newLog);saveData("demonLog",newLog);
      if(roundNum>bestRounds){setBestRounds(roundNum);saveData("bestRounds",roundNum);}
      setOracleResult({type:"demonic",score:Math.abs(tot),demon:d});setGamePhase("aeonEnd");
    }
  };

  const shareDemonCall=()=>{
    if(!oracleResult||oracleResult.type==="angelic")return;
    const d=oracleResult.demon;
    let text="◈ DEMON CALL ◈\n"+d.name+(d.aliases?" ("+d.aliases+")":"")+"\n"+d.title+"\nMesh-"+d.mesh+" · "+d.type+" · ["+d.netSpan+"] · "+d.pitch+"\n";
    text+="\nDomain: "+d.domain;
    if(d.door)text+="\nDoor: "+d.door+" · "+d.planet+" · "+d.spine;
    text+="\nPhase-"+d.phase+(d.phaseLimit?" · Phase-Limit":"");
    if(d.decaCard)text+="\nDecadology: C/tp-#"+d.clusterType+" · ["+d.decaCard+"]";
    if(d.rites&&d.rites.length>0){text+="\n\n◈ RITES ◈";d.rites.forEach(r=>{text+="\nRt-"+r.rt+":["+r.seq+"]"+(r.pathName?" → Pth-"+r.path+": "+r.pathName:"")+"\n"+r.desc;});}
    if(d.rites){const pr=d.rites.find(r=>r.path&&PATHS[r.path]);if(pr){text+="\n\n◈ BOOK OF PATHS ◈\nPth-"+pr.path+": "+PATHS[pr.path].name+"\n"+PATHS[pr.path].lines.join("\n");}}
    if(INTERPRETATIONS[oracleResult.score])text+="\n\n◈ INTERPRETATION ◈\n"+INTERPRETATIONS[Math.min(oracleResult.score,44)];
    text+="\n\nScore: -"+oracleResult.score+" · Aeon Terminated\nhttps://playdecadence.online";
    if(navigator.share){navigator.share({title:"Demon Call: "+d.name,text}).catch(()=>{});}
    else if(navigator.clipboard){navigator.clipboard.writeText(text).then(()=>alert("Copied to clipboard"));}
  };

  const allRevealed=revealedIndex>=4;
  
  const vh = typeof window !== 'undefined' ? window.innerHeight : 700;
  const vw = typeof window !== 'undefined' ? Math.min(window.innerWidth, 420) : 420;
  const fromHeight = Math.floor((vh - 180) / 4);
  const fromWidth = Math.floor((vw - 20) / 3.15);
  const CH = Math.max(65, Math.min(170, fromHeight, fromWidth));
  const CW = Math.round(CH / 1.55);

  // #13: view a demon from the log
  const viewLoggedDemon=(entry)=>{
    const mesh=parseInt(entry.mesh);
    const d=DEMONS[mesh];
    if(d)setOracleResult({type:"demonic",score:entry.score,demon:d});
  };

  return(
    <div style={{minHeight:"100dvh",width:"100%",background:T.bg,color:T.text,fontFamily:"'Courier New',monospace",position:"relative",overflow:"hidden",WebkitTapHighlightColor:"transparent",transition:"background 0.3s, color 0.3s"}}>

      <div style={{position:"relative",zIndex:2,maxWidth:420,margin:"0 auto",padding:"6px 8px 10px",minHeight:"100dvh",overflow:gamePhase==="menu"?"auto":"auto"}}>

        <header style={{textAlign:"center",marginBottom:gamePhase==="menu"?6:2,paddingTop:gamePhase==="menu"?4:2}}>
          {gamePhase==="menu"&&<div style={{fontSize:11,letterSpacing:5,color:T.accent,opacity:0.5,marginBottom:1}}>{isSub?"◈ LEMURIAN NECRONOMICON ◈":"◈ PANDEMONIUM MATRIX ◈"}</div>}
          <h1 style={{fontSize:gamePhase==="menu"?22:14,fontWeight:"bold",margin:0,letterSpacing:gamePhase==="menu"?4:3,color:T.accent,textShadow:lightMode?"none":"0 0 20px "+accent+"60,0 0 40px "+accent+"20",transform:glitchText?"translate("+glitchOffset.current.x+"px,"+glitchOffset.current.y+"px)":"none"}}>{isSub?"SUBDECADENCE":"DECADENCE"}</h1>
          {gamePhase==="menu"&&<div style={{fontSize:13,color:lightMode?"#000":"#fff",letterSpacing:2,marginTop:2}}>{isSub?<>NEOLEMURIAN TIME-SORCERY<br/>SYZYGIES → 9</>:"ATLANTEAN TIME-SORCERY · PAIRS → 10"}</div>}
        </header>

        {/* MODE TOGGLE + CONTROLS — menu only */}
        {gamePhase==="menu"&&<div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:8,flexWrap:"wrap"}}>
          <button onClick={()=>{haptic();setMode(m=>m==="decadence"?"subdecadence":"decadence");}} style={{padding:"5px 12px",background:"transparent",border:"1px solid "+T.accentFaint,color:T.accent,fontFamily:"monospace",fontSize:10,letterSpacing:2,cursor:"pointer",borderRadius:2}}>⇄ {isSub?"DECADENCE":"SUBDECADENCE"}</button>
          <button onClick={()=>{haptic();setShowTutorial(true);}} style={{padding:"5px 12px",background:"transparent",border:"1px solid "+(lightMode?"#ccc":"#333"),color:T.muted,fontFamily:"monospace",fontSize:10,letterSpacing:2,cursor:"pointer",borderRadius:2}}>? RULES</button>
        </div>}

        {/* SCORE BAR */}
        {gamePhase!=="menu"&&(<div style={{display:"flex",justifyContent:"space-around",alignItems:"center",padding:"3px 10px",marginBottom:3,background:lightMode?"rgba(0,0,0,0.04)":"rgba(0,0,0,0.5)",border:"1px solid "+T.border,borderRadius:2,fontSize:10,letterSpacing:1}}>
          <span style={{color:T.muted}}>AEON <span style={{color:T.accent}}>{aeonScore}</span></span>
          <span style={{color:T.muted}}>ROUND <span style={{color:accent}}>{roundNum}</span></span>
          <span style={{color:T.muted}}>SCORE <span style={{color:score>=0?T.accent:accent}}>{score}</span></span>
        </div>)}

        {/* ═══ MENU ═══ */}
        {gamePhase==="menu"&&(
          <div style={{textAlign:"center",paddingTop:12}}>
            <div style={{marginBottom:16,display:"flex",justifyContent:"center"}}><img src="/numogram.png" alt="Numogram" style={{height:160,width:"auto",borderRadius:6,opacity:0.85,filter:"drop-shadow(0 0 12px rgba(0,255,51,0.2))"}}/></div>
            <button onClick={startAeon} style={{padding:"12px 36px",background:"transparent",border:"1px solid "+accent,color:accent,fontFamily:"monospace",fontSize:15,letterSpacing:5,cursor:"pointer",borderRadius:2,boxShadow:"0 0 25px "+accent+"20",marginBottom:10,display:"block",margin:"0 auto 10px"}}>BEGIN AEON</button>

            {/* STATS BAR */}
            {(bestAeon>0||totalGames>0)&&(<div style={{display:"flex",justifyContent:"center",gap:16,marginBottom:16,fontSize:11,color:lightMode?"#000":"#fff"}}>
              {bestAeon>0&&<span>BEST AEON: <span style={{color:lightMode?"#000":"#fff"}}>{bestAeon}</span></span>}
              {bestRounds>0&&<span>LONGEST: <span style={{color:lightMode?"#000":"#fff"}}>{bestRounds}</span> RNDs</span>}
              <span>GAMES: <span style={{color:lightMode?"#000":"#fff"}}>{totalGames}</span></span>
            </div>)}

            {/* #10: PANDEMONIUM MATRIX BROWSER */}
            <button onClick={()=>{haptic();setShowBrowser(!showBrowser);}} style={{padding:"6px 16px",background:"transparent",border:"1px solid "+accent+"30",color:accent,fontFamily:"monospace",fontSize:10,letterSpacing:3,cursor:"pointer",borderRadius:2,marginBottom:12,display:"block",margin:"0 auto 12px"}}>◈ BROWSE PANDEMONIUM MATRIX ◈</button>
            
            {showBrowser&&(<div style={{maxHeight:340,overflowY:"auto",border:"1px solid "+(lightMode?"#ccc":accent+"20"),borderRadius:2,padding:"8px",background:lightMode?"#fff":"rgba(0,0,0,0.4)",marginBottom:16,textAlign:"left"}}>
              <div style={{color:accent,fontSize:10,letterSpacing:3,marginBottom:8,textAlign:"center"}}>45 DEMONS · MESH 00–44</div>
              {Object.values(DEMONS).map(d=>(
                <div key={d.mesh} onClick={()=>{haptic();setOracleResult({type:"demonic",score:parseInt(d.mesh),demon:d});}} style={{padding:"6px 8px",borderBottom:"1px solid "+(lightMode?"#ddd":"#1a1a1a"),cursor:"pointer"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <span style={{color:accent,fontSize:13,fontWeight:d.syzygy?"bold":"normal"}}>{d.name}</span>
                      <span style={{color:lightMode?"#333":"#ccc",fontSize:11,marginLeft:8}}>M-{d.mesh} [{d.netSpan}]</span>
                    </div>
                    <span style={{color:lightMode?"#333":"#ccc",fontSize:10}}>{d.pitch}</span>
                  </div>
                  <div style={{color:lightMode?"#444":"#bbb",fontSize:10,marginTop:1}}>{d.title} · {d.type}{d.phaseLimit?" · Phase-Limit":""}{d.decaCard?" · ["+d.decaCard+"]":""} · <span style={{fontStyle:"italic",color:lightMode?"#555":"#999"}}>{demonPhoneme(d.netSpan)}</span></div>
                </div>
              ))}
            </div>)}

            {/* #13: DEMON LOG — tap to view */}
            {demonLog.length>0&&(<div style={{marginBottom:16}}>
              <button onClick={()=>{haptic();setShowHistory(!showHistory);}} style={{padding:"5px 14px",background:"transparent",border:"1px solid "+accent+"30",color:accent,fontFamily:"monospace",fontSize:10,letterSpacing:2,cursor:"pointer",borderRadius:2,marginBottom:showHistory?8:0,display:"block",margin:"0 auto "+(showHistory?"8":"12")+"px"}}>{showHistory?"HIDE":"SHOW"} DEMON LOG ({demonLog.length})</button>
              {showHistory&&<div style={{maxHeight:200,overflowY:"auto",border:"1px solid "+(lightMode?"#ccc":"#1a1a1a"),borderRadius:2,padding:"6px 8px",background:lightMode?"#fff":"rgba(0,0,0,0.3)"}}>
                {demonLog.map((e,i)=><div key={i} onClick={()=>viewLoggedDemon(e)} style={{fontSize:11,color:lightMode?"#333":"#ccc",marginBottom:4,borderBottom:"1px solid "+(lightMode?"#ddd":"#111"),paddingBottom:4,cursor:"pointer"}}>
                  <span style={{color:accent}}>{e.demon}</span> <span style={{color:lightMode?"#333":"#ccc"}}>Mesh-{e.mesh} · -{e.score} · Rnd {e.rounds} · {e.mode}</span>
                </div>)}
              </div>}
            </div>)}

            {/* RULES — collapsible */}
            <button onClick={()=>{haptic();setShowRules(!showRules);}} style={{padding:"6px 14px",background:"transparent",border:"1px solid "+accent+"30",color:accent,fontFamily:"monospace",fontSize:12,letterSpacing:2,cursor:"pointer",borderRadius:2,display:"block",margin:"0 auto 12px"}}>{showRules?"HIDE":""} {isSub?"SUBDECADENCE":"DECADENCE"} RULES</button>
            {showRules&&(<div style={{padding:"14px 12px",textAlign:"left",border:"1px solid "+(lightMode?"#ccc":"#1a1a1a"),borderRadius:2,background:lightMode?"rgba(0,0,0,0.03)":"rgba(0,0,0,0.3)",marginBottom:16}}>
              <div style={{color:lightMode?"#000":"#fff",fontSize:16,lineHeight:1.9,fontFamily:"'Courier New',monospace"}}>{isSub?"The ultimate blasphemy. Add four Queens (valued 0) to the Decadence pack, bringing the total to forty cards. Play as Decadence, except making pairs which add to nine — corresponding to Numogram Syzygies. Negative results call lemurs from the Pandemonium Matrix.":"The Adept Orders of Decadence trace their system back to the submergence of Atlantis. Truncate a standard pack, removing royals, tens, and jokers — thirty-six cards remain. Five dealt face-up on the Atlantean Cross (Set-1), five face-down (Set-2). Pairs sum to ten. Each pair scores by its difference. Unpaired Set-1 cards penalize by raw value. An Aeon lasts until the first negative result. Negative scores call demons from the Pandemonium Matrix."}</div>
            </div>)}

            {/* ZONES — collapsible */}
            <button onClick={()=>{haptic();setShowZones(!showZones);}} style={{padding:"6px 14px",background:"transparent",border:"1px solid "+accent+"30",color:accent,fontFamily:"monospace",fontSize:12,letterSpacing:2,cursor:"pointer",borderRadius:2,display:"block",margin:"0 auto 12px"}}>{showZones?"HIDE ":""}NUMOGRAM ZONES</button>
            {showZones&&(<div style={{padding:"14px 12px",textAlign:"left",border:"1px solid "+(lightMode?"#ccc":"#1a1a1a"),borderRadius:2,background:lightMode?"rgba(0,0,0,0.03)":"rgba(0,0,0,0.3)",marginBottom:16,maxHeight:400,overflowY:"auto"}}>
              <div style={{color:accent,fontSize:13,letterSpacing:3,marginBottom:12}}>◈ TEN ZONES · DECIMAL LABYRINTH ◈</div>
              {Object.keys(ZONES).map(k=>{const z=ZONES[k];return(<div key={k} style={{marginBottom:14,paddingBottom:10,borderBottom:"1px solid "+(lightMode?"#ddd":"#111")}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                  <span style={{color:accent,fontSize:16,fontWeight:"bold"}}>Zone-{k}</span>
                  <span style={{color:lightMode?"#666":"#ddd",fontSize:12}}>{z.region} · {z.planet} · {z.spine}</span>
                </div>
                <div style={{color:lightMode?"#555":"#ddd",fontSize:13,marginBottom:4}}>Syzygy: {k}::{z.twin} · {z.current} · {z.gate} · Phoneme: <span style={{fontStyle:"italic"}}>{z.phoneme}</span></div>
                <div style={{color:lightMode?"#333":"#fff",fontSize:15,lineHeight:1.7}}>{z.desc}</div>
              </div>);})}
            </div>)}

            {/* BOOK OF PATHS — collapsible */}
            <button onClick={()=>{haptic();setShowPaths(!showPaths);}} style={{padding:"6px 14px",background:"transparent",border:"1px solid "+accent+"30",color:accent,fontFamily:"monospace",fontSize:12,letterSpacing:2,cursor:"pointer",borderRadius:2,display:"block",margin:"0 auto 12px"}}>{showPaths?"HIDE ":""}BOOK OF PATHS</button>
            {showPaths&&(<div style={{padding:"14px 12px",textAlign:"left",border:"1px solid "+(lightMode?"#ccc":"#1a1a1a"),borderRadius:2,background:lightMode?"rgba(0,0,0,0.03)":"rgba(0,0,0,0.3)",marginBottom:16,maxHeight:400,overflowY:"auto"}}>
              <div style={{color:accent,fontSize:13,letterSpacing:3,marginBottom:12}}>◈ BOOK OF PATHS ◈</div>
              <div style={{color:lightMode?"#333":"#fff",fontSize:15,lineHeight:1.8,marginBottom:14}}>84 paths mapped to the rites of the 45 demons by Vysparov's Pandemonium Concordance. Translated from the Tibetan by Chaim Horowitz, c. 1949.</div>
              {Object.keys(PATHS).map(k=>{const p=PATHS[k];return(<div key={k} style={{marginBottom:14,paddingBottom:10,borderBottom:"1px solid "+(lightMode?"#ddd":"#111")}}>
                <div style={{color:accent,fontSize:14,letterSpacing:1,marginBottom:4}}>Pth-{k}: {p.name}</div>
                {p.lines.map((line,i)=><div key={i} style={{color:lightMode?"#333":"#eee",fontSize:15,lineHeight:1.7,fontStyle:"italic"}}>{line}</div>)}
              </div>);})}
            </div>)}

            {/* ORIGINS — collapsible */}
            <button onClick={()=>{haptic();setShowAbout(!showAbout);}} style={{padding:"6px 14px",background:"transparent",border:"1px solid "+accent+"30",color:accent,fontFamily:"monospace",fontSize:12,letterSpacing:2,cursor:"pointer",borderRadius:2,display:"block",margin:"0 auto 12px"}}>{showAbout?"HIDE ":""}ORIGINS</button>
            {showAbout&&(<div style={{padding:"14px 12px",textAlign:"left",border:"1px solid "+(lightMode?"#ccc":"#1a1a1a"),borderRadius:2,background:lightMode?"rgba(0,0,0,0.03)":"rgba(0,0,0,0.3)",marginBottom:16}}>
              <div style={{color:accent,fontSize:13,letterSpacing:3,marginBottom:8}}>◈ ORIGINS ◈</div>
              <div style={{color:lightMode?"#000":"#fff",fontSize:16,lineHeight:1.9}}>
                {isSub?"Subdecadence is the vigorously suppressed variant of the Decadence system — known amongst decadologists as 'the ultimate blasphemy.' Where Decadence operates under the Atlantean/AOE hermetic tradition (pairing to ten), Subdecadence pairs to nine, corresponding directly to the Numogram's syzygetic principle of zygonovism (nine-sum twinning). The four Queens (valued zero) correspond to the four Chaotic Xenodemons.":"Decadence is a gambling game and divination system associated with the Western tradition of Pandemonium practice, supposedly originating in Atlantis. The Adept Orders trace it to 10,000 BC. It is linked to Sumero-Babylonian geometry — the division of the circle into 360 (= 36 × 10) degrees. The western uptake of Pandemonium has its own esoteric gnosis called Decadology, assigning Amphidemons and Cyclic Chronodemons to nine cluster types."}
              </div>
              <div style={{color:lightMode?"#000":"#fff",fontSize:16,lineHeight:1.9,marginTop:10}}>
                The Pandemonium Matrix is the complete system of Lemurian demonism and time-sorcery — Numogram (time-map) and Matrix (listing the names, numbers and attributes of the 45 demons). Five syzygetic demons (Katak, Djynxx, Oddubb, Murrumur, Uttunul) carry the fundamental currents. The system is constructed according to immanent criteria latent in decimal numeracy.
              </div>
              <div style={{color:lightMode?"#666":"#666",fontSize:14,marginTop:12}}>Source: ccru.net/digithype/pandemonium.htm</div>
            </div>)}

            {/* CONTACT */}
            <button onClick={()=>{haptic();window.open("https://x.com/playdecadence","_blank");}} style={{padding:"6px 14px",background:"transparent",border:"1px solid "+accent+"30",color:accent,fontFamily:"monospace",fontSize:12,letterSpacing:2,cursor:"pointer",borderRadius:2,display:"block",margin:"0 auto 12px"}}>CONTACT</button>

            {/* LIGHT/DARK MODE */}
            <button onClick={()=>{haptic();const v=!lightMode;setLightMode(v);saveData("lightMode",v);}} style={{padding:"6px 14px",background:"transparent",border:"1px solid "+accent+"30",color:accent,fontFamily:"monospace",fontSize:12,letterSpacing:2,cursor:"pointer",borderRadius:2,display:"block",margin:"0 auto 12px"}}>{lightMode?"◑ DARK MODE":"◐ LIGHT MODE"}</button>

          </div>
        )}


        {/* ═══ GAME BOARD ═══ */}
        {(gamePhase==="playing"||gamePhase==="pairing")&&(<>
          <div style={{textAlign:"center",padding:"2px 8px",marginBottom:2,color:accent,fontSize:10,letterSpacing:1,minHeight:14,fontWeight:message.includes("VALID")?"bold":"normal"}}>{message}</div>

          <div style={{marginBottom:3}}>
            <div style={{color:lightMode?"#000":"#fff",fontSize:8,letterSpacing:3,textAlign:"center",marginBottom:2}}>◈ SET-1 · ATLANTEAN CROSS ◈</div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
              <div style={{textAlign:"center"}}><div style={{color:lightMode?"#000":"#fff",fontSize:7,letterSpacing:2,marginBottom:1}}>FAR FUTURE</div><Card card={set1[0]} faceUp selected={false} matched={matchedSet1.has(0)} onClick={()=>attemptPair(0)} w={CW} h={CH} flash={flashCard===0}/></div>
              <div style={{display:"flex",justifyContent:"center",gap:Math.max(3,Math.floor((CW*3+12-CW*3)/2))}}>
                <div style={{textAlign:"center"}}><div style={{color:lightMode?"#000":"#fff",fontSize:7,letterSpacing:2,marginBottom:1}}>DESTRUCTIVE</div><Card card={set1[1]} faceUp selected={false} matched={matchedSet1.has(1)} onClick={()=>attemptPair(1)} w={CW} h={CH} flash={flashCard===1}/></div>
                <div style={{textAlign:"center"}}><div style={{color:lightMode?"#000":"#fff",fontSize:7,letterSpacing:2,marginBottom:1}}>CREATIVE</div><Card card={set1[2]} faceUp selected={false} matched={matchedSet1.has(2)} onClick={()=>attemptPair(2)} w={CW} h={CH} flash={flashCard===2}/></div>
                <div style={{textAlign:"center"}}><div style={{color:lightMode?"#000":"#fff",fontSize:7,letterSpacing:2,marginBottom:1}}>MEMORIES</div><Card card={set1[3]} faceUp selected={false} matched={matchedSet1.has(3)} onClick={()=>attemptPair(3)} w={CW} h={CH} flash={flashCard===3}/></div>
              </div>
              <div style={{textAlign:"center"}}><Card card={set1[4]} faceUp selected={false} matched={matchedSet1.has(4)} onClick={()=>attemptPair(4)} w={CW} h={CH} flash={flashCard===4}/><div style={{color:lightMode?"#000":"#fff",fontSize:7,letterSpacing:2,marginTop:1}}>DEEP PAST</div></div>
            </div>
          </div>

          <div style={{height:1,background:"linear-gradient(90deg,transparent,"+accent+"25,transparent)",marginBottom:3}}/>

          <div>
            <div style={{color:lightMode?"#000":"#fff",fontSize:8,letterSpacing:3,textAlign:"center",marginBottom:2}}>◈ SET-2 · CONCEALED ◈</div>
            <div style={{display:"flex",justifyContent:"center",gap:Math.max(2, Math.min(5, Math.floor((vw - 5*Math.round(CH*0.6/1.55))/6)))}}>
              {set2.map((card,i)=><Card key={card.id} card={card} faceUp={i<=revealedIndex} selected={selectedSet2===i} matched={matchedSet2.has(i)} onClick={gamePhase==="playing"&&i===revealedIndex+1&&!matchedSet2.has(i)?()=>revealNext(i):null} w={Math.round(CH*0.6/1.55)} h={Math.round(CH*0.6)}/>)}
            </div>
          </div>

          <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:6,marginBottom:2}}>
            {gamePhase==="pairing"&&<button onClick={skipPair} style={{padding:"8px 20px",background:"transparent",border:"1px solid "+accent+"50",color:accent,fontFamily:"monospace",fontSize:12,letterSpacing:2,cursor:"pointer",borderRadius:2}}>SKIP</button>}
            {allRevealed&&gamePhase!=="pairing"&&<button onClick={()=>{haptic();endRound();}} style={{padding:"8px 20px",background:"transparent",border:"1px solid "+accent,color:accent,fontFamily:"monospace",fontSize:12,letterSpacing:3,cursor:"pointer",borderRadius:2,boxShadow:"0 0 15px "+accent+"18"}}>END ROUND</button>}
          </div>

          {/* #6: Pairs log — collapsed by default, show last pair only */}
          {roundResults.length>0&&(<div style={{marginTop:4,padding:"4px 8px",background:lightMode?"rgba(0,0,0,0.03)":"rgba(0,0,0,0.35)",border:"1px solid "+(lightMode?"#ddd":"#1a1a1a"),borderRadius:2,fontSize:10}}>
            <div style={{color:"#555",letterSpacing:2,marginBottom:3,fontSize:9}}>PAIRS ({roundResults.length})</div>
            <div style={{color:accent}}>{roundResults[roundResults.length-1].cards[0].value}{SS[roundResults[roundResults.length-1].cards[0].suit]} + {roundResults[roundResults.length-1].cards[1].value}{SS[roundResults[roundResults.length-1].cards[1].suit]} = {targetSum} +{roundResults[roundResults.length-1].score}</div>
            {roundResults.length>1&&<div style={{color:"#444",fontSize:10,marginTop:2}}>Total from pairs: +{roundResults.reduce((s,r)=>s+r.score,0)}</div>}
          </div>)}
        </>)}

        {/* ═══ ROUND END ═══ */}
        {gamePhase==="roundEnd"&&(<div style={{textAlign:"center",paddingTop:36}}>
          <div style={{color:accent,fontSize:11,letterSpacing:4,marginBottom:6}}>ROUND COMPLETE</div>
          <div style={{color:accent,fontSize:38,fontWeight:"bold",marginBottom:6}}>+{score}</div>
          <div style={{color:"#999",fontSize:13,marginBottom:24}}>Aeon Total: {aeonScore}</div>
          <button onClick={()=>{haptic();dealRound();}} style={{padding:"10px 28px",background:"transparent",border:"1px solid "+accent,color:accent,fontFamily:"monospace",fontSize:13,letterSpacing:4,cursor:"pointer",borderRadius:2}}>NEXT ROUND</button>
        </div>)}

        {/* ═══ AEON END ═══ */}
        {gamePhase==="aeonEnd"&&(<div style={{textAlign:"center",paddingTop:36}}>
          <div style={{color:accent,fontSize:11,letterSpacing:4,marginBottom:6}}>AEON TERMINATED</div>
          <div style={{color:accent,fontSize:32,fontWeight:"bold",marginBottom:6}}>DEMON CALL</div>
          <div style={{color:"#999",fontSize:13,marginBottom:24}}>Final Aeon: {aeonScore} · {roundNum} rounds</div>
          <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
            <button onClick={()=>{haptic();setOracleResult({type:"demonic",score:Math.abs(score),demon:DEMONS[Math.min(Math.abs(score),44)]||DEMONS[0]});}} style={{padding:"10px 20px",background:"transparent",border:"1px solid "+accent,color:accent,fontFamily:"monospace",fontSize:12,letterSpacing:3,cursor:"pointer",borderRadius:2}}>VIEW ORACLE</button>
            <button onClick={()=>{haptic();setGamePhase("menu");}} style={{padding:"10px 20px",background:"transparent",border:"1px solid #44444440",color:"#777",fontFamily:"monospace",fontSize:12,letterSpacing:3,cursor:"pointer",borderRadius:2}}>NEW AEON</button>
          </div>
        </div>)}

      </div>

      {oracleResult&&<DemonOracle result={oracleResult} onClose={()=>setOracleResult(null)} onShare={shareDemonCall} mode={mode} aeonTotal={aeonScore} lightMode={lightMode}/>}
      {showTutorial&&<Tutorial onClose={()=>setShowTutorial(false)} mode={mode}/>}
    </div>
  );
}
