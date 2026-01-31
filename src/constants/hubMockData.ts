export type MandiPrice = {
  id: string;
  crop: string;
  variety: string;
  pricePerQuintal: number;
  currencySymbol: string;
  changePercent: number;
};

export type NewsItem = {
  id: string;
  title: string;
  category: 'Subsidy' | 'Tips' | 'Market' | 'Innovation';
  timeAgo: string;
  imageUrl: string;
  summary: string;
  content: string;
};

export type FarmingTechnique = {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  tag: string;
  imageUrl: string;
};

export type CommunityQuestion = {
  id: string;
  authorName: string;
  timeAgo: string;
  question: string;
  isAnswered: boolean;
  answerPreview?: string;
  repliesCount: number;
  likesCount: number;
};

export const mandiPrices: MandiPrice[] = [
  {
    id: '1',
    crop: 'Wheat',
    variety: 'Lokwan',
    pricePerQuintal: 2450,
    currencySymbol: '₹',
    changePercent: 12,
  },
  {
    id: '2',
    crop: 'Onion',
    variety: 'Red',
    pricePerQuintal: 1800,
    currencySymbol: '₹',
    changePercent: -5,
  },
  {
    id: '3',
    crop: 'Tomato',
    variety: 'Hybrid',
    pricePerQuintal: 3200,
    currencySymbol: '₹',
    changePercent: 2,
  },
  {
    id: '4',
    crop: 'Maize',
    variety: 'Local',
    pricePerQuintal: 2100,
    currencySymbol: '₹',
    changePercent: 4,
  },
  {
    id: '5',
    crop: 'Cotton',
    variety: 'BT',
    pricePerQuintal: 6200,
    currencySymbol: '₹',
    changePercent: -3,
  },
];

export const latestNews: NewsItem[] = [
  {
    id: '1',
    title: 'New Tractor Subsidy Scheme Announced for Punjab Farmers',
    category: 'Subsidy',
    timeAgo: '2h ago',
    imageUrl: 'https://plus.unsplash.com/premium_photo-1661941037799-846efe84f4df?q=80&w=2388&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    summary:
      'Punjab government has launched a new subsidy scheme on tractors and farm machinery to reduce input costs for small and marginal farmers.',
    content:
      'The Punjab state government today announced a new subsidy scheme on tractors and farm implements aimed at small and marginal farmers.\n\n' +
      'Under the scheme, eligible farmers will receive up to 40% subsidy on tractors below 45 HP and 50% subsidy on selected farm machinery such as rotavators, seed drill machines and happy seeders.\n\n' +
      'Applications will be accepted through the online agriculture portal and at local agriculture offices. Farmers are advised to keep land documents, Aadhaar card and bank passbook ready for faster processing.',
  },
  {
    id: '2',
    title: 'Best Organic Fertilizer Mix for Rabi Season 2024',
    category: 'Tips',
    timeAgo: '5h ago',
    imageUrl: 'https://media.istockphoto.com/id/967945790/photo/organic-manure.jpg?s=2048x2048&w=is&k=20&c=1idqQzfDjH0nWqBw8AIT0G8yMEBKe_AWaA_cJ7wXUqI=',
    summary:
      'Experts recommend a balanced mix of farmyard manure, vermicompost and neem cake based on soil test reports for higher Rabi yields.',
    content:
      'Agriculture experts are advising farmers to plan their organic fertilizer strategy early for the Rabi season.\n\n' +
      'For cereals like wheat and barley, a base dose of 8–10 tonnes of well decomposed farmyard manure per acre combined with 200–250 kg of vermicompost gives very good results.\n\n' +
      'Adding 40–50 kg of neem cake helps in slow nutrient release and partial control of soil borne pests and nematodes. Always adjust the dose based on soil health card values for nitrogen, phosphorus and potassium.',
  },
  {
    id: '3',
    title: 'Government Raises MSP for Wheat and Paddy',
    category: 'Market',
    timeAgo: '1d ago',
    imageUrl: 'https://plus.unsplash.com/premium_photo-1661963447711-27f892ffe292?q=80&w=2346&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    summary:
      'The central government has increased the Minimum Support Price (MSP) for wheat and paddy for the upcoming marketing season.',
    content:
      'The central government today approved an increase in the Minimum Support Price (MSP) for major Rabi and Kharif crops.\n\n' +
      'MSP for wheat has been raised by ₹150 per quintal, while paddy MSP has seen an increase of ₹100 per quintal. The decision aims to ensure remunerative prices to farmers and encourage higher production.\n\n' +
      'Farmers are advised to check official notifications from the agriculture department or speak to their local mandi officials for updated procurement guidelines.',
  },
  {
    id: '4',
    title: 'IMD Forecasts Above Normal Rainfall for North-West India',
    category: 'Market',
    timeAgo: '2d ago',
    imageUrl: 'https://media.istockphoto.com/id/1476190237/photo/summer-rain-raindrops-bad-weather-depression.jpg?s=2048x2048&w=is&k=20&c=ky5JTM-ZpKr0zoDfB4jnatyATQ-5ZG7kdg9vU8ndrww',
    summary:
      'According to the latest IMD bulletin, several north-western states are likely to receive above normal rainfall in the coming fortnight.',
    content:
      'The India Meteorological Department (IMD) has issued an update predicting above normal rainfall over parts of Punjab, Haryana and western UP.\n\n' +
      'The system is likely to bring widespread light to moderate showers with isolated heavy falls at a few places. Farmers who are planning irrigation are advised to account for the forecasted rain to avoid waterlogging.\n\n' +
      'Standing crops in low-lying areas should be monitored, and proper drainage should be ensured in fields with sensitive crops like vegetables and cotton.',
  },
  {
    id: '5',
    title: 'FPOs Help Small Farmers Get Better Prices for Produce',
    category: 'Innovation',
    timeAgo: '3d ago',
    imageUrl: 'https://picsum.photos/seed/news-fpo/960/640',
    summary:
      'Farmer Producer Organisations (FPOs) are enabling small farmers to aggregate produce and negotiate better rates with buyers.',
    content:
      'Across the country, Farmer Producer Organisations (FPOs) are emerging as an important way for small and marginal farmers to access bigger markets.\n\n' +
      'By pooling their produce, farmers are able to reduce transport and handling costs and can negotiate better prices with wholesalers, processors and modern retail chains.\n\n' +
      'Experts recommend that farmers explore membership in local FPOs or cooperative societies to benefit from collective bargaining, input purchase at bulk rates and access to extension services.',
  },
];

