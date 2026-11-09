# Voice-over with the built-in Windows voice (Microsoft Zira), one WAV per line from narration.json.
#   powershell -File themeforest/sale/videos/tts.ps1 [-Voice "Microsoft David Desktop"] [-Out voiceover]
# A recorded or AI voice (voiceover/SCRIPT.md) sounds better: put those files in voiceover/ instead.
param([string]$Voice = 'Microsoft Zira Desktop', [string]$Out = 'voiceover')
$dir = Join-Path $PSScriptRoot $Out
New-Item -ItemType Directory -Force $dir | Out-Null
$n = Get-Content (Join-Path $PSScriptRoot 'narration.json') -Raw -Encoding UTF8 | ConvertFrom-Json
Add-Type -AssemblyName System.Speech
$s = New-Object System.Speech.Synthesis.SpeechSynthesizer
$s.SelectVoice($Voice)
$fmt = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(48000, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono)
foreach ($v in '1', '2', '3') {
  foreach ($p in $n.$v.PSObject.Properties) {
    $text = [System.Security.SecurityElement]::Escape($p.Value)
    # Slightly slower than default, short pause after each sentence
    $text = $text -replace '([.:]) ', '$1<break time="250ms"/> '
    $ssml = '<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US"><prosody rate="-8%">' + $text + '</prosody></speak>'
    $s.SetOutputToWaveFile((Join-Path $dir ("v$v-" + $p.Name.PadLeft(2, '0') + '.wav')), $fmt)
    $s.SpeakSsml($ssml)
  }
}
$s.SetOutputToNull()
$s.Dispose()
Get-ChildItem $dir -Filter *.wav | Measure-Object | ForEach-Object { "$($_.Count) files in $dir" }
