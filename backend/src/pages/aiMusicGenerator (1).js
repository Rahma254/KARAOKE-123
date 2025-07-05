import { API_CONFIG, apiHelpers } from "../config/apis";

class AIMusicGenerator {
  constructor() {
    this.isGenerating = false;
    this.queue = [];
  }

  // Generate song using multiple AI services
  async generateSong(prompt, options = {}) {
    try {
      this.isGenerating = true;

      const {
        genre = "pop",
        duration = 180, // 3 minutes
        style = "karaoke",
        language = "indonesia",
        mood = "happy",
        tempo = "medium",
      } = options;

      console.log("🎵 Starting AI music generation...", { prompt, options });

      // Step 1: Generate lyrics using AI
      const lyrics = await this.generateLyrics(prompt, {
        genre,
        language,
        mood,
      });

      // Step 2: Generate melody structure using AI
      const melodyStructure = await this.generateMelodyStructure(lyrics, {
        genre,
        tempo,
      });

      // Step 3: Create voice track using AI voice synthesis
      const vocalTrack = await this.generateVocalTrack(lyrics, {
        style,
        language,
      });

      // Step 4: Generate instrumental backing track
      const instrumentalTrack = await this.generateInstrumental(
        melodyStructure,
        { genre, tempo },
      );

      // Step 5: Mix and master the tracks
      const finalSong = await this.mixTracks({
        vocals: vocalTrack,
        instrumental: instrumentalTrack,
        lyrics: lyrics,
        duration: duration,
      });

      console.log("✅ AI music generation completed!");
      return finalSong;
    } catch (error) {
      console.error("❌ AI music generation failed:", error);
      throw error;
    } finally {
      this.isGenerating = false;
    }
  }

  // Generate lyrics using AI text models
  async generateLyrics(prompt, options) {
    const { genre, language, mood } = options;

    const lyricsPrompt = `Generate ${language} karaoke song lyrics for: "${prompt}"
    
    Requirements:
    - Genre: ${genre}
    - Mood: ${mood}
    - Language: ${language}
    - Structure: Verse 1, Chorus, Verse 2, Chorus, Bridge, Chorus
    - Include timestamps for karaoke synchronization
    - Make it catchy and singable
    - Each line should be 4-8 seconds long
    
    Format as JSON with structure:
    {
      "title": "Song Title",
      "structure": [
        {"section": "verse1", "time": 0, "text": "Lyric line", "duration": 4},
        ...
      ]
    }`;

    try {
      // Try multiple AI services for best results
      let lyrics = null;

      // First try Groq for fast generation
      try {
        lyrics = await this.callGroqAPI(lyricsPrompt);
      } catch (error) {
        console.warn("Groq failed, trying Gemini:", error);
      }

      // Fallback to Gemini
      if (!lyrics) {
        try {
          lyrics = await this.callGeminiAPI(lyricsPrompt);
        } catch (error) {
          console.warn("Gemini failed, trying OpenRouter:", error);
        }
      }

      // Final fallback to OpenRouter
      if (!lyrics) {
        lyrics = await this.callOpenRouterAPI(lyricsPrompt);
      }

      return this.parseLyricsResponse(lyrics);
    } catch (error) {
      console.error("Lyrics generation failed:", error);
      return this.getFallbackLyrics(prompt, options);
    }
  }

  // Generate vocal track using AI voice synthesis
  async generateVocalTrack(lyrics, options) {
    const { style, language } = options;

    try {
      console.log("🎤 Generating vocal track...");

      // Use ElevenLabs or similar for high-quality voice synthesis
      const voiceConfig = {
        voice_id:
          language === "indonesia" ? "indonesian_singer" : "english_singer",
        style: style,
        speed: 1.0,
        emotion: "neutral",
      };

      // Convert lyrics to speech with musical timing
      const audioSegments = [];

      for (const lyricLine of lyrics.structure) {
        try {
          // Generate audio for each lyric line
          const audioData = await this.synthesizeVoice(
            lyricLine.text,
            voiceConfig,
          );
          audioSegments.push({
            audio: audioData,
            startTime: lyricLine.time,
            duration: lyricLine.duration,
            text: lyricLine.text,
          });
        } catch (error) {
          console.warn(`Failed to synthesize: "${lyricLine.text}"`, error);
        }
      }

      return {
        segments: audioSegments,
        totalDuration: Math.max(
          ...lyrics.structure.map((l) => l.time + l.duration),
        ),
        format: "wav",
        sampleRate: 44100,
      };
    } catch (error) {
      console.error("Vocal track generation failed:", error);
      return this.getFallbackVocalTrack(lyrics);
    }
  }

