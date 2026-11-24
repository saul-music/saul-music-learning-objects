// Los juegos de Aprende, por identificador. Cada lección apunta a uno (`oa`).
import * as americanNotation from "@saul-music/lo-american-notation";
import americanNotationMeta from "@saul-music/lo-american-notation/metadata.json";
import americanNotationCover from "@saul-music/lo-american-notation/cover.svg";
import "@saul-music/lo-american-notation/style.css";
import * as intervals from "@saul-music/lo-intervals";
import intervalsMeta from "@saul-music/lo-intervals/metadata.json";
import intervalsCover from "@saul-music/lo-intervals/cover.svg";
import "@saul-music/lo-intervals/style.css";
import * as enharmonic from "@saul-music/lo-enharmonic-spelling";
import enharmonicMeta from "@saul-music/lo-enharmonic-spelling/metadata.json";
import enharmonicCover from "@saul-music/lo-enharmonic-spelling/cover.svg";
import "@saul-music/lo-enharmonic-spelling/style.css";
import * as fretboardNotes from "@saul-music/lo-fretboard-notes";
import fretboardNotesMeta from "@saul-music/lo-fretboard-notes/metadata.json";
import fretboardNotesCover from "@saul-music/lo-fretboard-notes/cover.svg";
import "@saul-music/lo-fretboard-notes/style.css";
import * as arpeggios from "@saul-music/lo-arpeggios";
import arpeggiosMeta from "@saul-music/lo-arpeggios/metadata.json";
import arpeggiosCover from "@saul-music/lo-arpeggios/cover.svg";
import "@saul-music/lo-arpeggios/style.css";
import * as majorMinorEar from "@saul-music/lo-major-minor-ear";
import majorMinorEarMeta from "@saul-music/lo-major-minor-ear/metadata.json";
import majorMinorEarCover from "@saul-music/lo-major-minor-ear/cover.svg";
import "@saul-music/lo-major-minor-ear/style.css";
import * as chordShapes from "@saul-music/lo-chord-shapes";
import chordShapesMeta from "@saul-music/lo-chord-shapes/metadata.json";
import chordShapesCover from "@saul-music/lo-chord-shapes/cover.svg";
import "@saul-music/lo-chord-shapes/style.css";
import * as powerChords from "@saul-music/lo-power-chords";
import powerChordsMeta from "@saul-music/lo-power-chords/metadata.json";
import powerChordsCover from "@saul-music/lo-power-chords/cover.svg";
import "@saul-music/lo-power-chords/style.css";
import * as dimAug from "@saul-music/lo-dim-aug";
import dimAugMeta from "@saul-music/lo-dim-aug/metadata.json";
import dimAugCover from "@saul-music/lo-dim-aug/cover.svg";
import "@saul-music/lo-dim-aug/style.css";
import * as readBars from "@saul-music/lo-read-bars";
import readBarsMeta from "@saul-music/lo-read-bars/metadata.json";
import readBarsCover from "@saul-music/lo-read-bars/cover.svg";
import "@saul-music/lo-read-bars/style.css";
import * as strumRhythm from "@saul-music/lo-strum-rhythm";
import strumRhythmMeta from "@saul-music/lo-strum-rhythm/metadata.json";
import strumRhythmCover from "@saul-music/lo-strum-rhythm/cover.svg";
import "@saul-music/lo-strum-rhythm/style.css";

import * as barreChords from "@saul-music/lo-barre-chords";
import barreChordsMeta from "@saul-music/lo-barre-chords/metadata.json";
import barreChordsCover from "@saul-music/lo-barre-chords/cover.svg";
import * as sevenths from "@saul-music/lo-sevenths";
import seventhsMeta from "@saul-music/lo-sevenths/metadata.json";
import seventhsCover from "@saul-music/lo-sevenths/cover.svg";
import * as maj7Sixths from "@saul-music/lo-maj7-sixths";
import maj7SixthsMeta from "@saul-music/lo-maj7-sixths/metadata.json";
import maj7SixthsCover from "@saul-music/lo-maj7-sixths/cover.svg";
import * as slashChords from "@saul-music/lo-slash-chords";
import slashChordsMeta from "@saul-music/lo-slash-chords/metadata.json";
import slashChordsCover from "@saul-music/lo-slash-chords/cover.svg";
import * as passingChords from "@saul-music/lo-passing-chords";
import passingChordsMeta from "@saul-music/lo-passing-chords/metadata.json";
import passingChordsCover from "@saul-music/lo-passing-chords/cover.svg";
import * as susAdd9 from "@saul-music/lo-sus-add9";
import susAdd9Meta from "@saul-music/lo-sus-add9/metadata.json";
import susAdd9Cover from "@saul-music/lo-sus-add9/cover.svg";
import * as ninths from "@saul-music/lo-ninths";
import ninthsMeta from "@saul-music/lo-ninths/metadata.json";
import ninthsCover from "@saul-music/lo-ninths/cover.svg";
import * as tensions from "@saul-music/lo-tensions";
import tensionsMeta from "@saul-music/lo-tensions/metadata.json";
import tensionsCover from "@saul-music/lo-tensions/cover.svg";
import * as tonality from "@saul-music/lo-tonality";
import tonalityMeta from "@saul-music/lo-tonality/metadata.json";
import tonalityCover from "@saul-music/lo-tonality/cover.svg";
import * as studySong from "@saul-music/lo-study-song";
import studySongMeta from "@saul-music/lo-study-song/metadata.json";
import studySongCover from "@saul-music/lo-study-song/cover.svg";

const entry = (module, metadata, cover) => [metadata.id, { module, metadata, cover }];

export const OBJECTS = Object.fromEntries([
  entry(americanNotation, americanNotationMeta, americanNotationCover),
  entry(intervals, intervalsMeta, intervalsCover),
  entry(enharmonic, enharmonicMeta, enharmonicCover),
  entry(fretboardNotes, fretboardNotesMeta, fretboardNotesCover),
  entry(arpeggios, arpeggiosMeta, arpeggiosCover),
  entry(majorMinorEar, majorMinorEarMeta, majorMinorEarCover),
  entry(chordShapes, chordShapesMeta, chordShapesCover),
  entry(powerChords, powerChordsMeta, powerChordsCover),
  entry(dimAug, dimAugMeta, dimAugCover),
  entry(readBars, readBarsMeta, readBarsCover),
  entry(strumRhythm, strumRhythmMeta, strumRhythmCover),
  entry(barreChords, barreChordsMeta, barreChordsCover),
  entry(sevenths, seventhsMeta, seventhsCover),
  entry(maj7Sixths, maj7SixthsMeta, maj7SixthsCover),
  entry(slashChords, slashChordsMeta, slashChordsCover),
  entry(passingChords, passingChordsMeta, passingChordsCover),
  entry(susAdd9, susAdd9Meta, susAdd9Cover),
  entry(ninths, ninthsMeta, ninthsCover),
  entry(tensions, tensionsMeta, tensionsCover),
  entry(tonality, tonalityMeta, tonalityCover),
  entry(studySong, studySongMeta, studySongCover),
]);
