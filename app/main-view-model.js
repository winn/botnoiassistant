import { Observable, Http } from '@nativescript/core';
import { MediaPlayer } from '@nativescript/media';

export function createViewModel() {
  const viewModel = new Observable();
  viewModel.userInput = "";
  viewModel.inputMessage = "";
  viewModel.audioUrl = "";
  viewModel.isPlaying = false;
  
  // Initialize media player
  let player = null;

  viewModel.onEnter = async () => {
    if (viewModel.userInput) {
      viewModel.set('inputMessage', 'Generating audio...');
      viewModel.set('audioUrl', '');
      viewModel.set('isPlaying', false);
      
      try {
        const response = await Http.request({
          url: 'https://api-voice.botnoi.ai/openapi/v1/generate_audio',
          method: 'POST',
          headers: {
            'Botnoi-Token': process.env.BOTNOI_TOKEN || '',
            'Content-Type': 'application/json'
          },
          content: JSON.stringify({
            text: viewModel.userInput,
            speaker: "1",
            volume: 1,
            speed: 1,
            type_media: "mp3",
            save_file: true,
            language: "th"
          })
        });

        const result = response.content.toJSON();
        if (result.audio_url) {
          viewModel.set('audioUrl', result.audio_url);
          viewModel.set('inputMessage', 'Audio ready to play!');
          
          // Create new player instance
          if (player) {
            player.dispose();
          }
          player = new MediaPlayer();
          player.volume = 1;
          await player.loadUrl(result.audio_url);

          // Handle completion
          player.on('completed', () => {
            viewModel.set('isPlaying', false);
          });
        } else {
          viewModel.set('inputMessage', 'Failed to get audio URL');
        }
      } catch (error) {
        console.log('API Error:', error);
        viewModel.set('inputMessage', 'Error generating audio');
      }
    }
  };

  viewModel.togglePlay = async () => {
    if (!player || !viewModel.audioUrl) return;

    if (viewModel.isPlaying) {
      player.pause();
      viewModel.set('isPlaying', false);
    } else {
      player.play();
      viewModel.set('isPlaying', true);
    }
  };

  return viewModel;
}