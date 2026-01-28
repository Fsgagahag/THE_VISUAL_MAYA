const bcrypt = require('bcryptjs');
require('dotenv').config();
const supabase = require('./supabaseClient');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seed...');

    // Check if services already exist
    const { data: existingServices } = await supabase
      .from('services')
      .select('id')
      .limit(1);

    if (existingServices && existingServices.length > 0) {
      console.log('ℹ️  Services already exist. Skipping service creation.');
      console.log('💡 To reset services, delete them manually in Supabase Table Editor first.');
    } else {
      // Create 4 default services
      const services = [
        {
          title: 'Package Designing',
          description: 'Innovative packaging solutions that showcase your product and captivate your customers with stunning visual designs.',
          image: '',
          order: 1
        },
        {
          title: 'Poster Designing',
          description: 'Eye-catching poster designs that communicate your message and inspire action with bold, impactful visuals.',
          image: '',
          order: 2
        },
        {
          title: 'Logo Designing',
          description: 'Create memorable brand identities with custom logo designs that capture your essence and stand out.',
          image: '',
          order: 3
        },
        {
          title: 'Brand Identity Design',
          description: 'Comprehensive brand strategy and visual identity systems that make you stand out in the marketplace.',
          image: '',
          order: 4
        }
      ];

      // Insert services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .insert(services)
        .select();

      if (servicesError) {
        console.error('Error inserting services:', servicesError);
      } else {
        console.log('✅ Created 4 default services');
      }
    }

    // Create admin if doesn't exist
    const { data: existingAdmin } = await supabase
      .from('admins')
      .select('id')
      .limit(1);

    if (!existingAdmin || existingAdmin.length === 0) {
      const hashedPassword = await bcrypt.hash('mayaagency', 10);
      const { error: adminError } = await supabase
        .from('admins')
        .insert([{ username: 'vishwa', password: hashedPassword }]);

      if (adminError) {
        console.error('Error creating admin:', adminError);
      } else {
        console.log('✅ Created admin user (username: vishwa, password: mayaagency)');
      }
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Create default about section
    const { data: existingAbout } = await supabase
      .from('about')
      .select('id')
      .single();

    if (!existingAbout) {
      const { error: aboutError } = await supabase
        .from('about')
        .insert([{
          description1: "We are The Visual Maya, a creative design agency passionate about crafting extraordinary visual experiences. Our team of talented designers brings your vision to life.",
          description2: "With a perfect blend of creativity and strategy, we transform brands into memorable experiences that resonate with audiences and drive meaningful engagement.",
          projects_completed: 150,
          happy_clients: 50,
          years_experience: 8
        }]);

      if (aboutError) {
        console.error('Error creating about:', aboutError);
      } else {
        console.log('✅ Created about section');
      }
    } else {
      console.log('ℹ️  About section already exists');
    }

    // Create default hero section
    const { data: existingHero } = await supabase
      .from('hero')
      .select('id')
      .single();

    if (!existingHero) {
      const { error: heroError } = await supabase
        .from('hero')
        .insert([{
          logo_url: '/logo.png',
          title: 'THE VISUAL MAYA',
          subtitle: 'DESIGN • BRANDING • DIGITAL'
        }]);

      if (heroError) {
        console.error('Error creating hero:', heroError);
      } else {
        console.log('✅ Created hero section');
      }
    } else {
      console.log('ℹ️  Hero section already exists');
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Summary:');
    console.log('- Services initialized');
    console.log('- Admin user ready');
    console.log('- About section initialized');
    console.log('- Hero section initialized');
    console.log('\n🌐 You can now:');
    console.log('1. Visit: http://localhost:3000');
    console.log('2. Admin: http://localhost:3000/admin/login');
    console.log('   Username: vishwa');
    console.log('   Password: mayaagency');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();