  // Generate instrumental backing track
  async generateInstrumental(melodyStructure, options) {
    const { genre, tempo } = options;

    try {
      console.log("🎼 Generating instrumental track...");

      // Use AI to generate MIDI or audio backing track
      const instrumentalPrompt = {
        structure: melodyStructure,
        genre: genre,
        tempo: tempo,
        instruments: this.getInstrumentsForGenre(genre),
        duration: melodyStructure.totalDuration || 180,
      };

      // This would integrate with actual music generation APIs
      // For now, return a placeholder structure
      return {
        audioUrl: null, // Would be actual generated audio URL
        midiData: null, // MIDI data for further processing
        structure: melodyStructure,
        instruments: instrumentalPrompt.instruments,
      };
    } catch (error) {
      console.error("Instrumental generation failed:", error);
      return this.getFallbackInstrumental(options);
    }
  }

  // Generate melody structure using AI
  async generateMelodyStructure(lyrics, options) {
    const { genre, tempo } = options;

    const structurePrompt = `Create a melody structure for these lyrics in ${genre} style:

    Lyrics: ${JSON.stringify(lyrics.structure)}
    
    Generate:
    - Chord progressions for each section
    - Melody notes and timing
    - Key signature
    - Tempo: ${tempo}
    - Arrangement instructions
    
    Return as JSON structure.`;

    try {
      const structure = await this.callAIForStructure(structurePrompt);
      return this.parseMelodyStructure(structure);
    } catch (error) {
      console.error("Melody structure generation failed:", error);
      return this.getFallbackMelodyStructure(lyrics, options);
    }
  }

  // Mix vocal and instrumental tracks
  async mixTracks(tracks) {
    try {
      console.log("🎛️ Mixing tracks...");

      // This would use audio processing libraries or APIs
      // For now, return a combined structure
      return {
        audioUrl: null, // Final mixed audio URL
        lyrics: tracks.lyrics,
        duration: tracks.duration,
        tracks: {
          vocals: tracks.vocals,
          instrumental: tracks.instrumental,
        },
        metadata: {
          generatedAt: new Date().toISOString(),
          version: "1.0",
          format: "mp3",
          quality: "high",
        },
      };
    } catch (error) {
      console.error("Track mixing failed:", error);
      throw error;
    }
  }

