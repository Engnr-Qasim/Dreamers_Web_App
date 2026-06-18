import { Campaign } from './storage';

export const CAMPAIGNS: Campaign[] = [
  {
    id: 'tree-plantation',
    name: 'Tree Plantation',
    description: 'Join our initiative to plant 10,000 trees across the region. Every tree planted helps combat climate change and improves air quality.',
    icon: '🌳',
    progress: 3500,
    target: 10000,
    participants: 245,
    category: 'environment',
  },
  {
    id: 'cleanliness-drive',
    name: 'Cleanliness Drives',
    description: 'Participate in weekly cleanliness drives to keep our neighborhoods clean and beautiful. Together we can make a difference!',
    icon: '🧹',
    progress: 78,
    target: 200,
    participants: 189,
    category: 'community',
  },
  {
    id: 'dustbin-installation',
    name: 'Dustbin Installation',
    description: 'Help us install dustbins in public areas to promote proper waste disposal and reduce littering in our community.',
    icon: '🗑️',
    progress: 120,
    target: 500,
    participants: 67,
    category: 'environment',
  },
  {
    id: 'awareness-sessions',
    name: 'Awareness Sessions',
    description: 'Conduct and attend awareness sessions about environmental conservation, recycling, and sustainable living practices.',
    icon: '📢',
    progress: 45,
    target: 100,
    participants: 312,
    category: 'awareness',
  },
];

export const ACTIVITIES = [
  {
    id: 'recycling-workshop',
    name: 'Recycling Workshop',
    description: 'Learn how to recycle effectively and reduce waste',
    icon: '♻️',
    date: '2024-02-15',
    isPremium: false,
  },
  {
    id: 'eco-fair',
    name: 'Eco Fair 2024',
    description: 'Annual environmental awareness fair with exhibitions',
    icon: '🎪',
    date: '2024-03-01',
    isPremium: false,
  },
  {
    id: 'green-hackathon',
    name: 'Green Hackathon',
    description: 'Build tech solutions for environmental challenges',
    icon: '💻',
    date: '2024-02-28',
    isPremium: true,
  },
  {
    id: 'nature-photography',
    name: 'Nature Photography Contest',
    description: 'Capture the beauty of nature and win prizes',
    icon: '📸',
    date: '2024-02-20',
    isPremium: true,
  },
];

export const getCampaignById = (id: string): Campaign | undefined => {
  return CAMPAIGNS.find(campaign => campaign.id === id);
};

export const getProgressPercentage = (campaign: Campaign): number => {
  return Math.round((campaign.progress / campaign.target) * 100);
};
