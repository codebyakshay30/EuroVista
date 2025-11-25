
import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, Cloud, Sun, Info, Calendar, DollarSign, Languages, 
  Heart, Home, ArrowRight, User, Plane, Check, Volume2, Search, ArrowLeft, Loader2,
  Mic, Camera, Shirt, Watch, Ticket, X, CreditCard, Building2, ExternalLink, QrCode, ShoppingBag
} from 'lucide-react';
import { getLiveCityData, generateTripPlan, calculateBudget, translatePhrase } from './services/geminiService';
import { fetchCityImage } from './services/wikiService';
import { CityDetails, TripPlan, BudgetResult, AppView, POPULAR_CITIES, ItineraryItem, Attraction } from './types';
import { GlassCard, SectionTitle, LoadingScreen, Button } from './components/Components';

// --- SUB-COMPONENTS ---

const SplashScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden p-6 text-center">
    {/* Cinematic Background */}
    <div className="absolute inset-0 z-0">
        <img 
            src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1200&auto=format&fit=crop" 
            alt="Swiss Alps Travel" 
            className="w-full h-full object-cover opacity-30 scale-105 animate-float"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-indigo-900/90 to-indigo-950"></div>
    </div>

    {/* Background Elements */}
    <div className="absolute top-10 left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-pulse z-10"></div>
    <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-700 z-10"></div>
    
    {/* 3D Character & Floating Pictures */}
    <div className="relative w-72 h-72 mb-10 z-20">
      <div className="absolute inset-0 bg-gradient-to-tr from-orange-400/30 to-purple-500/30 rounded-full blur-2xl animate-pulse"></div>
      
      {/* Main Character */}
      <img 
        src="https://cdn3d.iconscout.com/3d/premium/thumb/traveler-5736768-4819777.png?f=webp" 
        onError={(e) => {
            (e.target as HTMLImageElement).src = "https://cdn3d.iconscout.com/3d/premium/thumb/travel-bag-3d-icon-download-in-png-blend-fbx-gltf-file-formats--luggage-vacation-summer-pack-holidays-icons-5431682.png"
        }}
        alt="Travel Character" 
        className="w-full h-full object-contain relative z-10 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-float"
      />

      {/* Floating Polaroid: Paris */}
      <div className="absolute top-0 right-0 w-20 h-24 bg-white p-1 shadow-lg transform rotate-12 animate-float" style={{ animationDelay: '1.5s' }}>
          <img src="https://images.unsplash.com/photo-1499856871940-a09627c6dcf6?q=80&w=200" className="w-full h-16 object-cover mb-1 bg-gray-200" alt="Paris" />
          <div className="h-1 bg-gray-100 rounded-full w-12 mx-auto"></div>
      </div>

       {/* Floating Polaroid: Rome */}
      <div className="absolute bottom-4 left-0 w-20 h-24 bg-white p-1 shadow-lg transform -rotate-12 animate-float" style={{ animationDelay: '2.5s' }}>
          <img src="https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=200" className="w-full h-16 object-cover mb-1 bg-gray-200" alt="Rome" />
          <div className="h-1 bg-gray-100 rounded-full w-12 mx-auto"></div>
      </div>

       {/* Floating Polaroid: London */}
      <div className="absolute top-10 -left-4 w-16 h-20 bg-white p-1 shadow-lg transform -rotate-6 animate-float" style={{ animationDelay: '0.5s' }}>
          <img src="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=200" className="w-full h-12 object-cover mb-1 bg-gray-200" alt="London" />
          <div className="h-1 bg-gray-100 rounded-full w-8 mx-auto"></div>
      </div>

      {/* Floating Icons */}
      <div className="absolute -top-6 left-1/2 bg-white/10 backdrop-blur-md p-3 rounded-full animate-bounce border border-white/20 shadow-lg">✈️</div>
      <div className="absolute bottom-0 right-8 bg-white/10 backdrop-blur-md p-3 rounded-full animate-bounce delay-300 border border-white/20 shadow-lg">📸</div>
    </div>

    <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-indigo-200 mb-4 tracking-tighter relative z-20 drop-shadow-sm">
      EUROVISTA
    </h1>
    <p className="text-blue-200/80 text-lg mb-10 max-w-sm mx-auto leading-relaxed relative z-20 font-medium">
      Your premium AI companion for the ultimate European summer.
    </p>

    <div className="flex flex-col gap-4 w-full max-w-xs relative z-20">
      <Button onClick={onStart} className="bg-white text-indigo-900 hover:bg-blue-50">Explore Europe <ArrowRight size={18} /></Button>
    </div>
  </div>
);

