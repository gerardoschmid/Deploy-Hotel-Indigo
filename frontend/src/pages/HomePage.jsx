import React from 'react';
import Navigation from '../components/Navigation';
import HeroBanner from '../components/HeroBanner';
import RoomMarketplace from '../components/RoomMarketplace';
import RestaurantSection from '../components/RestaurantSection';
import TablesSection from '../components/TablesSection';
import SalonsSection from '../components/SalonsSection';
import BookingSection from '../components/BookingSection';
import ServicesSection from '../components/ServicesSection';
import GallerySection from '../components/GallerySection';
import Footer from '../components/Footer';
import UbicacionMap from '../components/UbicacionMap';

const HomePage = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroBanner />
      <RoomMarketplace />
      <RestaurantSection />
      <TablesSection />
      <SalonsSection />
      <ServicesSection />
      <GallerySection />
      <UbicacionMap />
      {/** <BookingSection /> */}
      <Footer />
    </div>
  );
};

export default HomePage;
