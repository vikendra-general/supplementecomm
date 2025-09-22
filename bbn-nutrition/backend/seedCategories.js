import mongoose from 'mongoose';
import Category from './models/Category.js';
import dotenv from 'dotenv';

dotenv.config({ path: './config.env' });

const categories = [
  {
    name: 'Protein',
    slug: 'protein',
    description: 'High-quality protein supplements for muscle building and recovery',
    image: '/images/categories/Protein.png',
    isActive: true,
    sortOrder: 1
  },
  {
    name: 'Pre-Workout',
    slug: 'pre-workout',
    description: 'Energy and performance boosters for intense workouts',
    image: '/images/categories/Pre-workout-1753207770.png',
    isActive: true,
    sortOrder: 2
  },
  {
    name: 'Creatine',
    slug: 'creatine',
    description: 'Strength and power supplements for enhanced performance',
    image: '/images/categories/Creatine-1753207660.png',
    isActive: true,
    sortOrder: 3
  },
  {
    name: 'Amino Acids',
    slug: 'amino-acids',
    description: 'Essential amino acids for muscle recovery and growth',
    image: '/images/categories/AMINO ACID.png',
    isActive: true,
    sortOrder: 4
  },
  {
    name: 'Vitamins',
    slug: 'vitamins',
    description: 'Essential vitamins and minerals for overall health',
    image: '/images/categories/vitamin.png',
    isActive: true,
    sortOrder: 5
  },
  {
    name: 'Omega-3',
    slug: 'omega-3',
    description: 'Essential fatty acids for heart and brain health',
    image: '/images/categories/Omega 3.jpeg',
    isActive: true,
    sortOrder: 6
  },
  {
    name: 'Mass Gainer',
    slug: 'mass-gainer',
    description: 'High-calorie supplements for weight and muscle gain',
    image: '/images/categories/Mass gainer.png',
    isActive: true,
    sortOrder: 7
  },
  {
    name: 'Fat Burners',
    slug: 'fat-burners',
    description: 'Weight management and fat burning supplements',
    image: '/images/categories/Fat burner.png',
    isActive: true,
    sortOrder: 8
  }
];

const seedCategories = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing categories
    await Category.deleteMany({});
    console.log('Cleared existing categories');

    // Insert new categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`Created ${createdCategories.length} categories`);

    // Display created categories
    createdCategories.forEach(category => {
      console.log(`- ${category.name} (${category.slug})`);
    });

    console.log('Categories seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
};

seedCategories();