const NavBar: React.FC<{ current: AppView; onChange: (v: AppView) => void }> = ({ current, onChange }) => {
  const items = [
    { id: AppView.HOME, icon: Home, label: 'Explore' },
    { id: AppView.PLANNER, icon: Calendar, label: 'Plan' },
    { id: AppView.BUDGET, icon: DollarSign, label: 'Budget' },
    { id: AppView.TRANSLATOR, icon: Languages, label: 'Speak' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 z-40">
      <div className="glass-panel mx-auto max-w-md rounded-2xl flex justify-between items-center p-2 shadow-2xl bg-indigo-900/80">
        {items.map((item) => {
          const isActive = current === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`flex flex-col items-center justify-center w-full py-2 rounded-xl transition-all duration-300 ${isActive ? 'bg-white/20 text-white scale-105' : 'text-white/60 hover:text-white'}`}
            >
              <item.icon size={20} className={isActive ? 'stroke-2' : 'stroke-1.5'} />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

interface BookingOverlayProps { 
    city: string; 
    attractions: Attraction[]; 
    onClose: () => void; 
    initialTab?: 'attractions' | 'flights' | 'hotels';
    selectedAttraction?: Attraction | null;
}

const BookingOverlay: React.FC<BookingOverlayProps> = ({ city, attractions, onClose, initialTab = 'attractions', selectedAttraction = null }) => {
  const [activeTab, setActiveTab] = useState<'attractions' | 'flights' | 'hotels'>(initialTab);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [tickets, setTickets] = useState<string[]>([]); // Store multiple tickets
  const [viewState, setViewState] = useState<'list' | 'checkout' | 'success'>(selectedAttraction ? 'checkout' : 'list');
  const [checkoutItem, setCheckoutItem] = useState<Attraction | null>(selectedAttraction);
  const [originCity, setOriginCity] = useState('');

  const initiateCheckout = (attraction: Attraction) => {
      setCheckoutItem(attraction);
      setViewState('checkout');
  };

  const confirmPurchase = () => {
      if (!checkoutItem) return;
      setPurchasing(checkoutItem.name);
      setTimeout(() => {
          setPurchasing(null);
          setTickets(prev => [...prev, checkoutItem.name]);
          setViewState('success');
      }, 1500);
  };

  const handleExternalSearch = (type: 'flights' | 'hotels') => {
    if (type === 'flights') {
        const query = originCity ? `Flights from ${originCity} to ${city}` : `Flights to ${city}`;
        window.open(`https://www.google.com/travel/flights?q=${encodeURIComponent(query)}`, '_blank');
    } else {
        const query = `Hotels in ${city}`;
        window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
        <div className="bg-indigo-900/95 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-white/20 max-h-[85vh] flex flex-col animate-slide-up">
            {/* Header */}
            <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div>
                    <h3 className="text-xl font-bold text-white">
                        {viewState === 'checkout' ? 'Confirm Booking' : viewState === 'success' ? 'Booking Confirmed' : 'Book Your Trip'}
                    </h3>
                    <p className="text-xs text-white/60">
                         {viewState === 'checkout' ? checkoutItem?.name : `Tickets, Flights & Stays for ${city}`}
                    </p>
                </div>
                <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20"><X size={20}/></button>
            </div>

            {/* Tabs (Only show in List View) */}
            {viewState === 'list' && (
                <div className="flex p-2 gap-2 bg-black/20 mx-4 mt-4 rounded-xl">
                    {(['attractions', 'flights', 'hotels'] as const).map(tab => (
                        <button 
                            key={tab} 
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === tab ? 'bg-white text-indigo-900 shadow-lg' : 'text-white/60 hover:text-white'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            )}

            {/* Content */}
            <div className="p-4 overflow-y-auto flex-1 hide-scrollbar">
                
                {/* --- CHECKOUT VIEW --- */}
                {viewState === 'checkout' && checkoutItem && (
                    <div className="p-2 animate-fade-in">
                         <div className="bg-white/10 rounded-2xl p-6 mb-6">
                            <h4 className="text-2xl font-bold mb-2">{checkoutItem.name}</h4>
                            <p className="text-white/60 text-sm mb-4">{checkoutItem.benefit}</p>
                            <div className="flex justify-between items-center pt-4 border-t border-white/10">
                                <span className="text-sm">Total Price</span>
                                <span className="text-xl font-mono text-green-300 font-bold">{checkoutItem.price}</span>
                            </div>
                         </div>
                         <div className="space-y-3">
                             <div className="flex gap-2 items-center text-sm text-white/60 bg-black/20 p-3 rounded-lg">
                                <CreditCard size={16}/> Instant Confirmation
                             </div>
                             <div className="flex gap-2 items-center text-sm text-white/60 bg-black/20 p-3 rounded-lg">
                                <Ticket size={16}/> Mobile Ticket
                             </div>
                         </div>
                         <div className="mt-8 flex gap-3">
                             <button onClick={() => setViewState('list')} className="flex-1 py-4 rounded-xl font-bold bg-white/10 hover:bg-white/20 text-white transition-colors">Cancel</button>
                             <Button onClick={confirmPurchase} className="flex-[2] bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-900/30">
                                 {purchasing ? <Loader2 className="animate-spin"/> : `Pay ${checkoutItem.price}`}
                             </Button>
                         </div>
                    </div>
                )}

                {/* --- SUCCESS VIEW --- */}
                {viewState === 'success' && checkoutItem && (
                    <div className="bg-white text-indigo-900 rounded-3xl p-6 text-center animate-fade-in mx-2 my-4 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                            <Check size={32} />
                        </div>
                        <h3 className="text-2xl font-bold mb-1">You're Going!</h3>
                        <p className="text-gray-500 mb-6 text-sm">Ticket confirmed for</p>
                        
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 mb-6 relative bg-gray-50">
                            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-r-2 border-dashed border-gray-200"></div>
                            <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-l-2 border-dashed border-gray-200"></div>
                            <h4 className="font-bold text-lg">{checkoutItem.name}</h4>
                            <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Adult Entry • {new Date().toLocaleDateString()}</p>
                        </div>
                        
                        <div className="flex justify-center mb-6">
                            <QrCode size={120} className="opacity-80"/>
                        </div>
                        
                        <Button onClick={() => setViewState('list')} className="w-full bg-indigo-900 text-white hover:bg-indigo-800">Done</Button>
                    </div>
                )}

                {/* --- LIST VIEW --- */}
                {viewState === 'list' && (
                    <>
                        {activeTab === 'attractions' && (
                            <div className="space-y-3">
                                {tickets.length > 0 && (
                                    <div className="mb-4 bg-green-500/20 border border-green-500/30 p-3 rounded-xl flex items-center gap-3">
                                        <div className="bg-green-500 rounded-full p-1"><Check size={12} className="text-white"/></div>
                                        <div>
                                            <p className="text-xs font-bold text-green-300 uppercase">My Tickets</p>
                                            <p className="text-sm text-white">{tickets.length} Confirmed</p>
                                        </div>
                                    </div>
                                )}
                                {attractions.length === 0 ? (
                                    <div className="text-center py-10 opacity-50">
                                        <Ticket size={48} className="mx-auto mb-2"/>
                                        <p>No attractions found to book.</p>
                                    </div>
                                ) : (
                                    attractions.map((att, i) => (
                                        <GlassCard key={i} className="flex justify-between items-center p-4 bg-white/5 hover:bg-white/10 border-0 group">
                                            <div>
                                                <h4 className="font-bold text-white group-hover:text-blue-200 transition-colors">{att.name}</h4>
                                                <p className="text-xs text-white/50">{att.benefit}</p>
                                                <span className="inline-block mt-2 text-xs font-mono bg-green-500/20 text-green-300 px-2 py-0.5 rounded">{att.price}</span>
                                            </div>
                                            <button 
                                                onClick={() => initiateCheckout(att)}
                                                className="bg-white text-indigo-900 px-4 py-2 rounded-xl text-sm font-bold shadow-lg hover:scale-105 active:scale-95 transition-all min-w-[80px] flex justify-center"
                                            >
                                                Book
                                            </button>
                                        </GlassCard>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'flights' && (
                            <div className="space-y-6 text-center py-4">
                                <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto text-blue-300 relative group">
                                    <Plane size={40} className="group-hover:rotate-45 transition-transform duration-500"/>
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold">Fly to {city}</h4>
                                    <p className="text-white/60 text-sm mt-2">Compare prices on Google Flights</p>
                                </div>

                                <div className="bg-white/5 p-4 rounded-xl text-left space-y-4">
                                    <div>
                                        <label className="text-xs uppercase text-white/40 font-bold tracking-wider mb-2 block">Origin (Optional)</label>
                                        <input 
                                            type="text" 
                                            placeholder="Where are you flying from?" 
                                            value={originCity}
                                            onChange={(e) => setOriginCity(e.target.value)}
                                            className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-indigo-400 transition-colors"
                                        />
                                    </div>
                                    <Button onClick={() => handleExternalSearch('flights')} className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-blue-900/50">
                                        Search Google Flights <ExternalLink size={16}/>
                                    </Button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'hotels' && (
                            <div className="space-y-6 text-center py-8">
                                <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto text-purple-300">
                                    <Building2 size={40} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold">Stay in {city}</h4>
                                    <p className="text-white/60 text-sm mt-2">Discover top-rated hotels and Airbnbs.</p>
                                </div>
                                <Button onClick={() => handleExternalSearch('hotels')} className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-purple-900/50">
                                    Find Hotels <ExternalLink size={16}/>
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    </div>
  );
};

const CityDetailView: React.FC<{ city: string; onBack: () => void }> = ({ city, onBack }) => {
  const [data, setData] = useState<CityDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [bookingTab, setBookingTab] = useState<'attractions' | 'flights' | 'hotels'>('attractions');
  const [selectedAttraction, setSelectedAttraction] = useState<Attraction | null>(null);

  useEffect(() => {
    let isMounted = true;
    getLiveCityData(city).then(res => {
      if (isMounted) {
        setData(res);
        setLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, [city]);

  const openBooking = (tab: 'attractions' | 'flights' | 'hotels', attraction: Attraction | null = null) => {
      setBookingTab(tab);
      setSelectedAttraction(attraction);
      setShowBooking(true);
  };

  if (loading) return <LoadingScreen message={`Exploring ${city}...`} />;
  if (!data) return <div className="p-8 text-center mt-20">Failed to load city data. <Button onClick={onBack} className="mt-4">Go Back</Button></div>;

  return (
    <div className="pb-28 animate-slide-up relative">
      {/* Booking Overlay */}
      {showBooking && (
          <BookingOverlay 
            city={city} 
            attractions={data.attractions} 
            onClose={() => setShowBooking(false)} 
            initialTab={bookingTab}
            selectedAttraction={selectedAttraction}
          />
      )}

      {/* Floating Book Button */}
      <div className="fixed bottom-24 right-6 z-30">
        <button 
            onClick={() => openBooking('attractions')}
            className="bg-white text-indigo-900 w-16 h-16 rounded-full shadow-2xl shadow-indigo-500/50 flex flex-col items-center justify-center transition-transform hover:scale-110 active:scale-95 border-4 border-indigo-100/50 group relative"
        >
            <Ticket size={24} className="mb-0.5 group-hover:rotate-12 transition-transform" />
            <span className="text-[10px] font-bold uppercase tracking-tight">Book</span>
        </button>
      </div>

      {/* Header Image Area */}
      <div className="relative h-96 w-full">
        <img 
          src={`https://source.unsplash.com/800x800/?${city},landmark`}
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${city}/800/800`
          }}
          className="w-full h-full object-cover rounded-b-[3rem] brightness-90 shadow-2xl"
          alt={city} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-950 via-transparent to-transparent rounded-b-[3rem]"></div>
        
        <button onClick={onBack} className="absolute top-6 left-6 p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors z-10 border border-white/10">
          <ArrowLeft size={24} />
        </button>

        {/* Header Actions */}
        <div className="absolute top-6 right-6 z-10">
            <button 
                onClick={() => window.open(`https://www.google.com/travel/flights?q=Flights+to+${encodeURIComponent(city)}`, '_blank')} 
                className="p-3 bg-blue-600/80 backdrop-blur-md rounded-full text-white hover:bg-blue-600 transition-colors border border-white/20 shadow-lg flex items-center justify-center"
            >
                <Plane size={24} />
            </button>
        </div>
        
        <div className="absolute bottom-8 left-8 right-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium border border-white/10 uppercase tracking-wider">Top Destination</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg tracking-tight">{city}</h1>
          <div className="flex items-center gap-2 text-blue-100/90">
            <MapPin size={18} />
            <span className="text-lg font-medium">Europe</span>
          </div>
        </div>
        
        {/* Weather Badge - Realtime via Gemini Search */}
        <div className="absolute bottom-8 right-8 glass-panel rounded-2xl p-4 flex flex-col items-center animate-float shadow-xl border border-white/20">
            <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]"></div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-green-200">Live Now</span>
            </div>
            <span className="text-3xl font-bold">{data.weather.temp}</span>
            <span className="text-xs opacity-80 whitespace-nowrap text-blue-100">{data.weather.condition}</span>
        </div>
      </div>

      <div className="px-6 py-8 space-y-10">
        {/* Intro */}
        <p className="text-white/80 leading-loose font-light text-lg">
          {data.intro}
        </p>

        {/* Style & Timing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GlassCard className="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border-white/10">
                 <div className="flex gap-4 items-start">
                    <div className="bg-indigo-500/20 p-3 rounded-2xl h-fit shrink-0"><Shirt className="text-indigo-300" size={24}/></div>
                    <div>
                       <h3 className="font-bold text-lg mb-1 text-indigo-100">What to Wear</h3>
                       <p className="text-sm text-white/70 leading-relaxed">{data.weather.packingSuggestion}</p>
                    </div>
                 </div>
            </GlassCard>
            <GlassCard className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-white/10">
                 <div className="flex gap-4 items-start">
                    <div className="bg-pink-500/20 p-3 rounded-2xl h-fit shrink-0"><Watch className="text-pink-300" size={24}/></div>
                    <div>
                       <h3 className="font-bold text-lg mb-1 text-pink-100">Best Time to Go</h3>
                       <p className="text-sm text-white/70 leading-relaxed">{data.bestTimeToVisit}</p>
                    </div>
                 </div>
            </GlassCard>
        </div>
        
        {/* Source Citation if available */}
        {data.sources && data.sources.length > 0 && (
            <div className="text-xs text-white/30 truncate max-w-full px-2">
            Data Source: {new URL(data.sources[0]).hostname}
            </div>
        )}

        {/* Attractions */}
        <section>
          <SectionTitle>Must See Places</SectionTitle>
          <div className="flex overflow-x-auto gap-4 pb-6 -mx-6 px-6 hide-scrollbar snap-x">
            {data.attractions.map((att, idx) => (
              <div key={idx} className="glass-card min-w-[240px] p-6 rounded-3xl snap-center hover:bg-white/20 transition-all border border-white/10 group">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center mb-4 text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
                  {idx + 1}
                </div>
                <h4 className="font-bold text-xl leading-tight mb-2 group-hover:text-blue-200 transition-colors">{att.name}</h4>
                <p className="text-sm text-white/60 leading-relaxed mb-4">{att.benefit}</p>
                <div className="flex justify-between items-center mt-auto border-t border-white/10 pt-4">
                     <span className="text-sm font-mono text-green-300">{att.price}</span>
                     <button 
                        onClick={() => openBooking('attractions', att)} 
                        className="text-xs font-bold uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full hover:bg-white text-white hover:text-indigo-900 transition-colors"
                     >
                        Book
                     </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Vibe Check Gallery */}
        <section>
          <SectionTitle>Vibe Check</SectionTitle>
          <div className="grid grid-cols-2 gap-3 h-52 rounded-2xl overflow-hidden shadow-2xl">
             <div className="relative group overflow-hidden">
                <img src={`https://source.unsplash.com/400x400/?${city},street`} 
                     onError={(e) => (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${city}street/400/400`}
                     className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Street" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
             </div>
             <div className="grid grid-rows-2 gap-3">
                <div className="relative group overflow-hidden rounded-tr-2xl">
                    <img src={`https://source.unsplash.com/400x200/?${city},food`} 
                         onError={(e) => (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${city}food/400/200`}
                         className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Food" />
                </div>
                <div className="relative group overflow-hidden rounded-br-2xl">
                    <img src={`https://source.unsplash.com/400x200/?${city},night`} 
                         onError={(e) => (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${city}night/400/200`}
                         className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Night" />
                </div>
             </div>
          </div>
        </section>

        {/* Map Context */}
        <section>
          <SectionTitle>The Neighborhood</SectionTitle>
          <GlassCard className="relative overflow-hidden p-0">
             <div className="absolute inset-0 bg-blue-900/50 z-0"></div>
            <div className="relative z-10 p-6 flex gap-4">
              <div className="bg-white/10 p-3 rounded-full h-fit"><MapPin className="text-red-400" size={24}/></div>
              <p className="text-sm text-white/80 leading-relaxed pt-1">{data.mapContext}</p>
            </div>
          </GlassCard>
        </section>

        {/* Itinerary */}
        <section>
          <SectionTitle>Perfect Day Itinerary</SectionTitle>
          <div className="relative border-l-2 border-white/10 ml-4 space-y-10 pb-4 mt-2">
            {Object.entries(data.itinerary).map(([period, item]) => {
              const it = item as ItineraryItem;
              return (
                <div key={period} className="pl-10 relative group">
                  <div className="absolute -left-[11px] top-1 w-6 h-6 rounded-full bg-indigo-500 border-4 border-indigo-950 shadow-lg shadow-indigo-500/50 group-hover:scale-125 transition-transform"></div>
                  <span className="text-xs uppercase tracking-wider text-indigo-300 font-bold bg-indigo-900/50 px-2 py-1 rounded-md">{period} • {it.time}</span>
                  <h4 className="font-bold text-xl mt-2 text-white">{it.activity}</h4>
                  <p className="text-sm text-white/60 mt-2 leading-relaxed">{it.description}</p>
                  <div className="mt-3 text-xs bg-white/5 inline-flex px-3 py-1.5 rounded-lg text-emerald-300 items-center gap-1 border border-white/5">
                    <DollarSign size={12} /> {it.estimatedCost}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Tips */}
        <section>
          <SectionTitle>Traveler Intel</SectionTitle>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Travel', icon: Plane, text: data.tips.travel, color: 'text-blue-300', bg: 'bg-blue-500/10' },
              { label: 'Food', icon: Info, text: data.tips.food, color: 'text-orange-300', bg: 'bg-orange-500/10' },
              { label: 'Safety', icon: Check, text: data.tips.safety, color: 'text-red-300', bg: 'bg-red-500/10' },
              { label: 'Culture', icon: Heart, text: data.tips.culture, color: 'text-pink-300', bg: 'bg-pink-500/10' },
            ].map((tip, i) => (
              <GlassCard key={i} className="p-5 hover:bg-white/15 transition-colors border-0">
                <div className={`w-10 h-10 ${tip.bg} rounded-full flex items-center justify-center mb-3`}>
                    <tip.icon size={20} className={tip.color} />
                </div>
                <h5 className="font-semibold text-sm mb-2">{tip.label}</h5>
                <p className="text-xs text-white/60 leading-relaxed">{tip.text}</p>
              </GlassCard>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

const PlannerView: React.FC = () => {
  const [formData, setFormData] = useState({ destination: 'Italy', days: 5, budget: 'Mid-range', interests: 'Food & History' });
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await generateTripPlan(formData.destination, formData.days, formData.budget, formData.interests);
      setPlan(res);
    } catch (e) {
      alert("AI Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen message="Designing your dream trip..." />;

  if (plan) {
    return (
      <div className="p-6 pb-28 animate-slide-up">
        <div className="flex justify-between items-center mb-6 mt-4">
          <SectionTitle>Your Itinerary</SectionTitle>
          <button onClick={() => setPlan(null)} className="text-sm text-indigo-300 underline font-medium">Start Over</button>
        </div>
        <GlassCard className="mb-6 bg-gradient-to-r from-indigo-600/40 to-purple-600/40 border-none relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <h2 className="text-3xl font-bold relative z-10">{plan.destination}</h2>
          <p className="opacity-80 relative z-10 mt-1">Total Est. Cost: {plan.totalCost}</p>
        </GlassCard>

        <div className="space-y-4">
           {plan.dailyBreakdown.map((item, idx) => (
             <GlassCard key={idx} className="flex gap-4 items-start">
               <div className="bg-white/10 p-2 rounded-lg font-mono text-xs font-bold whitespace-nowrap text-center min-w-[60px]">
                 {item.time}
               </div>
               <div>
                 <h4 className="font-bold text-lg leading-tight">{item.activity}</h4>
                 <p className="text-sm text-white/70 mt-1">{item.description}</p>
                 <span className="text-xs text-green-300 block mt-2 font-medium">{item.estimatedCost}</span>
               </div>
             </GlassCard>
           ))}
        </div>
        
        <div className="mt-8">
           <h3 className="font-bold mb-4 text-yellow-200 text-lg flex items-center gap-2"><Sun size={20}/> Pro Tips</h3>
           <ul className="space-y-3">
             {plan.tips.map((tip, i) => (
                <li key={i} className="flex gap-3 text-sm text-white/80 bg-white/5 p-3 rounded-xl">
                    <Check size={16} className="text-green-400 shrink-0 mt-0.5" />
                    {tip}
                </li>
             ))}
           </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 pb-28 animate-slide-up mt-4">
      <h2 className="text-3xl font-bold mb-2">Trip Planner</h2>
      <p className="text-white/60 mb-8">AI-curated plans tailored to your style.</p>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2 ml-1 text-white/80">Where to?</label>
          <input 
            type="text" 
            value={formData.destination} 
            onChange={e => setFormData({...formData, destination: e.target.value})}
            className="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-white placeholder-white/40 focus:outline-none focus:border-indigo-400 transition-colors"
          />
        </div>
        
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2 ml-1 text-white/80">Duration (Days)</label>
            <input 
              type="number" 
              value={formData.days} 
              onChange={e => setFormData({...formData, days: parseInt(e.target.value)})}
              className="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-white focus:outline-none focus:border-indigo-400 transition-colors"
            />
          </div>
          <div className="flex-1">
             <label className="block text-sm font-medium mb-2 ml-1 text-white/80">Budget Style</label>
             <select 
                value={formData.budget}
                onChange={e => setFormData({...formData, budget: e.target.value})}
                className="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-white focus:outline-none appearance-none focus:border-indigo-400 transition-colors"
             >
               <option className="text-black" value="Backpacker">Backpacker</option>
               <option className="text-black" value="Mid-range">Mid-range</option>
               <option className="text-black" value="Luxury">Luxury</option>
             </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 ml-1 text-white/80">Interests & Vibes</label>
          <textarea 
            value={formData.interests} 
            onChange={e => setFormData({...formData, interests: e.target.value})}
            placeholder="e.g. Art, Food, Nightlife, Hiking..."
            className="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-white h-32 focus:outline-none focus:border-indigo-400 transition-colors resize-none"
          />
        </div>

        <Button onClick={handleGenerate} className="w-full mt-4 text-lg py-4">
           Generate My Plan
        </Button>
      </div>
    </div>
  );
};

const BudgetView: React.FC = () => {
    const [result, setResult] = useState<BudgetResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ dest: 'Europe', days: 7, style: 'Mid-range' });
    
    const calculate = async () => {
        setLoading(true);
        const res = await calculateBudget(formData.dest, formData.days, formData.style);
        setResult(res);
        setLoading(false);
    };

    return (
        <div className="p-6 pb-28 animate-slide-up mt-4">
            <h2 className="text-3xl font-bold mb-6">Budget Calc</h2>
            {!result ? (
                <div className="space-y-6">
                    <div className="text-center py-6">
                        <div className="bg-white/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/20">
                            <DollarSign size={36} className="text-green-300" />
                        </div>
                        <p className="mb-2 opacity-70">Estimate costs for your next trip.</p>
                    </div>

                    <div className="space-y-4">
                        <input 
                            type="text" placeholder="Destination" 
                            className="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-white"
                            value={formData.dest} onChange={e => setFormData({...formData, dest: e.target.value})}
                        />
                         <div className="flex gap-4">
                            <input 
                                type="number" placeholder="Days" 
                                className="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-white"
                                value={formData.days} onChange={e => setFormData({...formData, days: parseInt(e.target.value)})}
                            />
                            <select 
                                className="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-white appearance-none"
                                value={formData.style} onChange={e => setFormData({...formData, style: e.target.value})}
                            >
                                <option className="text-black" value="Backpacker">Backpacker</option>
                                <option className="text-black" value="Mid-range">Mid-range</option>
                                <option className="text-black" value="Luxury">Luxury</option>
                            </select>
                        </div>
                    </div>

                    <Button onClick={calculate} disabled={loading} className="w-full mt-4">
                        {loading ? 'Crunching Numbers...' : 'Calculate Estimate'}
                    </Button>
                </div>
            ) : (
                <div className="space-y-6">
                    <GlassCard className="text-center py-10 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-600"></div>
                        <span className="text-sm opacity-60 uppercase tracking-widest font-semibold">Total Estimated</span>
                        <div className="text-5xl font-bold text-green-300 my-4 tracking-tight">{result.totalCost}</div>
                        <div className="text-sm opacity-60 bg-white/10 inline-block px-3 py-1 rounded-full">Avg. {result.perDay} / day</div>
                    </GlassCard>
                    <SectionTitle>Saving Tips</SectionTitle>
                    <div className="space-y-3">
                        {result.savingTips.map((tip, i) => (
                            <GlassCard key={i} className="py-4 px-4 flex gap-4 items-start border-l-4 border-l-green-400">
                                <span className="text-sm leading-relaxed">{tip}</span>
                            </GlassCard>
                        ))}
                    </div>
                    <Button onClick={() => setResult(null)} variant="secondary" className="w-full mt-4">
                        Calculate Another
                    </Button>
                </div>
            )}
        </div>
    );
};

const TranslatorView: React.FC = () => {
    const [text, setText] = useState('');
    const [translated, setTranslated] = useState('');
    const [targetLang, setTargetLang] = useState('French');
    const [loading, setLoading] = useState(false);

    const commonPhrases = [
        "Hello", "Thank you", "How much?", "Where is the bathroom?", "Delicious!", "Help me"
    ];

    const handleTranslate = async (phrase?: string) => {
        const txt = phrase || text;
        if (!txt) return;
        setLoading(true);
        if (phrase) setText(phrase);
        const res = await translatePhrase(txt, targetLang);
        setTranslated(res);
        setLoading(false);
    };

    const speak = () => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(translated);
            // Try to set voice based on lang
            const langMap: {[key:string]: string} = { 'French': 'fr-FR', 'Spanish': 'es-ES', 'Italian': 'it-IT', 'German': 'de-DE' };
            utterance.lang = langMap[targetLang] || 'en-US';
            window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <div className="p-6 pb-28 animate-slide-up mt-4">
            <h2 className="text-3xl font-bold mb-6">Translator</h2>
            
            {/* Lang Selector */}
            <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar mb-4">
                {['French', 'Spanish', 'Italian', 'German'].map(lang => (
                    <button 
                        key={lang}
                        onClick={() => setTargetLang(lang)}
                        className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${targetLang === lang ? 'bg-white text-indigo-900 font-bold' : 'bg-white/10 text-white/60'}`}
                    >
                        {lang}
                    </button>
                ))}
            </div>

            <div className="relative mb-6">
                <textarea 
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type to translate..."
                    className="w-full h-32 bg-white/10 rounded-2xl p-4 pr-12 text-lg focus:outline-none focus:bg-white/20 transition-colors resize-none"
                />
                <button onClick={() => handleTranslate()} className="absolute bottom-4 right-4 p-2 bg-indigo-500 rounded-full shadow-lg">
                    {loading ? <Loader2 className="animate-spin" size={20}/> : <ArrowRight size={20}/>}
                </button>
            </div>

            {translated && (
                <GlassCard className="mb-8 border-indigo-400/30 bg-indigo-900/40">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs uppercase tracking-widest opacity-50">{targetLang}</span>
                        <button onClick={speak} className="p-2 -mr-2 -mt-2 hover:bg-white/10 rounded-full">
                            <Volume2 size={20} className="text-blue-300"/>
                        </button>
                    </div>
                    <p className="text-2xl font-medium">{translated}</p>
                </GlassCard>
            )}

            <SectionTitle>Quick Phrases</SectionTitle>
            <div className="flex flex-wrap gap-3">
                {commonPhrases.map((phrase, i) => (
                    <button 
                        key={i} 
                        onClick={() => handleTranslate(phrase)}
                        className="bg-white/5 hover:bg-white/20 border border-white/10 rounded-xl px-4 py-3 text-sm transition-all"
                    >
                        {phrase}
                    </button>
                ))}
            </div>
        </div>
    );
};

const TRAVEL_VIBES = [
  { title: "Window Seat", image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=600&auto=format&fit=crop" },
  { title: "Departure", image: "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?q=80&w=600&auto=format&fit=crop" },
  { title: "Adventure", image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=600&auto=format&fit=crop" },
  { title: "Sky High", image: "https://images.unsplash.com/photo-1542296332-2e4426582ad7?q=80&w=600&auto=format&fit=crop" },
  { title: "Coffee & Passport", image: "https://images.unsplash.com/photo-1484807352052-23338990c6c6?q=80&w=600&auto=format&fit=crop" },
];

const CityCard: React.FC<{ city: typeof POPULAR_CITIES[0]; onSelect: (name: string) => void }> = ({ city, onSelect }) => {
  const [imageUrl, setImageUrl] = useState<string>(city.image); // Start with fallback

  useEffect(() => {
    let mounted = true;
    fetchCityImage(city.name).then((url) => {
      if (mounted && url) {
        setImageUrl(url);
      }
    });
    return () => { mounted = false; };
  }, [city.name]);

  return (
    <div 
        onClick={() => onSelect(city.name)}
        className="group relative h-72 rounded-[2rem] overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 transform hover:-translate-y-1"
    >
        <img src={imageUrl} alt={city.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/80 via-transparent to-transparent"></div>
        <div className="absolute bottom-6 left-6">
            <h3 className="text-3xl font-bold mb-1 leading-tight">{city.name}</h3>
            <p className="text-sm text-white/80 flex items-center gap-1 font-medium bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg w-fit"><MapPin size={12}/> {city.country}</p>
        </div>
        <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <ArrowRight size={20} className="text-white"/>
        </div>
    </div>
  );
};

const HomeView: React.FC<{ onSelectCity: (city: string) => void }> = ({ onSelectCity }) => {
    return (
        <div className="pb-28 animate-slide-up">
            <div className="p-6 pt-12">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-4xl font-bold mb-1">Explore <br/><span className="text-blue-300">Europe</span></h1>
                        <p className="text-white/60">Find your next adventure.</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
                         <User size={24} className="text-white/80"/>
                    </div>
                </div>
                
                {/* Search Bar Visual */}
                <div className="relative mb-8 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-white transition-colors" size={20}/>
                    <input type="text" placeholder="Search destinations..." className="w-full bg-white/10 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:bg-white/20 transition-all placeholder-white/30 text-white" />
                </div>

                {/* Travel Vibes Gallery */}
                <section className="mb-10">
                    <SectionTitle>In The Air</SectionTitle>
                    <div className="flex overflow-x-auto gap-4 pb-4 -mx-6 px-6 hide-scrollbar snap-x">
                        {TRAVEL_VIBES.map((vibe, i) => (
                            <div key={i} className="min-w-[140px] h-[200px] rounded-2xl overflow-hidden relative snap-center group shadow-lg">
                                <img src={vibe.image} alt={vibe.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <span className="absolute bottom-3 left-3 font-medium text-sm text-white/90">{vibe.title}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <SectionTitle>Trending Now</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {POPULAR_CITIES.map((city, i) => (
                        <CityCard key={i} city={city} onSelect={onSelectCity} />
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- MAIN APP ---

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.SPLASH);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setView(AppView.CITY_DETAIL);
  };

  const renderView = () => {
    switch(view) {
        case AppView.SPLASH:
            return <SplashScreen onStart={() => setView(AppView.HOME)} />;
        case AppView.HOME:
            return <HomeView onSelectCity={handleCitySelect} />;
        case AppView.CITY_DETAIL:
            return selectedCity ? <CityDetailView city={selectedCity} onBack={() => setView(AppView.HOME)} /> : <HomeView onSelectCity={handleCitySelect} />;
        case AppView.PLANNER:
            return <PlannerView />;
        case AppView.BUDGET:
            return <BudgetView />;
        case AppView.TRANSLATOR:
            return <TranslatorView />;
        default:
            return <HomeView onSelectCity={handleCitySelect} />;
    }
  };

  return (
    <div className="min-h-screen text-white font-sans selection:bg-indigo-500 selection:text-white">
      {renderView()}
      {view !== AppView.SPLASH && (
        <NavBar current={view === AppView.CITY_DETAIL ? AppView.HOME : view} onChange={setView} />
      )}
    </div>
  );
};

export default App;
