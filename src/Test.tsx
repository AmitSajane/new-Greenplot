import { StyleSheet, Text, View, FlatList, Image } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export default function App() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        'https://itunes.apple.com/us/rss/topalbums/limit=10/json'
      );
      setAlbums(data.feed.entry || []);
    } catch (e) {
      console.log('API Error:', e);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = useCallback(({ item }) => {
    const imageUrl = item['im:image']?.[1]?.label;

    return (
      <View style={styles.card}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />

        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {item['im:name']?.label}
          </Text>

          <Text style={styles.artist}>
            {item['im:artist']?.label}
          </Text>

          <Text style={styles.price}>
            {item['im:price']?.label}
          </Text>
        </View>
      </View>
    );
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Top Albums</Text>

      <FlatList
        data={albums}
        keyExtractor={(item) => item.id.attributes['im:id']}
        renderItem={renderItem}
        ListEmptyComponent={
          loading ? <Text>Loading...</Text> : <Text>No Data</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f2f2f2',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
  },
  image: {
    width: 80,
    height: 80,
  },
  textContainer: {
    flex: 1,
    padding: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  artist: {
    fontSize: 14,
    color: '#666',
  },
  price: {
    fontSize: 14,
    color: '#1F7A3F',
    marginTop: 4,
  },
});
