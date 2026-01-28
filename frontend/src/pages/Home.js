import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API_URL } from '../config';

const Home = () => {
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [services, setServices] = useState([]);

  // Handle Navbar Scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch Services Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const servicesRes = await axios.get(
          `${API_URL}/api/services`
        );

        setServices(servicesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Smooth Scroll
  const scrollToSection = (id) => {
    const element = document.getElementById(id);

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };

  return (
    <div>

      {/* ================= NAVBAR ================= */}
      <nav className={scrolled ? 'scrolled' : ''}>
        <div
          className="logo-container"
          onClick={() => navigate('/')}
        >
          <div className="logo-icon">
            <img
              src="/navbarlogo.png"
              alt="The Visual Maya Logo"
            />
          </div>
        </div>

        <ul className="nav-links">
          <li>
            <button onClick={() => scrollToSection('home')}>
              Home
            </button>
          </li>

          <li>
            <button onClick={() => scrollToSection('services')}>
              Services
            </button>
          </li>

          <li>
            <button onClick={() => scrollToSection('about')}>
              About
            </button>
          </li>

          <li>
            <button onClick={() => scrollToSection('contact')}>
              Contact
            </button>
          </li>
        </ul>
      </nav>

      {/* ================= HERO ================= */}
      <section className="hero" id="home">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>

        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <img
            src="/centrelogo.png"
            alt="The Visual Maya Logo"
            className="logo-image"
          />

          <p className="hero-subtitle">
            Where form earns meaning
          </p>

          <button
            type="button"
            className="cta-button"
            onClick={() => scrollToSection('contact')}
          >
            Let's Create Together
          </button>
        </motion.div>
      </section>

      {/* ================= SERVICES ================= */}
      <section className="services" id="services">

        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Our Services
        </motion.h2>

        <motion.p
          className="section-subtitle"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Crafting experiences that inspire and engage
        </motion.p>

        <div className="services-grid">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              className="service-card"
              onClick={() =>
                navigate(`/service/${service.id}`)
              }
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: index * 0.1
              }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="service-content">
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

      </section>

      {/* ================= ABOUT ================= */}
      <section className="about" id="about">

        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          About Us
        </motion.h2>

        <div className="about-content">

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            At The Visual Maya, we build meaningful visual
            identities that help brands stand out.
            We transform ideas into powerful systems
            through strategic design thinking.
          </motion.p>

        </div>
      </section>

      {/* ================= CONTACT ================= */}
      <section className="contact" id="contact">

        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Connect With Us
        </motion.h2>

        <motion.p
          className="section-subtitle"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Let's bring your vision to life
        </motion.p>

        {/* Contact Channels */}
        <motion.div
          className="contact-channels"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >

          {/* WhatsApp */}
          <motion.a
            href="https://wa.me/9326464101"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-channel"
            whileHover={{ scale: 1.05, y: -10 }}
          >
            <h3>WhatsApp</h3>
            <p>Chat with us</p>
          </motion.a>

          {/* Instagram */}
          <motion.a
            href="https://www.instagram.com/visuals.by.vishwa"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-channel"
            whileHover={{ scale: 1.05, y: -10 }}
          >
            <h3>Instagram</h3>
            <p>Follow our work</p>
          </motion.a>

        </motion.div>

      </section>

      {/* ================= FOOTER ================= */}
      <footer>
        <div className="footer-content">
          <p>© 2026 The Visual Maya. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
};

export default Home;
