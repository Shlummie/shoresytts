# Voice reference

Drop an authorized reference recording and its exact transcript here to enable
local voice matching:

- `reference.wav` - a reference voice clip you are authorized to use.
- `transcript.txt` - the exact words spoken in the clip, nothing else.

When both files are present, `/api/speak` automatically switches to clone
mode. Remove the files, or leave the folder empty, to fall back to the `Ryan`
preset with the Shoresy-inspired delivery instruction.

Audio and transcript files in this folder are gitignored and must never be
committed. Do not add recordings, transcripts, or source media to Git history.

To use another clip, replace both files with a clean single-speaker recording
(a few seconds of clear speech without music, crowd, or overlapping voices)
and its exact transcript. Use only material you have permission to process.
