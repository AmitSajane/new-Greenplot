import React from 'react';
import { ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../../theme/tokens';
import { GeoPlace } from '../../../utils/geo/geocoding';
import { satelliteMapStyles as styles } from '../styles/satelliteMap.styles';

export interface SatelliteMapSearchBarProps {
  query: string;
  onChangeQuery: (text: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  isSearching: boolean;
  results: GeoPlace[];
  showResults: boolean;
  onSelectResult: (place: GeoPlace) => void;
}

const SearchResultSeparator = () => <View style={styles.searchResultSeparator} />;

export const SatelliteMapSearchBar: React.FC<SatelliteMapSearchBarProps> = ({
  query,
  onChangeQuery,
  onSubmit,
  onClear,
  isSearching,
  results,
  showResults,
  onSelectResult,
}) => (
  <View style={styles.searchWrap}>
    <View style={styles.searchBar}>
      <Ionicons name="search-outline" size={18} color={colors.textMuted} />
      <TextInput
        value={query}
        onChangeText={onChangeQuery}
        onSubmitEditing={onSubmit}
        placeholder="Search village, taluk or PIN code"
        placeholderTextColor={colors.textMuted}
        style={styles.searchInput}
        returnKeyType="search"
      />
      {isSearching ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : query.length > 0 ? (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          onPress={onClear}
          style={styles.searchClearButton}
        >
          <Ionicons name="close-circle" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      ) : null}
    </View>
    {showResults && (
      <View style={styles.searchResultsCard}>
        {results.length === 0 && !isSearching ? (
          <Text style={styles.searchEmptyText}>No matches. Try a nearby town or PIN code.</Text>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item, index) => `${item.lat}-${item.lon}-${index}`}
            keyboardShouldPersistTaps="handled"
            ItemSeparatorComponent={SearchResultSeparator}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.searchResultRow} onPress={() => onSelectResult(item)}>
                <Ionicons
                  name="location"
                  size={16}
                  color={colors.primaryDark}
                  style={styles.searchResultIcon}
                />
                <View style={styles.searchResultTextWrap}>
                  <Text style={styles.searchResultLabel}>{item.label}</Text>
                  {(item.district || item.state) && (
                    <Text style={styles.searchResultSub}>
                      {[item.district, item.state].filter(Boolean).join(', ')}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    )}
  </View>
);
