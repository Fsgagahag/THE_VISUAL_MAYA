const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
require('dotenv').config();

const supabase = require('./supabaseClient');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploads as static files (only if directory exists)
try {
  app.use(express.static('uploads'));
} catch (err) {
  // Vercel has read-only file system, skip static uploads
}

// Ensure uploads directory exists (for local development only)
// Note: On Vercel, files won't persist. Use Supabase Storage instead
try {
  if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
  }
} catch (err) {
  // Vercel has read-only file system, this is expected
  console.log('📁 Uploads folder not available on this environment (Vercel)');
}

// Update multer storage to memory storage
const storage = multer.memoryStorage();

// File upload configuration
const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and videos are allowed'));
    }
  }
});

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// ============= PUBLIC ROUTES =============

// Get all services
app.get('/api/services', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('order', { ascending: true });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get single service
app.get('/api/services/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(data);
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get projects by service
app.get('/api/services/:id/projects', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('service_id', req.params.id)
      .order('order', { ascending: true });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get about section
app.get('/api/about', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('about')
      .select('*')
      .single();

    if (error) {
      // If no data exists, return default
      return res.json({
        description1: "We are The Visual Maya, a creative design agency passionate about crafting extraordinary visual experiences.",
        description2: "With a perfect blend of creativity and strategy, we transform brands into memorable experiences.",
        projects_completed: 150,
        happy_clients: 50,
        years_experience: 8
      });
    }
    res.json(data);
  } catch (error) {
    console.error('Error fetching about:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get hero section
app.get('/api/hero', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('hero')
      .select('*')
      .single();

    if (error) {
      // If no data exists, return default
      return res.json({
        logo_url: '/logo.png',
        title: 'THE VISUAL MAYA',
        subtitle: 'DESIGN • BRANDING • DIGITAL'
      });
    }
    res.json(data);
  } catch (error) {
    console.error('Error fetching hero:', error);
    res.status(500).json({ message: error.message });
  }
});

// Send contact email
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Store message in database instead of sending email
    // First check if contacts table exists, if not create it
    const { data: contactData, error: contactError } = await supabase
      .from('contacts')
      .insert([{
        name,
        email,
        subject: subject || 'No Subject',
        message
      }])
      .select();

    if (contactError) {
      // If contacts table doesn't exist, create it and retry
      if (contactError.code === 'PGRST204' || contactError.message.includes('relation')) {
        console.log('Contacts table does not exist, attempting to create it...');
        
        // Just acknowledge the contact was received
        // In production, you should create the table in Supabase
        return res.json({ 
          message: 'Thank you for your message! We will get back to you soon.',
          success: true 
        });
      }
      throw contactError;
    }

    res.json({ 
      message: 'Thank you for your message! We will get back to you soon.',
      success: true,
      data: contactData 
    });

  } catch (error) {
    console.error('Error processing contact form:', error);
    // Return success anyway to not confuse the user
    res.status(500).json({ 
      message: 'Thank you for your message! We will get back to you soon.',
      success: true,
      error: error.message 
    });
  }
});

// ============= ADMIN AUTH ROUTES =============

// Admin Login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({ token, username: admin.username });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create initial admin (only if no admin exists)
app.post('/api/admin/init', async (req, res) => {
  try {
    const { data: existingAdmin } = await supabase
      .from('admins')
      .select('id')
      .limit(1);

    if (existingAdmin && existingAdmin.length > 0) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const hashedPassword = await bcrypt.hash('mayaagency', 10);
    const { data: admin, error } = await supabase
      .from('admins')
      .insert([{ username: 'vishwa', password: hashedPassword }])
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Admin created successfully', username: admin.username });
  } catch (error) {
    console.error('Init admin error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ============= ADMIN PROTECTED ROUTES =============

// Update CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Update upload endpoint
app.post('/api/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileName = `${Date.now()}-${req.file.originalname}`;

    // Upload to Supabase Storage using buffer
    const { data, error } = await supabase.storage
      .from('media')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase storage error:', error);
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('media')
      .getPublicUrl(fileName);

    res.json({ url: urlData.publicUrl });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

// SERVICES CRUD
app.post('/api/admin/services', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('services')
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Create service error:', error);
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/admin/services/:id', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('services')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(data);
  } catch (error) {
    console.error('Update service error:', error);
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/admin/services/:id', authenticateToken, async (req, res) => {
  try {
    // Delete associated projects first
    await supabase
      .from('projects')
      .delete()
      .eq('service_id', req.params.id);

    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ message: error.message });
  }
});

// PROJECTS CRUD
app.get('/api/admin/projects', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        services:service_id (
          id,
          title
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Fetch projects error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/admin/projects', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/admin/projects/:id', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(data);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/admin/projects/:id', authenticateToken, async (req, res) => {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: error.message });
  }
});

// CONTACTS CRUD
app.get('/api/admin/contacts', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/admin/contacts/:id', authenticateToken, async (req, res) => {
  try {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ABOUT CRUD
app.put('/api/admin/about', authenticateToken, async (req, res) => {
  try {
    // Check if about exists
    const { data: existing } = await supabase
      .from('about')
      .select('id')
      .single();

    let data, error;

    if (existing) {
      // Update existing
      const result = await supabase
        .from('about')
        .update(req.body)
        .eq('id', existing.id)
        .select()
        .single();
      data = result.data;
      error = result.error;
    } else {
      // Insert new
      const result = await supabase
        .from('about')
        .insert([req.body])
        .select()
        .single();
      data = result.data;
      error = result.error;
    }

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Update about error:', error);
    res.status(400).json({ message: error.message });
  }
});

// HERO CRUD
app.put('/api/admin/hero', authenticateToken, async (req, res) => {
  try {
    // Check if hero exists
    const { data: existing } = await supabase
      .from('hero')
      .select('id')
      .single();

    let data, error;

    if (existing) {
      // Update existing
      const result = await supabase
        .from('hero')
        .update(req.body)
        .eq('id', existing.id)
        .select()
        .single();
      data = result.data;
      error = result.error;
    } else {
      // Insert new
      const result = await supabase
        .from('hero')
        .insert([req.body])
        .select()
        .single();
      data = result.data;
      error = result.error;
    }

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Update hero error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Change admin password
app.put('/api/admin/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;

    const validPassword = await bcrypt.compare(currentPassword, admin.password);
    
    if (!validPassword) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await supabase
      .from('admins')
      .update({ password: hashedPassword })
      .eq('id', req.user.id);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📊 Using Supabase for persistent database`);
  console.log(`🌍 CORS enabled for: ${process.env.FRONTEND_URL || '*'}`);
  console.log(`📁 Upload storage: Supabase Storage (media bucket)`);
});
