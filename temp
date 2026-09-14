import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';

import {
  useAudioRecorder,
  useAudioRecorderState,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
} from 'expo-audio';

// Diqqət: 'expo-file-system/legacy' istifadə edirik, çünki uploadAsync
// yeni ('expo-file-system') API-də yoxdur, hələ ki legacy-dədir.
import * as FileSystem from 'expo-file-system/legacy';

import LanguageSelector from './components/LanguageSelector';

import { languages } from './data/languages';
import { API_BASE_URL } from './config/api';

const { width } = Dimensions.get('window');

export default function App() {
  // Dil seçimləri
  const [leftLanguage, setLeftLanguage] = useState('tr');
  const [rightLanguage, setRightLanguage] = useState('en');

  // Mesajlar
  const [messages, setMessages] = useState([
    // { id: 1, text: 'Merhaba', language: 'tr', translated: 'Hello' },
    // { id: 2, text: 'How are you?', language: 'en', translated: 'Nasılsın?' },
  ]);

  const scrollViewRef = useRef();

  // Hansı tərəf qeyd edir və backend cavabı gözlənilirmi
  const [recordingSide, setRecordingSide] = useState(null); // 'left' | 'right' | null
  const [isProcessing, setIsProcessing] = useState(false);

  // expo-audio: tək bir recorder instansı, vəziyyəti hook izləyir
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  // Seçilmiş dilləri tap
  const leftLang = languages.find((l) => l.code === leftLanguage);
  const rightLang = languages.find((l) => l.code === rightLanguage);

  // Tətbiq açılanda mikrofon icazəsini iste, audio mode-u konfiqurasiya et
  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert(
          'İcazə lazımdır',
          'Danışmaq üçün mikrofon icazəsi verməlisiniz (Tənzimləmələr > Tətbiq > Mikrofon).'
        );
      }

      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
    })();
  }, []);

  // Audio faylını backend-ə göndər və nəticəni mesaj kimi əlavə et
  const sendAudioToBackend = async (uri, side) => {
    const sourceLang = side === 'left' ? leftLanguage : rightLanguage;
    const targetLang = side === 'left' ? rightLanguage : leftLanguage;

    try {
      setIsProcessing(true);

      // fetch/FormData yerinə expo-file-system-in native multipart
      // upload-undan istifadə edirik - yeni Expo fetch polifilli
      // {uri, name, type} formatını dəstəkləmir, bu isə problemsiz işləyir.
      const uploadResult = await FileSystem.uploadAsync(
        `${API_BASE_URL}/translate/audio`,
        uri,
        {
          httpMethod: 'POST',
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          fieldName: 'audio',
          mimeType: 'audio/m4a',
          parameters: {
            source_lang: sourceLang,
            target_lang: targetLang,
          },
        }
      );

      if (uploadResult.status < 200 || uploadResult.status >= 300) {
        const errorBody = JSON.parse(uploadResult.body || '{}');
        throw new Error(errorBody.detail || `Server xətası: ${uploadResult.status}`);
      }

      const data = JSON.parse(uploadResult.body);

      if (!data.transcript) {
        Alert.alert('Xəbərdarlıq', 'Səsdə heç bir nitq aşkarlanmadı. Yenidən cəhd edin.');
        return;
      }

      const newMessage = {
        id: Date.now(),
        text: data.transcript,
        language: sourceLang,
        translated: data.translated_text,
      };

      setMessages((prev) => [...prev, newMessage]);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd();
      }, 100);
    } catch (error) {
      console.error('Backend xətası:', error);
      Alert.alert(
        'Xəta',
        'Tərcümə alınmadı. Backend-in işlədiyini və eyni Wi-Fi-da olduğunuzu yoxlayın.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Qeydi dayandır və backend-ə göndər
  const stopRecording = async () => {
    const side = recordingSide;
    setRecordingSide(null);

    try {
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      if (uri) {
        await sendAudioToBackend(uri, side);
      }
    } catch (error) {
      console.error('Qeydi dayandırma xətası:', error);
      Alert.alert('Xəta', 'Səs qeydi emal edilə bilmədi.');
    }
  };

  // Qeydə başla
  const startRecording = async (side) => {
    try {
      const permission = await AudioModule.getRecordingPermissionsAsync();
      if (!permission.granted) {
        const requested = await AudioModule.requestRecordingPermissionsAsync();
        if (!requested.granted) {
          Alert.alert(
            'İcazə lazımdır',
            'Danışmaq üçün mikrofon icazəsi verməlisiniz (Tənzimləmələr > Tətbiq > Mikrofon).'
          );
          return;
        }
      }

      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setRecordingSide(side);
    } catch (error) {
      console.error('Mikrofon xətası:', error);
      setRecordingSide(null);
      Alert.alert('Xəta', 'Mikrofon açılmadı. Zəhmət olmasa icazəni yoxlayın.');
    }
  };

  // Mikrofon basıldıqda
  const handleMicPress = async (side) => {
    if (isProcessing) return; // əvvəlki tərcümə bitməyib, gözlə

    if (recorderState.isRecording) {
      if (recordingSide === side) {
        // Eyni tərəfə yenidən basılıb - dayandır və göndər
        await stopRecording();
      } else {
        // Digər tərəfə basılıb - əvvəlkini ləğv et, yenisinə başla
        await audioRecorder.stop().catch(() => {});
        setRecordingSide(null);
        await startRecording(side);
      }
      return;
    }

    await startRecording(side);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🌍 Foreign Talker</Text>
        <Text style={styles.subtitle}>Səsli Tərcümə</Text>
      </View>

      {/* Mesajlar (Söhbət Sahəsi) */}
      <ScrollView
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContentContainer}
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}
      >
        {messages.map((msg) => {
          const isLeft = msg.language === leftLanguage;
          const flag = isLeft ? leftLang?.flag : rightLang?.flag;
          const langName = isLeft ? leftLang?.name : rightLang?.name;
          const otherFlag = isLeft ? rightLang?.flag : leftLang?.flag;

          return (
            // <View
            //   key={msg.id}
            //   style={[
            //     styles.messageWrapper,
            //     isLeft ? styles.leftMessage : styles.rightMessage,
            //   ]}
            // >
            <View
              key={msg.id}
              style={[
                styles.messageRow,
                isLeft ? styles.messageRowLeft : styles.messageRowRight,
              ]}
            >
              <View style={styles.messageBubble}>
                <View style={styles.messageHeader}>
                  <Text style={styles.flagText}>{flag}</Text>
                  <Text style={styles.langName}>{langName}</Text>
                </View>
                <Text style={styles.originalText}>{msg.text}</Text>
                <View style={styles.dividerLine} />
                <View style={styles.translatedContainer}>
                  <Text style={styles.translatedFlag}>{otherFlag}</Text>
                  <Text style={styles.translatedText}>{msg.translated}</Text>
                </View>
              </View>
            </View>
          );
        })}

        {isProcessing && (
          <View style={styles.processingWrapper}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.processingText}>Tərcümə edilir...</Text>
          </View>
        )}
      </ScrollView>

      {/* Mikrofonlar və Dil Seçimləri */}
      <View style={styles.bottomContainer}>
        {/* Sol Mikrofon */}
        <View style={styles.micContainer}>
          <TouchableOpacity
            style={[
              styles.micButton,
              recordingSide === 'left' && styles.micButtonActive,
            ]}
            onPress={() => handleMicPress('left')}
            activeOpacity={0.7}
            disabled={isProcessing}
          >
            <Ionicons
              name={recordingSide === 'left' ? 'stop' : 'mic'}
              size={24}
              color="#fff"
            />
            <Text style={styles.micText}>
              {recordingSide === 'left' ? 'Dayandır' : 'Danış'}
            </Text>
          </TouchableOpacity>

          <View style={styles.languageSelectorWrapper}>
            <LanguageSelector
              selected={leftLanguage}
              onSelect={setLeftLanguage}
              languages={languages}
              compact={true}
              buttonStyle={styles.languageButton}
            />
          </View>
        </View>

        {/* Ayırıcı Xətt */}
        <View style={styles.dividerVertical} />

        {/* Sağ Mikrofon */}
        <View style={styles.micContainer}>
          <TouchableOpacity
            style={[
              styles.micButton,
              recordingSide === 'right' && styles.micButtonActive,
            ]}
            onPress={() => handleMicPress('right')}
            activeOpacity={0.7}
            disabled={isProcessing}
          >
            <Ionicons
              name={recordingSide === 'right' ? 'stop' : 'mic'}
              size={24}
              color="#fff"
            />
            <Text style={styles.micText}>
              {recordingSide === 'right' ? 'Dayandır' : 'Danış'}
            </Text>
          </TouchableOpacity>

          <View style={styles.languageSelectorWrapper}>
            <LanguageSelector
              selected={rightLanguage}
              onSelect={setRightLanguage}
              languages={languages}
              compact={true}
              buttonStyle={styles.languageButton}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  chatContentContainer: {
    paddingBottom: 8,  // və ya istədiyin qədər
    flexGrow: 1,
  },
  // messageWrapper: {
  //   marginBottom: 12,
  //   maxWidth: '85%',  // 95% çox böyükdür, 80-85% daha yaxşıdır
  //   flexShrink: 1,     // ✅ Bu vacibdir - mətn uzun olsa da kiçilir
  // },
  // leftMessage: {
  //   alignSelf: 'flex-start',
  // },
  // rightMessage: {
  //   alignSelf: 'flex-end',
  // },
  messageRow: {
    width: '100%',
    marginBottom: 12,
    flexDirection: 'row',
  },
  messageRowLeft: {
    justifyContent: 'flex-start',
  },
  messageRowRight: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    maxWidth: '85%',  // ✅ Burada maxWidth
    flexShrink: 1,
  },
  // messageBubble: {
  //   backgroundColor: '#fff',
  //   borderRadius: 12,
  //   padding: 12,
  //   shadowColor: '#000',
  //   shadowOffset: { width: 0, height: 1 },
  //   shadowOpacity: 0.05,
  //   shadowRadius: 2,
  //   elevation: 1,
  //   minWidth: 120,
  //   flexShrink: 1,    // ✅ Bu da vacibdir
  // },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  flagText: {
    fontSize: 18,
    marginRight: 6,
  },
  langName: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  originalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginVertical: 4,
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 6,
  },
  translatedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  translatedFlag: {
    fontSize: 16,
    marginRight: 6,
  },
  translatedText: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '500',
  },
  processingWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  processingText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#666',
  },
  bottomContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  micContainer: {
    flex: 1,
    alignItems: 'center',
  },
  micButton: {
    backgroundColor: '#007AFF',
    width: 60,
    height: 60,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  micButtonActive: {
    backgroundColor: '#FF3B30',
    shadowColor: '#FF3B30',
  },
  micText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  languageSelectorWrapper: {
    marginTop: 12,
    width: '100%',
    alignItems: 'center',
  },
  languageButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dividerVertical: {
    width: 1,
    backgroundColor: '#eee',
    marginHorizontal: 8,
  },
});
