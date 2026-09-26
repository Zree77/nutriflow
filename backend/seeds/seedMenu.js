import 'dotenv/config';
import mongoose from 'mongoose';
import Menu from '../models/Menu.js';
import formattedMenuData from './menuData.js';

async function seedMenu() {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing menu items
        await Menu.deleteMany({});
        console.log('Cleared existing menu items');

        // Insert all menu items
        const result = await Menu.insertMany(formattedMenuData);
        console.log(`Successfully seeded ${result.length} menu items`);

        // Print summary by category
        const summary = {};
        formattedMenuData.forEach(item => {
            const goal = item.goalCategory[0] || 'Unknown';
            summary[goal] = (summary[goal] || 0) + 1;
        });

        console.log('\n Seeding Summary:');
        Object.entries(summary).forEach(([category, count]) => {
            console.log(`   ${category}: ${count} items`);
        });

    } catch (error) {
        console.error('Seeding error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n Disconnected from MongoDB');
    }
}

seedMenu();