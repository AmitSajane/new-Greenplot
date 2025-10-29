import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { UIComponent } from '../types/serverDrivenUI';
import { useNavigation } from '@react-navigation/native';

interface Props {
  component: UIComponent;
}

export function DynamicComponent({ component }: Props) {
  const navigation = useNavigation();

  const renderComponent = (comp: UIComponent): React.ReactNode => {
    switch (comp.type) {
      case 'container':
        return (
          <View style={comp.style}>
            {comp.children.map((child) => (
              <DynamicComponent key={child.id} component={child} />
            ))}
          </View>
        );

      case 'text':
        return (
          <Text style={comp.style}>
            {comp.content}
          </Text>
        );

      case 'image':
        return (
          <Image
            source={{ uri: comp.url }}
            style={[
              comp.style,
              { resizeMode: comp.resizeMode || 'cover' },
            ]}
          />
        );

      case 'button':
        return (
          <TouchableOpacity
            style={[styles.button, comp.style]}
            onPress={() => {
              if (comp.action.type === 'navigation') {
                navigation.navigate(comp.action.payload as never);
              }
              // Add other action types here (link, api, etc.)
            }}
          >
            <Text style={styles.buttonText}>{comp.label}</Text>
          </TouchableOpacity>
        );

      case 'card':
        return (
          <View
            style={[
              styles.card,
              comp.style,
              {
                borderRadius: comp.cornerRadius,
                elevation: comp.elevation,
                shadowOpacity: comp.elevation ? 0.2 : 0,
                shadowRadius: comp.elevation || 0,
                shadowOffset: { width: 0, height: comp.elevation ? 2 : 0 },
              },
            ]}
          >
            {comp.children.map((child) => (
              <DynamicComponent key={child.id} component={child} />
            ))}
          </View>
        );

      default:
        return null;
    }
  };

  return <>{renderComponent(component)}</>;
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
  },
});