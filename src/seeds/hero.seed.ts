import pool from '../config/db.js';

export const seedHero = async () => {
    const slides = [
        {
            id: 'HERO-1',
            order: 1,
            tag: 'Home',
            imageUrl: '/uploads/images/gallery/gallery-2.jpeg'
        },
        {
            id: 'HERO-2',
            order: 2,
            tag: 'Home',
            imageUrl: '/uploads/images/gallery/gallery-3.jpeg'
        },
        {
            id: 'HERO-3',
            order: 3,
            tag: 'Home',
            imageUrl: '/uploads/images/gallery/gallery-4.jpeg'
        },
        {
            id: 'HERO-4',
            order: 4,
            tag: 'Home',
            imageUrl: '/uploads/images/hero/hero-5.jpeg'
        },
        {
            id: 'HERO-5',
            order: 5,
            tag: 'Home',
            imageUrl: '/uploads/images/hero/hero-6.jpeg'
        },
        {
            id: 'HERO-6',
            order: 6,
            tag: 'Home',
            imageUrl: '/uploads/images/hero/hero-7.jpeg'
        },
        {
            id: 'HERO-7',
            order: 0,
            tag: 'About',
            imageUrl: '/uploads/images/about/Aboutus.png'
        },
        {
            id: 'HERO-8',
            order: 1,
            tag: 'About',
            imageUrl: '/uploads/images/about/vision.png'
        }
    ];

    console.log('🖼️ Seeding Hero Slides...');
    for (const slide of slides) {
        await pool.query(
            'REPLACE INTO hero_slides (id, imageUrl, `order`, tag) VALUES (?, ?, ?, ?)',
            [slide.id, slide.imageUrl, slide.order, slide.tag]
        );
    }
    console.log(`✅ Seeded ${slides.length} hero slides.`);
};
