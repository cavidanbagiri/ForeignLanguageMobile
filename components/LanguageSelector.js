import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';



const LanguageSelector = ({
  selected,
  onSelect,
  languages = [],
  compact,
  buttonStyle
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Təhlükəsizlik yoxlamaları
  const selectedLang = Array.isArray(languages)
    ? languages.find(l => l.code === selected)
    : null;

  const filteredLanguages = Array.isArray(languages)
    ? languages.filter(lang =>
      lang.name.toLowerCase().includes(searchText.toLowerCase()) ||
      lang.code.toLowerCase().includes(searchText.toLowerCase())
    )
    : [];

  return (
    <View>
      <TouchableOpacity
        style={[styles.selector, compact && styles.compactSelector, buttonStyle]}
        onPress={() => setModalVisible(true)}
      >
        {selectedLang ? (
          <>
            <Text style={styles.flag}>{selectedLang.flag}</Text>
            <Text style={[styles.text, compact && styles.compactText]}>
              {selectedLang.name}
            </Text>
          </>
        ) : (
          <Text style={styles.placeholderText}>Dil seçin</Text>
        )}
        <Ionicons name="chevron-down" size={16} color="#666" />
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Dil seçin</Text>

              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#999" />

              <TextInput
                style={styles.searchInput}
                placeholder="Dil axtar..."
                value={searchText}
                onChangeText={setSearchText}
                autoFocus={true}
              />
            </View>

            <FlatList
              data={filteredLanguages}
              keyExtractor={item => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.listItem,
                    selected === item.code && styles.selectedItem,
                  ]}
                  onPress={() => {
                    onSelect(item.code);
                    setModalVisible(false);
                    setSearchText('');
                  }}
                >
                  <Text style={styles.flag}>{item.flag}</Text>
                  <Text style={styles.listItemText}>{item.name}</Text>

                  {selected === item.code && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color="#007AFF"
                    />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <Text style={styles.emptyText}>
                  Dil tapılmadı
                </Text>
              )}
            />

          </View>
        </KeyboardAvoidingView>
      </Modal>
      {/* 
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >

          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Dil seçin</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#999" />
              <TextInput
                style={styles.searchInput}
                placeholder="Dil axtar..."
                value={searchText}
                onChangeText={setSearchText}
                autoFocus={true}
              />
            </View>

            <FlatList
              data={filteredLanguages}
              keyExtractor={item => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.listItem,
                    selected === item.code && styles.selectedItem,
                  ]}
                  onPress={() => {
                    onSelect(item.code);
                    setModalVisible(false);
                    setSearchText('');
                  }}
                >
                  <Text style={styles.flag}>{item.flag}</Text>
                  <Text style={styles.listItemText}>{item.name}</Text>
                  {selected === item.code && (
                    <Ionicons name="checkmark" size={20} color="#007AFF" />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <Text style={styles.emptyText}>Dil tapılmadı</Text>
              )}
            />
          </View>

        </KeyboardAvoidingView>
      </Modal> */}
    </View>
  );
};

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  compactSelector: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  flag: {
    fontSize: 20,
    marginRight: 6,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginRight: 4,
  },
  compactText: {
    fontSize: 13,
  },
  placeholderText: {
    fontSize: 14,
    color: '#999',
    marginRight: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  // modalContent: {
  //   backgroundColor: '#fff',
  //   borderTopLeftRadius: 20,
  //   borderTopRightRadius: 20,
  //   maxHeight: '70%',
  //   paddingBottom: 20,
  // },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 20,
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    paddingVertical: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  selectedItem: {
    backgroundColor: '#f0f7ff',
  },
  listItemText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    color: '#999',
  },
});

export default LanguageSelector;