  // AI API Callers
  async callGroqAPI(prompt) {
    const response = await fetch(
      `${API_CONFIG.AI_TEXT.GROQ.BASE_URL}/chat/completions`,
      {
        method: "POST",
        headers: apiHelpers.getAIHeaders("groq"),
        body: JSON.stringify({
          model: "mixtral-8x7b-32768",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      },
    );

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async callGeminiAPI(prompt) {
    const response = await fetch(
      `${API_CONFIG.AI_TEXT.GEMINI.BASE_URL}/models/gemini-2.0-flash-exp:generateContent`,
      {
        method: "POST",
        headers: apiHelpers.getAIHeaders("gemini"),
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000,
          },
        }),
      },
    );

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  async callOpenRouterAPI(prompt) {
    const response = await fetch(
      `${API_CONFIG.AI_TEXT.OPENROUTER.BASE_URL}/chat/completions`,
      {
        method: "POST",
        headers: {
          ...apiHelpers.getAIHeaders("openrouter"),
          Authorization: `Bearer ${API_CONFIG.AI_TEXT.OPENROUTER.API_KEY}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "Nabila Portal Karaoke",
        },
        body: JSON.stringify({
          model: "anthropic/claude-3.5-sonnet",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      },
    );

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async synthesizeVoice(text, config) {
    // This would integrate with actual voice synthesis APIs
    // Using multiple services for best quality

    try {
      // Try Play.AI first
      const playAIResponse = await fetch(
        `${API_CONFIG.AI_VOICE.PLAY_AI.BASE_URL}/tts`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${API_CONFIG.AI_VOICE.PLAY_AI.API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: text,
            voice: config.voice_id,
            speed: config.speed,
            emotion: config.emotion,
          }),
        },
      );

      if (playAIResponse.ok) {
        return await playAIResponse.arrayBuffer();
      }
    } catch (error) {
      console.warn("Play.AI synthesis failed:", error);
    }

    // Fallback to other services or mock data
    return this.getMockAudioData(text);
  }

  // Utility methods
  getInstrumentsForGenre(genre) {
    const instruments = {
      pop: ["piano", "guitar", "bass", "drums", "synth"],
      rock: ["electric_guitar", "bass_guitar", "drums", "keyboard"],
      dangdut: ["kendang", "suling", "gitar", "keyboard", "bass"],
      jazz: ["piano", "trumpet", "saxophone", "bass", "drums"],
      electronic: ["synthesizer", "drum_machine", "bass_synth", "pad"],
    };

    return instruments[genre] || instruments.pop;
  }

  parseLyricsResponse(response) {
    try {
      // Try to parse JSON response
      const parsed = JSON.parse(response);
      return parsed;
    } catch (error) {
      // Fallback parsing for non-JSON responses
      return this.parseTextLyrics(response);
    }
  }

  parseTextLyrics(text) {
    // Parse plain text lyrics into structured format
    const lines = text.split("\n").filter((line) => line.trim());
    const structure = [];
    let currentTime = 0;

    lines.forEach((line, index) => {
      if (line.trim()) {
        structure.push({
          section: index < 4 ? "verse1" : index < 8 ? "chorus" : "verse2",
          time: currentTime,
          text: line.trim(),
          duration: 4,
        });
        currentTime += 4;
      }
    });

    return {
      title: "AI Generated Song",
      structure: structure,
    };
  }

  getFallbackLyrics(prompt, options) {
    return {
      title: `Lagu untuk ${prompt}`,
      structure: [
        {
          section: "verse1",
          time: 0,
          text: `Cerita tentang ${prompt}`,
          duration: 4,
        },
        { section: "verse1", time: 4, text: "Di dalam hati ku", duration: 4 },
        {
          section: "chorus",
          time: 8,
          text: `${prompt} selalu di hati`,
          duration: 4,
        },
        {
          section: "chorus",
          time: 12,
          text: "Takkan pernah terlupakan",
          duration: 4,
        },
        {
          section: "verse2",
          time: 16,
          text: "Melodi indah tercipta",
          duration: 4,
        },
        {
          section: "verse2",
          time: 20,
          text: "Dari AI yang cerdas",
          duration: 4,
        },
        {
          section: "chorus",
          time: 24,
          text: `${prompt} selalu di hati`,
          duration: 4,
        },
        {
          section: "chorus",
          time: 28,
          text: "Takkan pernah terlupakan",
          duration: 4,
        },
      ],
    };
  }

  getFallbackVocalTrack(lyrics) {
    return {
      segments: lyrics.structure.map((line) => ({
        audio: null,
        startTime: line.time,
        duration: line.duration,
        text: line.text,
      })),
      totalDuration: Math.max(
        ...lyrics.structure.map((l) => l.time + l.duration),
      ),
      format: "wav",
      sampleRate: 44100,
    };
  }

  getFallbackInstrumental(options) {
    return {
      audioUrl: null,
      midiData: null,
      structure: { totalDuration: 32 },
      instruments: this.getInstrumentsForGenre(options.genre),
    };
  }

  getFallbackMelodyStructure(lyrics, options) {
    return {
      totalDuration: Math.max(
        ...lyrics.structure.map((l) => l.time + l.duration),
      ),
      keySignature: "C Major",
      tempo:
        options.tempo === "fast" ? 140 : options.tempo === "slow" ? 80 : 120,
      chordProgression: ["C", "G", "Am", "F"],
      structure: lyrics.structure,
    };
  }

  getMockAudioData(text) {
    // Return empty audio buffer for development
    const buffer = new ArrayBuffer(8);
    return buffer;
  }

  async callAIForStructure(prompt) {
    // Simplified structure generation
    return this.callGroqAPI(prompt);
  }

  parseMelodyStructure(response) {
    try {
      return JSON.parse(response);
    } catch (error) {
      return {
        totalDuration: 32,
        keySignature: "C Major",
        tempo: 120,
        chordProgression: ["C", "G", "Am", "F"],
      };
    }
  }
}

export const aiMusicGenerator = new AIMusicGenerator();
export default AIMusicGenerator;
