import React, { useState, useEffect } from 'react';
import { BsFacebook, BsInstagram, BsLinkedin, BsTwitter } from 'react-icons/bs';
import { FaPhoneAlt, FaEnvelope, FaGlobe } from 'react-icons/fa';
import { Footer } from 'flowbite-react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { apiFetch } from '../utils/api';

const FOOTER_SERVICE_LIMIT = 4;
const FOOTER_COURSE_LIMIT = 4;

export default function FooterComponent() {
    const { theme } = useSelector((state) => state.theme);
    const [services, setServices] = useState([]);
    const [totalServices, setTotalServices] = useState(0);
    const [courses, setCourses] = useState([]);
    const [totalCourses, setTotalCourses] = useState(0);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const data = await apiFetch('/api/v1/services/?isPublished=true');
                const list = data?.results || (Array.isArray(data) ? data : []);
                setTotalServices(list.length);
                setServices(list.slice(0, FOOTER_SERVICE_LIMIT));
            } catch {
                // Silently fail
            }
        };
        const fetchCourses = async () => {
            try {
                const data = await apiFetch('/api/v1/courses/');
                const list = data?.results || (Array.isArray(data) ? data : []);
                setTotalCourses(list.length);
                setCourses(list.slice(0, FOOTER_COURSE_LIMIT));
            } catch {
                // Silently fail
            }
        };
        fetchServices();
        fetchCourses();
    }, []);

    return (
        <Footer container className={`border-t-4 ${theme === 'light' ? 'border-brand-green bg-white' : 'border-brand-yellow bg-brand-blue'} mt-auto`}>
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                {/* Top Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
                    
                    {/* Company Info */}
                    <div>
                        <Link to="/" className="flex items-center mb-4 hover:scale-105 transition-transform duration-200">
                            <img
                                src={theme === 'light' 
                                    ? "https://res.cloudinary.com/dcrubaesi/image/upload/v1753007363/ECODEED_BLACK_LOGO_xtwjoy.png"
                                    : "https://res.cloudinary.com/dcrubaesi/image/upload/v1737333837/ECODEED_COLORED_LOGO_wj2yy8.png"}
                                alt="Ecodeed Logo"
                                className="h-14 w-14 mr-3"
                            />
                            <span className={`self-center text-2xl font-semibold whitespace-nowrap ${theme === 'light' ? 'text-brand-blue' : 'text-white'}`}>
                                Ecodeed
                            </span>
                        </Link>
                        <p className={`mb-4 text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                            Empowering a sustainable future through expert environmental consulting and education.
                        </p>
                        <div className="flex space-x-4">
                            {[
                                { icon: BsFacebook, href: "https://web.facebook.com/ecodeedconsulting", label: "Facebook" },
                                { icon: BsTwitter, href: "https://x.com/EcodeedC", label: "Twitter" },
                                { icon: BsInstagram, href: "https://www.instagram.com/ecodeed_consulting/", label: "Instagram" },
                                { icon: BsLinkedin, href: "https://www.linkedin.com/company/ecodeed-consultancy-company", label: "LinkedIn" }
                            ].map((social, index) => (
                                <a 
                                    key={index}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={social.label}
                                    className={`${theme === 'light' 
                                        ? 'text-gray-600 hover:text-brand-yellow' 
                                        : 'text-gray-300 hover:text-brand-yellow'} transition-colors duration-200 text-lg`}
                                >
                                    <social.icon />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <Footer.Title 
                            title="Quick Links" 
                            className={`mb-3 text-lg font-semibold ${theme === 'light' ? 'text-brand-blue' : 'text-brand-yellow'}`} 
                        />
                        <Footer.LinkGroup col className="space-y-2">
                            {[
                                { name: "Home", path: "/" },
                                { name: "About Us", path: "/about" },
                                { name: "Services", path: "/services" },
                                { name: "Courses", path: "/courses" },
                                { name: "Contact", path: "/contact" }
                            ].map((link, index) => (
                                <Link 
                                    key={index}
                                    to={link.path}
                                    className={`text-sm ${theme === 'light' 
                                        ? 'text-gray-600 hover:text-brand-yellow' 
                                        : 'text-gray-300 hover:text-brand-yellow'} transition-colors duration-200`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </Footer.LinkGroup>
                    </div>

                    {/* Courses */}
                    <div>
                        <Footer.Title 
                            title="Our Courses" 
                            className={`mb-3 text-lg font-semibold ${theme === 'light' ? 'text-brand-blue' : 'text-brand-yellow'}`} 
                        />
                        <Footer.LinkGroup col className="space-y-2">
                            {courses.length > 0 ? (
                                courses.map((course) => (
                                    <Link 
                                        key={course.id || course._id}
                                        to={`/courses/${course.slug || course.id}`}
                                        className={`text-sm ${theme === 'light' 
                                            ? 'text-gray-600 hover:text-brand-yellow' 
                                            : 'text-gray-300 hover:text-brand-yellow'} transition-colors duration-200`}
                                    >
                                        {course.title}
                                    </Link>
                                ))
                            ) : (
                                <Link 
                                    to="/courses"
                                    className={`text-sm ${theme === 'light' 
                                        ? 'text-gray-600 hover:text-brand-yellow' 
                                        : 'text-gray-300 hover:text-brand-yellow'} transition-colors duration-200`}
                                >
                                    View Our Courses
                                </Link>
                            )}
                            {totalCourses > FOOTER_COURSE_LIMIT && (
                                <Link 
                                    to="/courses"
                                    className={`text-sm font-medium ${theme === 'light' 
                                        ? 'text-brand-green hover:text-brand-yellow' 
                                        : 'text-brand-yellow hover:text-white'} transition-colors duration-200`}
                                >
                                    View All Courses →
                                </Link>
                            )}
                        </Footer.LinkGroup>
                    </div>

                    {/* Services */}
                    <div>
                        <Footer.Title 
                            title="Our Services" 
                            className={`mb-3 text-lg font-semibold ${theme === 'light' ? 'text-brand-blue' : 'text-brand-yellow'}`} 
                        />
                        <Footer.LinkGroup col className="space-y-2">
                            {services.length > 0 ? (
                                services.map((service) => (
                                    <Link 
                                        key={service.id || service._id}
                                        to={`/services/${service.slug || service.id}`}
                                        className={`text-sm ${theme === 'light' 
                                            ? 'text-gray-600 hover:text-brand-yellow' 
                                            : 'text-gray-300 hover:text-brand-yellow'} transition-colors duration-200`}
                                    >
                                        {service.title}
                                    </Link>
                                ))
                            ) : (
                                <Link 
                                    to="/services"
                                    className={`text-sm ${theme === 'light' 
                                        ? 'text-gray-600 hover:text-brand-yellow' 
                                        : 'text-gray-300 hover:text-brand-yellow'} transition-colors duration-200`}
                                >
                                    View Our Services
                                </Link>
                            )}
                            {totalServices > FOOTER_SERVICE_LIMIT && (
                                <Link 
                                    to="/services"
                                    className={`text-sm font-medium ${theme === 'light' 
                                        ? 'text-brand-green hover:text-brand-yellow' 
                                        : 'text-brand-yellow hover:text-white'} transition-colors duration-200`}
                                >
                                    View All Services →
                                </Link>
                            )}
                        </Footer.LinkGroup>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <Footer.Title
                            title="Contact Us"
                            className={`mb-3 text-lg font-semibold ${theme === 'light' ? 'text-brand-blue' : 'text-brand-yellow'}`}
                        />
                        <Footer.LinkGroup col className="space-y-2">
                            <a
                                href="tel:+254791233100"
                                className={`flex items-center gap-2 text-sm ${theme === 'light' 
                                    ? 'text-gray-600 hover:text-brand-yellow' 
                                    : 'text-gray-300 hover:text-brand-yellow'} transition-colors duration-200`}
                            >
                                <FaPhoneAlt className="text-brand-green" /> +254 791 233 100
                            </a>
                            <a
                                href="mailto:contact@ecodeed.co.ke"
                                className={`flex items-center gap-2 text-sm ${theme === 'light' 
                                    ? 'text-gray-600 hover:text-brand-yellow' 
                                    : 'text-gray-300 hover:text-brand-yellow'} transition-colors duration-200`}
                            >
                                <FaEnvelope className="text-brand-green" /> contact@ecodeed.co.ke
                            </a>
                            <a
                                href="https://www.ecodeed.co.ke"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-2 text-sm ${theme === 'light' 
                                    ? 'text-gray-600 hover:text-brand-yellow' 
                                    : 'text-gray-300 hover:text-brand-yellow'} transition-colors duration-200`}
                            >
                                <FaGlobe className="text-brand-green" /> www.ecodeed.co.ke
                            </a>
                        </Footer.LinkGroup>
                    </div>
                </div>

                {/* Divider */}
                <Footer.Divider className={`my-6 ${theme === 'light' ? 'border-gray-200' : 'border-gray-600'}`} />

                {/* Bottom Section */}
                <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                        © {new Date().getFullYear()}{' '}
                        <Link to="/" className="hover:underline">Ecodeed</Link>
                        ™. All Rights Reserved.
                    </p>
                    <div className="flex space-x-4 relative z-10">
                        <Link 
                            to="/privacy-policy" 
                            className={`text-sm cursor-pointer ${theme === 'light' ? 'text-gray-600 hover:text-brand-yellow' : 'text-gray-300 hover:text-brand-yellow'} transition-colors duration-200`}
                        >
                            Privacy Policy
                        </Link>
                        <Link 
                            to="/terms-of-service" 
                            className={`text-sm cursor-pointer ${theme === 'light' ? 'text-gray-600 hover:text-brand-yellow' : 'text-gray-300 hover:text-brand-yellow'} transition-colors duration-200`}
                        >
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>
        </Footer>
    );
}