export const modernFarmingTechniques: FarmingTechnique[] = [
  {
    id: '1',
    title: 'Using Drones for Efficient Pesticide Spraying',
    description:
      'Learn how drone technology can save up to 30% of your chemical costs and cover large fields faster.',
    durationMinutes: 3,
    tag: 'Innovation',
    imageUrl: 'https://plus.unsplash.com/premium_photo-1664478063149-295e8449a105?q=80&w=3869&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: '2',
    title: 'Soil Health Cards: Read and Use Them Correctly',
    description:
      'Understand pH, organic carbon and nutrient levels to choose the right fertilizer mix.',
    durationMinutes: 4,
    tag: 'Tips',
    imageUrl: 'https://plus.unsplash.com/premium_photo-1663089572474-6e2dc35d0ede?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: '3',
    title: 'Drip Irrigation Layout Basics for Row Crops',
    description:
      'A step-by-step guide to designing a simple drip irrigation system for vegetables and cotton fields.',
    durationMinutes: 5,
    tag: 'Innovation',
    imageUrl: 'https://images.unsplash.com/photo-1738598665806-7ecc32c3594c?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  // {
  //   id: '4',
  //   title: 'Using Mobile Apps for Pest and Disease Diagnosis',
  //   description:
  //     'See how image-based advisory apps can help you identify common pests and diseases early.',
  //   durationMinutes: 3,
  //   tag: 'Tips',
  //   imageUrl: 'https://picsum.photos/seed/tech-mobile/960/640',
  // },
];

export const communityQuestions: CommunityQuestion[] = [
  {
    id: '1',
    authorName: 'Ramesh Singh',
    timeAgo: '10m ago',
    question:
      'My cotton leaves are turning yellow at the edges. Is this water stress or a disease?',
    isAnswered: true,
    answerPreview: 'Likely potash deficiency; please share close-up photos.',
    repliesCount: 3,
    likesCount: 12,
  },
  {
    id: '2',
    authorName: 'Vijay Kumar',
    timeAgo: '1h ago',
    question:
      'What is the best time to sow mustard in Haryana this year given the late rain?',
    isAnswered: false,
    repliesCount: 5,
    likesCount: 8,
  },
  {
    id: '3',
    authorName: 'Sunita Devi',
    timeAgo: '3h ago',
    question:
      'Any experience with drip irrigation for sugarcane on sandy soil?',
    isAnswered: false,
    repliesCount: 2,
    likesCount: 6,
  },
  {
    id: '4',
    authorName: 'Gurpreet Kaur',
    timeAgo: '5h ago',
    question:
      'How many irrigations are ideal for wheat after the first watering at CRI stage?',
    isAnswered: true,
    answerPreview:
      'Typically 4–5 irrigations are enough depending on soil type and rainfall; focus on CRI, tillering, boot and grain filling stages.',
    repliesCount: 4,
    likesCount: 15,
  },
  {
    id: '5',
    authorName: 'Mahesh Patil',
    timeAgo: '1d ago',
    question:
      'What intercrops work well with cotton to improve income without reducing yield?',
    isAnswered: false,
    repliesCount: 3,
    likesCount: 9,
  },
];


