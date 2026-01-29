import React from 'react';

const UbicacionMap = () => {

  const lat = 8.61954437630107;
  const lng = -70.23411314260476;
  

  const mapUrl = `https://maps.google.com/maps?q=${lat},${lng}&hl=es&z=16&output=embed`;

  return (
    <section className="w-full bg-white py-8 lg:py-12">
      <div className="w-full relative px-0">
        

        <div className="text-center mb-6 lg:mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 tracking-tight uppercase">Ubicación</h2>
          <div className="h-1 w-16 lg:w-20 bg-amber-600 mx-auto mt-2 rounded-full"></div>
        </div>


        <div className="relative w-full shadow-xl lg:shadow-2xl bg-gray-50 border-y border-gray-200 flex flex-col lg:block">
          

          <div className="w-full h-[400px] lg:h-[550px]">
            <iframe
              title="Ubicación Hotel"
              src={mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="filter contrast-[1.05]"
            ></iframe>
          </div>


          <div className="
            relative w-full bg-white p-6 border-t border-gray-200
            lg:absolute lg:top-10 lg:right-10 lg:w-auto lg:max-w-sm lg:rounded-2xl lg:border-none lg:bg-white/95 lg:backdrop-blur-md lg:shadow-2xl
          ">
            <div className="flex items-center mb-4">
              <div className="bg-amber-100 p-2 rounded-lg mr-3">
                <span className="text-2xl">🏨</span>
              </div>
              <div>
                <h3 className="text-lg lg:text-xl font-bold text-gray-900 leading-tight">Hotel Varyna Inn</h3>
                <p className="text-xs text-amber-600 font-bold uppercase tracking-wider">Barinas, Venezuela</p>
              </div>
            </div>
            
            <p className="text-gray-600 text-sm mb-5 leading-relaxed">
              Ubicado estratégicamente en la <strong>Av. 23 de Enero</strong>, sector céntrico cerca del Parque La Federación.
            </p>
            
            <div className="space-y-3 mb-6 border-t border-gray-100 pt-4">
              <div className="flex items-center text-sm text-gray-700">
                <span className="mr-3 text-amber-600">📍</span> 
                <span>Av. 23 de Enero, Barinas 5201.</span>
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <span className="mr-3 text-amber-600">⭐</span> 
                <span>4.6 (Excelente ubicación)</span>
              </div>
            </div>

            <a 
              href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-amber-600 hover:bg-amber-700 text-white text-center py-3 lg:py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-amber-200 active:scale-95"
            >
              CÓMO LLEGAR
            </a>
          </div>

        </div>
      </div>
    </section>
  );
};

export default UbicacionMap;