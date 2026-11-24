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
]);
