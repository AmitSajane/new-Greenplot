import { APIResponse } from '../types/serverDrivenUI';

export const mockHomeResponse: APIResponse = {
  version: '1.0.0',
  screen: {
    id: 'home-screen',
    title: 'Home',
    layout: {
      id: 'root',
      type: 'container',
      children: [
        {
          id: 'header',
          type: 'container',
          style: {
            padding: 16,
            backgroundColor: '#f5f5f5',
          },
          children: [
            {
              id: 'welcome-text',
              type: 'text',
              content: 'Welcome back!',
              variant: 'title',
              style: {
                fontSize: 24,
                fontWeight: '700',
                color: '#2c3e50',
              },
            },
          ],
        },
        {
          id: 'cards-container',
          type: 'container',
          style: { padding: 16 },
          children: [
            {
              id: 'stats-card',
              type: 'card',
              style: {
                marginBottom: 16,
                backgroundColor: '#ffffff',
              },
              cornerRadius: 12,
              elevation: 2,
              children: [
                {
                  id: 'stats-content',
                  type: 'container',
                  style: { padding: 16 },
                  children: [
                    {
                      id: 'stats-title',
                      type: 'text',
                      content: 'Today\'s Stats',
                      variant: 'title',
                      style: {
                        fontSize: 18,
                        fontWeight: '600',
                        marginBottom: 8,
                      },
                    },
                    {
                      id: 'stats-value',
                      type: 'text',
                      content: '42 plots available',
                      variant: 'body',
                      style: {
                        color: '#34495e',
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: 'action-card',
              type: 'card',
              style: {
                marginBottom: 16,
                backgroundColor: '#ffffff',
              },
              cornerRadius: 12,
              elevation: 2,
              children: [
                {
                  id: 'action-content',
                  type: 'container',
                  style: { padding: 16 },
                  children: [
                    {
                      id: 'action-image',
                      type: 'image',
                      url: 'https://www.shutterstock.com/shutterstock/photos/1863447628/display_1500/stock-photo-beautiful-green-young-paddy-field-soil-road-and-wide-golden-sky-with-sun-flare-in-morning-sunset-1863447628.jpg',
                      style: {
                        width: '100%',
                        height: 120,
                        marginBottom: 12,
                      },
                      resizeMode: 'cover',
                    },
                    {
                      id: 'action-title',
                      type: 'text',
                      content: 'Explore Green Spaces',
                      variant: 'title',
                      style: {
                        fontSize: 18,
                        fontWeight: '600',
                        marginBottom: 8,
                      },
                    },
                    {
                      id: 'action-description',
                      type: 'text',
                      content: 'Discover available plots in your area',
                      variant: 'body',
                      style: {
                        color: '#34495e',
                        marginBottom: 16,
                      },
                    },
                    {
                      id: 'action-button',
                      type: 'button',
                      label: 'View Plots',
                      style: {
                        backgroundColor: '#27ae60',
                        padding: 12,
                        borderRadius: 8,
                      },
                      action: {
                        type: 'navigation',
                        payload: 'Business',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  },
};