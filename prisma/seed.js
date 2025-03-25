const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
    const dataPath = path.join(__dirname, 'data', 'world_universities_and_domains.json');
    const universities = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    for (const uni of universities) {
        await prisma.university.create({
            data: {
                name: uni.name,
                country: uni.country,
                stateProvince: uni['state-province'] || null,
                website: Array.isArray(uni.web_pages) ? uni.web_pages[0] : uni.web_pages,
            },
        });
    }
    console.log('Seeding completed');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
